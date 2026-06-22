import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

interface Props {
  message?: string;
}

export const Loader: React.FC<Props> = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  message: {
    color: "#888",
    marginTop: 12,
    fontSize: 14,
  },
});