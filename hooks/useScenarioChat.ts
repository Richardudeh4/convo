import { ConversationScenario } from "@/constants/CourseData";
import {
  ChatMessage,
  invokeScenarioChat,
  ScenarioChatResponse,
} from "@/lib/conversationApi";
import { recordConversationTurn } from "@/lib/speakingListeningStats";
import { recordActivity } from "@/lib/streak";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_TURNS = 30;

export function useScenarioChat(scenario: ConversationScenario | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const startingRef = useRef(false);
  const completedTasksRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    completedTasksRef.current = completedTasks;
  }, [completedTasks]);

  const mergeTasks = useCallback((indexes: number[]) => {
    if (indexes.length === 0) return;
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      indexes.forEach((i) => next.add(i));
      return next;
    });
  }, []);

  const getCompletedIndexes = useCallback(
    () => [...completedTasksRef.current],
    [],
  );

  const applyResponse = useCallback(
    async (response: ScenarioChatResponse, userMsg?: string) => {
      if (userMsg) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: userMsg },
        ]);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.reply,
          english: response.english,
          romanization: response.romanization,
        },
      ]);

      mergeTasks(response.completedTaskIndexes);
      setConversationComplete(response.conversationComplete);
      await recordConversationTurn();
      void recordActivity();
    },
    [mergeTasks],
  );

  const startConversation = useCallback(async () => {
    if (!scenario || startingRef.current || hasStarted) return;
    startingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await invokeScenarioChat({
        scenarioId: scenario.id,
        messages: [],
        startConversation: true,
        completedTaskIndexes: getCompletedIndexes(),
      });
      await applyResponse(response);
      setHasStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start conversation");
    } finally {
      setIsLoading(false);
      startingRef.current = false;
    }
  }, [scenario, hasStarted, applyResponse, getCompletedIndexes]);

  useEffect(() => {
    if (scenario && !hasStarted && !startingRef.current) {
      void startConversation();
    }
  }, [scenario, hasStarted, startConversation]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!scenario || isLoading || conversationComplete) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      const userTurnCount = messages.filter((m) => m.role === "user").length;
      if (userTurnCount >= MAX_TURNS) {
        setError("Turn limit reached for this session.");
        return;
      }

      setIsLoading(true);
      setError(null);

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await invokeScenarioChat({
          scenarioId: scenario.id,
          messages: history,
          userMessage: trimmed,
          completedTaskIndexes: getCompletedIndexes(),
        });
        await applyResponse(response, trimmed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [scenario, isLoading, conversationComplete, messages, applyResponse, getCompletedIndexes],
  );

  const retryStart = useCallback(() => {
    setHasStarted(false);
    setMessages([]);
    setCompletedTasks(new Set());
    setConversationComplete(false);
    setError(null);
    startingRef.current = false;
    void startConversation();
  }, [startConversation]);

  return {
    messages,
    completedTasks,
    isLoading,
    error,
    conversationComplete,
    hasStarted,
    sendMessage,
    retryStart,
    turnCount: messages.filter((m) => m.role === "user").length,
    maxTurns: MAX_TURNS,
  };
}
