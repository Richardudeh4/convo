import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/utils/supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: "convo", path: "auth/callback" });

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

export const createSessionFromUrl = async (url: string) => {
  const normalizedUrl = normalizeDeepLink(url);
  const { errorCode, params } = QueryParams.getQueryParams(normalizedUrl);

  const authError = params.error_description || params.error || errorCode;
  if (authError) {
    throw new Error(String(authError));
  }

  if (errorCode) {
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) {
    throw error;
  }
  return data.session;
};

export async function signInWithOAuthProvider(provider: "google" | "apple") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("Could not start sign in. Please try again.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") {
    return null;
  }

  return createSessionFromUrl(result.url);
}
