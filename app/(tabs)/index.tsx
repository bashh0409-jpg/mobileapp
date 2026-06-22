import React, { useEffect, useState, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { getCurrentSession } from "../../services/auth";
import { getVercelToken } from "../../services/vercel";
import SplashScreen from "../../screens/SplashScreen";
import LoginScreen from "../../screens/LoginScreen";
import TokenSetupScreen from "../../screens/TokenSetupScreen";
import ProjectsListScreen from "../../screens/ProjectsListScreen";
import ProjectDetailScreen from "../../screens/ProjectDetailScreen";
import { Loader } from "../../components/Loader";
import { VercelProject } from "../../services/vercel";

type Screen =
  | "splash"
  | "login"
  | "loading"
  | "token-setup"
  | "project-list"
  | "project-detail";

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(
    null,
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Show splash for 2s, then check auth
    const timer = setTimeout(async () => {
      const session = await getCurrentSession();

      if (!session) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentScreen("login");
        });
        return;
      }

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen("loading");
        checkVercelToken();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkVercelToken = async () => {
    const token = await getVercelToken();
    setCurrentScreen(token ? "project-list" : "token-setup");
  };

  const handleLoginSuccess = () => {
    setCurrentScreen("loading");
    checkVercelToken();
  };

  const handleTokenSet = () => {
    setCurrentScreen("project-list");
  };

  const handleSelectProject = (project: VercelProject) => {
    setSelectedProject(project);
    setCurrentScreen("project-detail");
  };

  const handleBack = () => {
    setCurrentScreen("project-list");
    setSelectedProject(null);
  };

  const handleLogout = () => {
    setCurrentScreen("token-setup");
    setSelectedProject(null);
  };

  switch (currentScreen) {
    case "splash":
      return (
        <Animated.View style={[styles.animated, { opacity: fadeAnim }]}>
          <SplashScreen />
        </Animated.View>
      );
    case "login":
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    case "loading":
      return <Loader message="Loading your projects..." />;
    case "token-setup":
      return <TokenSetupScreen onTokenSet={handleTokenSet} />;
    case "project-list":
      return (
        <ProjectsListScreen
          onSelectProject={handleSelectProject}
          onLogout={handleLogout}
        />
      );
    case "project-detail":
      return selectedProject ? (
        <ProjectDetailScreen project={selectedProject} onBack={handleBack} />
      ) : (
        <ProjectsListScreen
          onSelectProject={handleSelectProject}
          onLogout={handleLogout}
        />
      );
    default:
      return <Loader message="Loading..." />;
  }
}

const styles = StyleSheet.create({
  animated: {
    flex: 1,
  },
});