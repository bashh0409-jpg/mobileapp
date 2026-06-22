import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

interface Props {
  onFinish?: () => void;
}

export default function SplashScreen({}: Props) {
  return (
    <View style={styles.container}>
      <Svg width={80} height={68} viewBox="0 0 35 30" fill="none">
        <Path
          d="M34.6895 0H25.8153V19.4784H21.7818V0H12.9077V19.4784H8.87414V0H0V19.6353H6.45383V30H15.328V19.6353H19.3615V30H28.2356V19.6353H34.6895V0Z"
          fill="white"
        />
      </Svg>
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
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
  },
  subtitle: {
    color: "#888",
    fontSize: 15,
    marginTop: 8,
  },
});