import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { setVercelToken, getUser } from "../services/vercel";
import { Button } from "../components/Button";

interface Props {
  onTokenSet: () => void;
}

export default function TokenSetupScreen({ onTokenSet }: Props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter your Vercel access token");
      return;
    }

    setLoading(true);
    try {
      // Validate token by fetching user
      await getUser(trimmed);
      await setVercelToken(trimmed);
      onTokenSet();
    } catch (err: any) {
      Alert.alert(
        "Invalid Token",
        err?.message ?? "Could not validate token. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vercel Dashboard</Text>
      <Text style={styles.subtitle}>
        Enter your Vercel access token to get started.
      </Text>

      <Text style={styles.label}>Vercel Access Token</Text>
      <TextInput
        style={styles.input}
        value={token}
        onChangeText={setToken}
        placeholder="xxxxxxxxxxxxxxxxxxxx"
        placeholderTextColor="#555"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title={loading ? "Verifying..." : "Continue"}
        onPress={handleSave}
        disabled={loading}
      />

      <Text style={styles.hint}>
        Create a token at{"\n"}
        vercel.com/account/tokens
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
    marginBottom: 32,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 14,
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  hint: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});