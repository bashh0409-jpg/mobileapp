import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  VercelProject,
  getProjects,
  getDeployments,
  getVercelToken,
  clearVercelToken,
  getUser,
  VercelUser,
} from "../services/vercel";
import { Loader } from "../components/Loader";
import { Button } from "../components/Button";

interface Props {
  onSelectProject: (project: VercelProject) => void;
  onLogout: () => void;
}

export default function ProjectsListScreen({ onSelectProject, onLogout }: Props) {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [user, setUser] = useState<VercelUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getVercelToken();
      if (!token) return;

      const [userData, projectList] = await Promise.all([
        getUser(token),
        getProjects(token),
      ]);

      setUser(userData);
      setProjects(projectList);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await clearVercelToken();
    onLogout();
  };

  if (loading) return <Loader message="Loading your projects..." />;

  const renderProject = ({ item }: { item: VercelProject }) => {
    const lastDeploy = item.latestDeployments?.[0];
    const dateStr = lastDeploy
      ? new Date(lastDeploy.createdAt).toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
        })
      : null;

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => onSelectProject(item)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{item.name}</Text>
          {item.framework && (
            <Text style={styles.framework}>{item.framework}</Text>
          )}
        </View>
        <View style={styles.projectMeta}>
          <Text style={styles.metaText}>
            {lastDeploy ? `Last deploy: ${dateStr}` : "No deployments"}
          </Text>
          {lastDeploy && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    lastDeploy.state === "READY"
                      ? "#22c55e"
                      : lastDeploy.state === "ERROR"
                        ? "#ef4444"
                        : "#f59e0b",
                },
              ]}
            >
              <Text style={styles.statusText}>{lastDeploy.state}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* User header */}
      {user && (
        <View style={styles.userBar}>
          <View>
            <Text style={styles.greeting}>Hello, {user.name || user.username}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.pageTitle}>Your Projects</Text>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No projects found. Make sure your token has access to projects.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  userBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  greeting: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    color: "#666",
    fontSize: 13,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "500",
  },
  pageTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  projectCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  framework: {
    color: "#888",
    fontSize: 12,
    backgroundColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "capitalize",
  },
  projectMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    color: "#666",
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    lineHeight: 22,
  },
});