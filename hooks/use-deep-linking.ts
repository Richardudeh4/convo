import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { toast } from "sonner-native";
import { supabase } from "../utils/supabase";

const decodeSafely = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeDeepLink = (url: string) => {
  let normalized = decodeSafely(url);
  normalized = decodeSafely(normalized);
  return normalized;
};

const createSessionFromUrl = async (url: string) => {
  const normalizedUrl = normalizeDeepLink(url);
  const { errorCode, params } = QueryParams.getQueryParams(normalizedUrl);

  const authError = params.error_description || params.error || errorCode;
  if (authError) {
    throw new Error(String(authError));
  }

  if (errorCode) {
    console.error(`Deep link Error`, errorCode);
    throw new Error(errorCode);
  }
  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) {
    return;
  }
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) {
    console.error("Session error", error);
    throw error;
  }
  return data.session;
};

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
