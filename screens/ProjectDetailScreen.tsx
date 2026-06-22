import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import {
  VercelProject,
  VercelDeployment,
  getDeployments,
  getProjectAnalytics,
  ProjectAnalytics,
  getProductionDeployment,
  getVercelToken,
} from "../services/vercel";
import { Loader } from "../components/Loader";
import { Card } from "../components/Card";

interface Props {
  project: VercelProject;
  onBack: () => void;
}

export default function ProjectDetailScreen({ project, onBack }: Props) {
  const [deployments, setDeployments] = useState<VercelDeployment[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token = await getVercelToken();
      if (!token) return;

      const deploys = await getDeployments(token, project.id, 50);
      setDeployments(deploys);
      setAnalytics(getProjectAnalytics(project, deploys));
    } catch (err) {
      console.error("Failed to load project data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [project.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <Loader />;

  const prodDeploy = getProductionDeployment(deployments);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const stateColor = (state: string) => {
    switch (state) {
      case "READY":
        return "#22c55e";
      case "ERROR":
        return "#ef4444";
      case "BUILDING":
        return "#f59e0b";
      case "QUEUED":
        return "#3b82f6";
      case "CANCELED":
        return "#6b7280";
      default:
        return "#9ca3af";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.framework && (
            <Text style={styles.framework}>{project.framework}</Text>
          )}
        </View>
      </View>

      {/* Analytics cards */}
      {analytics && (
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analytics.totalDeployments}</Text>
            <Text style={styles.analyticsLabel}>Total Deployments</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={[styles.analyticsValue, { color: "#22c55e" }]}>
              {analytics.readyDeployments}
            </Text>
            <Text style={styles.analyticsLabel}>Successful</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={[styles.analyticsValue, { color: "#ef4444" }]}>
              {analytics.failedDeployments}
            </Text>
            <Text style={styles.analyticsLabel}>Failed</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {formatDuration(analytics.averageDeploymentTime)}
            </Text>
            <Text style={styles.analyticsLabel}>Avg Time</Text>
          </View>
        </View>
      )}

      {/* Production deployment */}
      {prodDeploy && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Production</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://${prodDeploy.url}`)}
          >
            <Text style={styles.prodUrl}>{prodDeploy.url}</Text>
          </TouchableOpacity>
          <Text style={styles.deployDate}>
            Deployed {formatDate(prodDeploy.createdAt)}
          </Text>
        </Card>
      )}

      {/* Recent Deployments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Deployments</Text>
        {deployments.slice(0, 20).map((dep) => (
          <View key={dep.id || dep.uid} style={styles.deployRow}>
            <View
              style={[styles.stateDot, { backgroundColor: stateColor(dep.state) }]}
            />
            <View style={styles.deployInfo}>
              <Text style={styles.deployState}>{dep.state}</Text>
              <Text style={styles.deployDate}>{formatDate(dep.createdAt)}</Text>
            </View>
            <Text style={styles.deployBranch} numberOfLines={1}>
              {dep.meta?.githubCommitRef || dep.meta?.branch || "—"}
            </Text>
          </View>
        ))}
        {deployments.length === 0 && (
          <Text style={styles.emptyText}>No deployments found</Text>
        )}
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
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  backArrow: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  headerText: {
    flex: 1,
  },
  projectName: {
    color: "white",
    fontSize: 26,
    fontWeight: "700",
  },
  framework: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
    textTransform: "capitalize",
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  analyticsCard: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: "45%",
  },
  analyticsValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  analyticsLabel: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  prodUrl: {
    color: "#3b82f6",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  deployRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  deployInfo: {
    flex: 1,
  },
  deployState: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  deployDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  deployBranch: {
    color: "#888",
    fontSize: 12,
    maxWidth: 100,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});