import { createSessionFromUrl } from "@/lib/socialAuth";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { toast } from "sonner-native";

export const useDeepLinking = () => {
  const url = Linking.useLinkingURL();
  const router = useRouter();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          if (session) {
            router.replace("/(tabs)/lessons");
          }
        })
        .catch((error) => {
          console.error("Error creating session from URL", error);
          toast.error(error?.message ?? "Failed to sign in. Please try again.");
          router.replace("/");
        });
    }
  }, [router, url]);
};
