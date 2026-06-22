import { supabase } from "./supabase";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_SESSION_KEY = "supabase_auth_session";

// ── Vercel deployment URL for web ─────────────────────────────────
export const VERCEL_URL = "https://mobileapp-sage.vercel.app";

WebBrowser.maybeCompleteAuthSession();

// ── Redirect URI ─────────────────────────────────────────────────
// Returns the redirect URI that needs to be added to Supabase.
// On native: uses the custom scheme (verceldashboard://)
// On web: uses the deployed Vercel URL
export const getRedirectUri = () => {
  // On web, always use the Vercel URL
  if (Platform.OS === "web") {
    return `${VERCEL_URL}/auth/callback`;
  }

  const uri = makeRedirectUri({
    scheme: "verceldashboard",
    path: "/auth/callback",
  });
  return uri;
};

// ── Session persistence ──────────────────────────────────────────

export const saveAuthSession = async (session: any) => {
  if (session?.access_token) {
    await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  }
};

export const getSavedAuthSession = async (): Promise<any | null> => {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthSession = async () => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};

// ── Google sign-in ──────────────────────────────────────────────
export const signInWithGoogle = async () => {
  const redirectUri = getRedirectUri();

  console.log("===========================================");
  console.log("[Auth] Sign-in starting");
  console.log("[Auth] ADD THIS URL TO SUPABASE DASHBOARD:");
  console.log("[Auth] → Authentication → URL Configuration");
  console.log("[Auth] → Redirect URLs:");
  console.log(`[Auth] ${redirectUri}`);
  console.log("===========================================");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("No OAuth URL returned from Supabase");

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUri,
    { preferEphemeralSession: true, createTask: true },
  );

  if (result.type === "success" && result.url) {
    console.log("[Auth] Redirect received, exchanging code...");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(result.url);

    if (sessionError) throw sessionError;

    if (sessionData?.session) {
      console.log("[Auth] Signed in as:", sessionData.session.user?.email);
      await saveAuthSession(sessionData.session);
      return sessionData.session;
    }

    throw new Error("No session returned from Supabase");
  }

  if (result.type === "dismiss" || result.type === "cancel") {
    throw new Error("Authentication was cancelled");
  }

  throw new Error(
    `Authentication failed. Make sure the redirect URL below is added to Supabase dashboard:\n${redirectUri}`,
  );
};

// ── Sign out ─────────────────────────────────────────────────────
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("[Auth] Sign out error:", error);
  await clearAuthSession();
};

// ── Get current session ─────────────────────────────────────────
export const getCurrentSession = async () => {
  const saved = await getSavedAuthSession();
  if (saved?.access_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: saved.access_token,
      refresh_token: saved.refresh_token,
    });
    if (!error && data?.session) {
      await saveAuthSession(data.session);
      return data.session;
    }
  }

  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    await saveAuthSession(data.session);
    return data.session;
  }

  return null;
};