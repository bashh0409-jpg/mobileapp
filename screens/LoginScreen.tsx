import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Platform, ScrollView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { signInWithGoogle, getRedirectUri } from "../services/auth";
import { Button } from "../components/Button";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");

  useEffect(() => {
    try {
      const uri = getRedirectUri();
      setRedirectUri(uri);
    } catch (e) {
      // Ignore, will show loading state
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      if (session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err?.message !== "Authentication was cancelled") {
        Alert.alert(
          "Sign In Failed",
          err?.message ??
            "Make sure Supabase OAuth is configured (see instructions below).",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <Svg width={60} height={51} viewBox="0 0 35 30" fill="none">
          <Path
            d="M34.6895 0H25.8153V19.4784H21.7818V0H12.9077V19.4784H8.87414V0H0V19.6353H6.45383V30H15.328V19.6353H19.3615V30H28.2356V19.6353H34.6895V0Z"
            fill="white"
          />
        </Svg>
      </View>
      <Text style={styles.title}>VercelDash</Text>
      <Text style={styles.subtitle}>
        View your Vercel projects and deployments on the go
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Signing in..." : "Continue with Google"}
          onPress={handleGoogleSignIn}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Setup instructions */}
      <View style={styles.setupBox}>
        <Text style={styles.setupTitle}>⚙️ One-time Supabase setup</Text>

        <Text style={styles.step}>
          1. Go to{" "}
          <Text style={styles.bold}>supabase.com → Authentication → URL Configuration</Text>
        </Text>

        <Text style={styles.step}>
          2. Add <Text style={styles.bold}>both</Text> URLs to{" "}
          <Text style={styles.bold}>Redirect URLs</Text>:
        </Text>

        {redirectUri ? (
          <>
            <Text style={styles.urlLabel}>Your phone's URL:</Text>
            <Text style={styles.urlBox} selectable>
              {redirectUri}
            </Text>
          </>
        ) : null}

        <Text style={styles.urlLabel}>Custom scheme (for standalone builds):</Text>
        <Text style={styles.urlBox} selectable>
          verceldashboard://auth/callback
        </Text>

        <Text style={styles.step}>
          3. Go to{" "}
          <Text style={styles.bold}>Authentication → Providers → Google</Text>{" "}
          and enable it
        </Text>

        <Text style={styles.step}>
          4. Restart the app and tap "Continue with Google"
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingVertical: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  setupBox: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  setupTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14,
  },
  step: {
    color: "#aaa",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  bold: {
    color: "#fff",
    fontWeight: "600",
  },
  urlLabel: {
    color: "#888",
    fontSize: 11,
    marginTop: 6,
    marginBottom: 4,
  },
  urlBox: {
    color: "#3b82f6",
    fontSize: 13,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
    backgroundColor: "#0a0a0a",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    marginTop: 2,
    overflow: "hidden",
  },
});