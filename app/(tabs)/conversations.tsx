import ScenarioCard from "@/components/conversations/ScenarioCard";
import { Paywall } from "@/components/subscription/paywall";
import { ThemedText } from "@/components/themed-text";
import { COURSE_DATA } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { isScenarioUnlocked } from "@/lib/conversationApi";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationsScreen() {
  const router = useRouter();
  const { isPremium } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleScenarioPress = (scenarioId: string, isFree: boolean) => {
    const unlocked = isScenarioUnlocked(isFree, isPremium);
    if (!unlocked) {
      setPaywallVisible(true);
      return;
    }
    router.push({
      pathname: "/conversation",
      params: { scenarioId },
    });
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.safe}
    >
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Roleplays
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Practice real-world Spanish conversations with AI
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {COURSE_DATA.scenarios.map((scenario) => {
          const locked = !isScenarioUnlocked(scenario.isFree, isPremium);
          return (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              locked={locked}
              onPress={() => handleScenarioPress(scenario.id, scenario.isFree)}
            />
          );
        })}
      </ScrollView>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.subduedTextColor,
    lineHeight: 20,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
});
