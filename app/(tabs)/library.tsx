import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import LoadingSpinner from "@/components/LoadingSpinner";

interface LibraryBook {
  id: number;
  title: string;
  description: string;
  status: string;
  sort_order: number;
}

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { data: items, isLoading, refetch, isFetching } = useQuery<LibraryBook[]>({
    queryKey: ["/api/library"],
  });

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <LoadingSpinner />
      </View>
    );
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: "#FFF3CD", text: "#856404", label: "শীঘ্রই আসছে" },
    available: { bg: "#D4EDDA", text: "#155724", label: "পড়ুন" },
    draft: { bg: "#E2E3E5", text: "#383D41", label: "খসড়া" },
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      <FlatList
        data={items || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingTop: topPad + 12 }]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.navy}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
              লাইব্রেরি
            </Text>
            <Text style={[styles.headerSub, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
              সব বই ও আসন্ন প্রকাশনা
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="library-outline" size={48} color={isDark ? Colors.darkBorder : Colors.border} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
              লাইব্রেরিতে কোনো বই নেই
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const s = statusColors[item.status] || statusColors.upcoming;
          return (
            <View style={[styles.card, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
              <View style={styles.cardContent}>
                <Ionicons name="book-outline" size={28} color={isDark ? Colors.darkText : Colors.navy} />
                <View style={styles.cardTextWrap}>
                  <Text style={[styles.cardTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.cardDesc, { color: isDark ? Colors.darkTextMid : Colors.textMid }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontFamily: "SolaimanLipi-Bold", fontSize: 22 },
  headerSub: { fontFamily: "SolaimanLipi", fontSize: 13, marginTop: 4 },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "SolaimanLipi", fontSize: 15 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTextWrap: { flex: 1 },
  cardTitle: { fontFamily: "SolaimanLipi-Bold", fontSize: 16, marginBottom: 2 },
  cardDesc: { fontFamily: "SolaimanLipi", fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: "SolaimanLipi-Bold", fontSize: 11 },
});
