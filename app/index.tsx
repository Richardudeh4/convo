import IntroScreen from "@/components/auth/introScreen";
import { useAuth } from "@/ctx/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { session } = useAuth();
  if (session) {
    return <Redirect href="/(tabs)/lessons" />;
  }
  return <IntroScreen />;
}
