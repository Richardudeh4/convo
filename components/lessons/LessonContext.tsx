import { Question } from "@/constants/CourseData";
import { Animated, StyleSheet, Text, View } from "react-native";
import ProgressHeader from "./ProgressHeader";
import { speakMandarin } from "@/lib/mandarinSpeech";
import { useCallback, useMemo, useRef, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import AudioPrompt from "./AudioPrompt";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { recordQuestionListened } from "@/lib/speakingListeningStats";

interface WrongQuestion {
  english: string;
  mandarin: {
    hanzi: string;
    pinyin: string;
  };
  attempts: number;
}

export interface LessonStats {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  wrongQuestions?: number;
}
export default function LessonContent({lessonId, questions}: {lessonId: string, questions: Question[]} ){
const router = useRouter();
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
const [showMandarin, setShowMandarin] = useState(false);
const [selectedOption, setSelectedOption] = useState<number | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [showresult, setShowResult] = useState(false);
const [hasListenedToAudio, setHasListenedToAudio] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
const [attemptCount, setAttemptCount] = useState(0);
const [isRecognizing, setIsRecognizing] = useState(false);
const recordingRef = useRef<Audio.Recording | null>(null);
const [transcription, setTranscription] = useState<{expected: string, sing: string} | null>(null);
const currentQuestion = useMemo(() => questions[currentQuestionIndex], [ questions,currentQuestionIndex],);
const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
const isSpeechPlayingRef = useRef(false);

//Lesson completion
const [showCompleteScreen, setShowCompleteScreen] = useState(false);
const [lessonStats, setLessonStats] = useState<LessonStats | null>(null)
const [questionAttempts, setQuestionAttempts] = useState<Record<number, number>>({});
const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());

const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;
const optionsAminValue = useRef(new Animated.Value(0)).current;
const audioSectionAnimValue = useRef(new Animated.Value(400)).current;
const optionSelectionAnimation = useRef(new Animated.Value(0)).current;
const instructionOpacity = useRef(new Animated.Value(1)).current;
const listeningOpacity = useRef(new Animated.Value(0)).current;
const listeningScale = useRef(new Animated.Value(0.8)).current;
const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false);
const audioSectionAnimHeight = useRef(new Animated.Value(400)).current;

const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

const finishedListening = () => {
  if (hasListenedToAudio) return;
  setHasListenedToAudio(true);
  setIsSpeechPlaying(false);
  void recordQuestionListened();
  Animated.parallel([
    Animated.timing(
      audioSectionAnimHeight,{
        toValue: 200,
        duration: 800,
        useNativeDriver: false
      }
    ),
    Animated.timing(optionsAminValue, {
      toValue: 1,
      duration: 800, 
      delay: 200,
      useNativeDriver: true,
    })
  ]).start();
}

const setSpeechPlaying = useCallback((playing: boolean) => {
  isSpeechPlayingRef.current = playing;
  setIsSpeechPlaying(playing);
}, []);

const playAudio = useCallback(async () => {
  if (isSpeechPlayingRef.current) {
    await Speech.stop();
    setSpeechPlaying(false);
    return;
  }

  const { hanzi, pinyin } = currentQuestion.mandarin;
  setSpeechPlaying(true);

  try {
    await speakMandarin(hanzi, pinyin, {
      onDone: () => {
        setSpeechPlaying(false);
        finishedListening();
      },
      onStopped: () => setSpeechPlaying(false),
      onError: (error) => {
        console.error("Error playing audio:", error);
        setSpeechPlaying(false);
      },
    });
  } catch (error) {
    console.error("All speech attempts failed:", error);
    setSpeechPlaying(false);
  }
}, [currentQuestion, setSpeechPlaying]);
const handleRevealMandarin = () => {
  if (showMandarin){
    Animated.timing(
      fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }
    ).start(() => setShowMandarin(false));
  }
  else{
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }
}
   
    return (
        <View style={styles.container}>
            <ConfirmDialog
            visible={exitConfirmVisible}
            title="Exit Lesson"
            description="Are you sure you want to exit the lesson? You will lose your progress."
            confirmLabel="Exit"
            cancelLabel="Cancel"
            onConfirm={() => {
              setExitConfirmVisible(false);
              router.push("/lessons");
            }}
            onCancel={() => setExitConfirmVisible(false)}
            destructive={true}
            />
<ProgressHeader progress={progress} currentCount={currentQuestionIndex + 1} totalCount={questions.length} onClose={() => setExitConfirmVisible(true)} />
  <View style={styles.content}>
<Animated.View style={[styles.audioSection, {backgroundColor: "#f9fafb", minHeight:audioSectionAnimValue,
   flex: hasListenedToAudio? 0 : 1 , justifyContent: "center", opacity: isLoading || showresult ? 0.6 : 1}]}
   pointerEvents={isLoading || showresult ? "none" : "auto"}
   >
<AudioPrompt
isPlaying={isSpeechPlaying}
isRecognizing={isRecognizing}
hasListenedToAudio={hasListenedToAudio}
onPlay={playAudio}
onStartRecord={() => setIsRecognizing(true)}
onStopRecord={() => setIsRecognizing(false)}
onRevealMadarin={handleRevealMandarin}
currentQuestion={currentQuestion}
showMandarin={showMandarin}
selectedOption={selectedOption}
scaleAmin={scaleAnim}
instructionOpacity={instructionOpacity}
listeningOpacity={listeningOpacity}
listeningScale={listeningScale}
fadeAnim={fadeAnim}
/>

</Animated.View> 

  </View>
        </View>
    )
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    audioSection: {
      alignItems: "center",
      marginBottom: 40,
      padding: 20,
      borderRadius: 16,
      marginTop: 20,
    },
    optionsSection: {
      flex: 1,
      marginBottom: 30,
    },
    bottomSection: {
      marginBottom: 20,
    },
    loadingContainer: {
      alignItems: "center",
      padding: 20,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },
    feedbackWrapper: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
      zIndex: 1000,
    },
  });