import PremiumCard from "@/components/profile/PremiumCard";
import PreferencesSection from "@/components/profile/PreferencesSection";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProgressCard from "@/components/profile/ProgressCard";
import SettingsSection from "@/components/profile/SettingsSection";
import StatsRow from "@/components/profile/StatsRow";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useSpeakingListeningStats } from "@/hooks/useSpeakingListeningStats";
import { useStreak } from "@/hooks/useStreak";
import { getAllProgress } from "@/lib/lessonProgress";
import { resolveAvatarUrl } from "@/lib/profileAvatar";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, rank, isPremium, premiumExpiresAt, refreshProfile, signOut } =
    useAuth();
  const { stats, loading: statsLoading, refresh: refreshStats } =
    useSpeakingListeningStats();
  const { currentStreak, loading: streakLoading, refresh: refreshStreak } =
    useStreak();
  const {
    settings,
    setSoundEffectsEnabled,
    setHapticsEnabled,
    refresh: refreshSettings,
  } = useAppSettings();

  const [progress, setProgress] = useState<Record<string, number>>({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const loadProgress = useCallback(async () => {
    setProgressLoading(true);
    try {
      const saved = await getAllProgress();
      setProgress(saved);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
      void refreshStats();
      void refreshStreak();
      void refreshSettings();
      void loadProgress();
    }, [loadProgress, refreshProfile, refreshSettings, refreshStats, refreshStreak]),
  );

  const lessonsCompleted = Object.values(progress).filter((v) => v >= 1).length;
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);
  const loading = statsLoading || streakLoading || progressLoading;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={profile?.full_name}
          email={user?.email}
          rank={rank}
          avatarUrl={resolveAvatarUrl(profile?.avatar_url, user?.user_metadata)}
          userId={user?.id}
          onAvatarUpdated={refreshProfile}
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color={Colors.primaryAccentColor}
            style={styles.loader}
          />
        ) : (
          <StatsRow
            loading={false}
            minutesSpoken={stats?.minutesSpoken ?? 0}
            minutesListened={stats?.minutesListened ?? 0}
            weeklySpokenChange={stats?.weeklyChange.spoken ?? 0}
            weeklyListenedChange={stats?.weeklyChange.listened ?? 0}
            conversationTurns={stats?.conversationTurns ?? 0}
            currentStreak={currentStreak}
          />
        )}

        <ProgressCard
          lessonsCompleted={lessonsCompleted}
          totalStars={totalStars}
          rank={rank}
        />

        <PremiumCard
          isPremium={isPremium}
          premiumExpiresAt={premiumExpiresAt}
        />

        <PreferencesSection
          profile={profile}
          onEdit={() => router.push("/edit-profile")}
        />

        <SettingsSection
          settings={settings}
          onToggleSound={setSoundEffectsEnabled}
          onToggleHaptics={setHapticsEnabled}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 20,
  },
});
