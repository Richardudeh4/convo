import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ThemedText } from "../components/themed-text";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/ctx/AuthContext";
import { toast } from "sonner-native";
import { Paywall } from "@/components/subscription/paywall";


const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "I know a few words or nothing at all"
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "I can hold a conversation but I'm not fluent"
  },
  {
    id: "Advanced",
    title: "Advanced",
    description: "I can hold a conversation and I'm fluent"
  },
]
const MOTIVATIONS = [
  {
    id: "travel",
    title: "Travel",
    icon: "airplane-outline"
  },
  {
    id: "work",
    title: "Work",
    icon: "briefcase-outline"
  },
  {
    id: "family",
    title: "Family",
    icon: "people-outline"
  },
  {
    id: "culture",
    title: "Culture",
    icon: "book-outline"
  },
  {
    id: "hobby",
    title: "Hobby",
    icon: "game-controller-outline"
  },
]
const INTERESTS = [
  "Food & Dining",
  "Business",
  "Daily Life",
  "Technology",
  "Art",
  "Music",
  "Politics",
  "Sports",
];

const Onboarding = () => {
  const colors = Colors["light"];

  const [step, setStep] = useState(0);
  const router = useRouter();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const {refreshProfile} = useAuth();
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };



const isNextEnabled = () => {
  if(step === 0 ) return  name.trim().length > 0;
  if(step === 1 ) return  !!level;
  if(step === 2) return motivation.length > 0;
  if(step === 3) return selectedInterests.length > 0;

}


const saveProfile = async () => {
  try{
 const {data: {user}} = await supabase.auth.getUser();
 if(!user) throw new Error("User not found");
 const {error} = await supabase.from("profiles").upsert({
id: user.id,
full_name: name,
chinese_level: level,
motivation: motivation,
interests: selectedInterests,
onboarding_completed: true,
updated_at: new Date().toISOString(),
 });
 if(error) throw error;
 await refreshProfile();
 setShowPaywall(true);
//TODO: add the paywall component
  }
  catch(error: any){
    console.error("Error saving profile", error);
    toast.error("Failed to save profile. Please try again.");
  }
}
const handleContinue =() => {
  if(step < 3){
    setStep(step + 1);
  }
  else{
     saveProfile();
  }
}

const toggleMotivation = (id:string) => {
if(motivation.includes(id)){
  setMotivation(motivation.filter((m) => m !== id));
}
else{
  setMotivation([...motivation, id]);
}
}

const toggleInterest = (interest: string) => {
  if (selectedInterests.includes(interest)) {
    setSelectedInterests(selectedInterests.filter((i) => i !== interest));
  } else {
    setSelectedInterests([...selectedInterests, interest]);
  }
};
  const renderStep0Name = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          What should we call you?
        </ThemedText>
        <ThemedText type="title" style={styles.subtitle}>
          Your name will be used to personalize your experience.
        </ThemedText>
        <TextInput
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoFocus={true}
          placeholder="Your name"
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.icon },
          ]}
        />
      </View>
    );
  };
  const renderStep1Level = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          How much chinese do you know?
        </ThemedText>
        <ScrollView contentContainerStyle={{rowGap: 16}} style={{marginTop:20}}>
          {LEVELS.map((l) => (
            <TouchableOpacity key={l.id} style={[styles.optionCard, level === l.id && {borderColor: Colors.primaryAccentColor, backgroundColor: "#fff5f0"}]} onPress={() => setLevel(l.id)}>
<ThemedText style={[styles.optionTitle, level === l.id && {color: Colors.primaryAccentColor}]}>
  {l.title}
</ThemedText>
<ThemedText style={[styles.optionDescription]}>
  {l.description}
</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  const renderStep2Motivation = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          Why are you learning Chinese?
        </ThemedText>
        <ThemedText style={styles.subtitle}>Select all that apply</ThemedText>
        <ScrollView contentContainerStyle={{ rowGap: 16 }} style={{ marginTop: 20 }}>
          {MOTIVATIONS.map((l) => {
            const isSelected = motivation.includes(l.id);
            return (
              <TouchableOpacity
                key={l.id}
                style={[
                  styles.optionCard,
                  styles.motivationCard,
                  isSelected && {
                    borderColor: Colors.primaryAccentColor,
                    backgroundColor: "#fff5f0",
                  },
                ]}
                onPress={() => toggleMotivation(l.id)}
              >
                <Ionicons
                  name={l.icon as any}
                  size={24}
                  color={isSelected ? Colors.primaryAccentColor : colors.icon}
                />
                <ThemedText
                  style={[
                    styles.optionTitle,
                    { marginBottom: 0 },
                    isSelected && { color: Colors.primaryAccentColor },
                  ]}
                >
                  {l.title}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  const renderStep3Interests = () => {
    return (
      <View style={styles.stepContainer}>
        <ThemedText type="title" style={styles.title}>
          What are you interested in?
        </ThemedText>
        <ThemedText style={styles.subtitle}>Select all that apply</ThemedText>
        <View style={styles.tagsContainer}>
        {INTERESTS.map((i) => {
          const isSelected = selectedInterests.includes(i);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.tag,
                isSelected && {
                  backgroundColor: Colors.primaryAccentColor,
                  borderColor: Colors.primaryAccentColor,
                },
              ]}
              onPress={() => toggleInterest(i)}
            >
              <ThemedText
                style={[styles.tagText, isSelected && { color: "#FFF" }]}
              >
                {i}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {step > -1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((step + 1) / 4) * 100}%`,
                  backgroundColor: Colors.primaryAccentColor,
                },
              ]}
            ></View>
          </View>
        </View>

        <View style={styles.mainContent}>
          <Animated.View
            key={step}
            entering={FadeIn}
            exiting={FadeOut}
            style={{ flex: 1 }}
          >
            {step === 0 && renderStep0Name()}
            {step === 1 && renderStep1Level()}
            {step === 2 && renderStep2Motivation()}
            {step === 3 && renderStep3Interests()}
          </Animated.View>
        </View>
        <View style={[styles.footer, { zIndex: 10 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? Colors.primaryAccentColor
                  : "#E5E7EB",
              },
            ]}
            onPress={handleContinue}
            disabled={!isNextEnabled()}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === 3 ? "Get Started" : "Continue"}
            </ThemedText>
          </TouchableOpacity>
        </View>
        {/* <View style={[styles.footer, { zIndex: 10 }]}>
          <TouchableOpacity style={[styles.continueButton, {backgroundColor : isNextEnabled() ? Colors.primaryAccentColor : "E5E7EB"}]}
          onPress={handleContinue}
          disabled={!isNextEnabled()}>
<ThemedText style={[styles.continueButtonText]}>{step === 3 ? "Get Started": "Continue"}</ThemedText>
          </TouchableOpacity>
        </View> */}
      </KeyboardAvoidingView>
      <Paywall visible={showPaywall} onClose={() => {router.replace("/(tabs)")}}/>
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    marginBottom: 32,
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    width: "100%",
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
