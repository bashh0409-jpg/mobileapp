import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}) => {
  const bgColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
        ? "#222"
        : "#ef4444";

  const textColor = variant === "primary" ? "#000" : "#fff";

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgColor }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.3,
  },
});