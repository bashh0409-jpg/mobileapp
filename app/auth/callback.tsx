import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../services/supabase";
import { saveAuthSession } from "../../services/auth";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // The auth code comes as query params on the redirect URL
        const urlParams = new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        );

        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          setStatus(`Sign in failed: ${error}`);
          return;
        }

        if (code) {
          // Exchange the auth code for a session
          const { data, error: sessionError } =
            await supabase.auth.exchangeCodeForSession(
              `?${urlParams.toString()}`,
            );

          if (sessionError) {
            setStatus(`Error: ${sessionError.message}`);
            return;
          }

          if (data?.session) {
            await saveAuthSession(data.session);
            router.replace("/(tabs)");
            return;
          }
        }

        setStatus("No auth code received");
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
      }
    };

    handleRedirect();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
  },
});