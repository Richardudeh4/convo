import { useAuth } from "@/ctx/AuthContext";
import { useDeepLinking } from "@/hooks/use-deep-linking";
import { useNetworkToast } from "@/hooks/use-network-toast";
import AuthProvider from "@/providers/AuthProvider";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

function RootLayoutNav() {
  const { loading, session, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  //handle deep linking
  useDeepLinking();
  useNetworkToast();

  useEffect(() => {
    if (!loading && session) {
      if (!profile || !profile.onboarding_completed) {
        const inOnboarding = segments[0] === "onboarding";
        if (!inOnboarding) {
          router.replace("/onboarding");
        }
      }
    }
  }, [session, loading, profile, segments]);

  if (!loaded || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="practise" options={{ headerShown: false }} />
          <Stack.Screen name="conversation" options={{ headerShown: false }} />
        </Stack>
        <Toaster />
        <StatusBar style={Platform.OS === "android" ? "dark" : "auto"} />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});
