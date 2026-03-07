import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useColorScheme,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Book {
  id: number;
  title: string;
  description: string;
  author: string;
  cover_color: string;
  cover_accent: string;
  chapter_count: number;
}

function BookCard({ book, index }: { book: Book; index: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const gradientSets = [
    ["#1E6B3A", "#2E8B57", "#3CB371"],
    ["#1E3A5F", "#2E5B8F", "#4682B4"],
    ["#5B2C6F", "#7D3C98", "#9B59B6"],
    ["#B7410E", "#D2691E", "#E67E22"],
    ["#1A5276", "#2980B9", "#3498DB"],
    ["#145A32", "#27AE60", "#2ECC71"],
    ["#7B241C", "#C0392B", "#E74C3C"],
    ["#6C3483", "#8E44AD", "#AF7AC5"],
  ];

  const gradientColors = gradientSets[index % gradientSets.length];

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/book/[id]", params: { id: book.id } });
  }, [book.id]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.bookCard,
        pressed && styles.bookCardPressed,
      ]}
    >
      <LinearGradient
        colors={gradientColors as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.bookGradient}
      >
        <View style={styles.bookCardContent}>
          <View style={styles.bookCardLeft}>
            <Text style={styles.bookCardTitle} numberOfLines={2}>
              {book.title}
            </Text>
            {book.author ? (
              <Text style={styles.bookCardAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
            <View style={styles.bookChapterBadge}>
              <Ionicons name="layers-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.bookChapterCount}>
                {book.chapter_count || 0} অধ্যায়
              </Text>
            </View>
          </View>
          <View style={styles.bookCardRight}>
            <View style={styles.bookIconCircle}>
              <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.95)" />
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
        <View style={styles.bookCardDecoCircle1} />
        <View style={styles.bookCardDecoCircle2} />
      </LinearGradient>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { data: books, isLoading, isError, refetch, isFetching } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const orgName = settings?.org_name || "ইকরা তালিমুল কুরআন বোর্ড বাংলাদেশ";
  const orgSubtitle = settings?.org_subtitle || "এলেঙ্গা, টাঙ্গাইল";

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={[styles.errorText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
          লোড করতে সমস্যা হয়েছে
        </Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      <FlatList
        data={books || []}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPad + 12 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.navy}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
                  {orgName}
                </Text>
                <Text style={[styles.headerLabel, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
                  {orgSubtitle}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push("/developer");
                }}
                style={[styles.headerIconWrap, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}
              >
                <Ionicons name="information-circle-outline" size={22} color={Colors.navy} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                refetch();
              }}
              style={[styles.refreshBtn, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}
            >
              <Ionicons name="refresh" size={18} color={Colors.navy} />
              <Text style={[styles.refreshBtnText, { color: isDark ? Colors.darkText : Colors.textDark }]}>রিফ্রেশ</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
              <Ionicons name="library-outline" size={40} color={isDark ? Colors.darkBorder : Colors.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
              কোনো বই নেই
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
              অ্যাডমিন প্যানেল থেকে বই যোগ করুন
            </Text>
          </View>
        }
        renderItem={({ item, index }) => <BookCard book={item} index={index} />}
        scrollEnabled={!!(books && books.length > 0)}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLabel: {
    fontFamily: "SolaimanLipi",
    fontSize: 12,
    marginTop: 2,
  },
  headerTitle: {
    fontFamily: "SolaimanLipi-Bold",
    fontSize: 20,
    lineHeight: 28,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshBtnText: {
    fontFamily: "SolaimanLipi",
    fontSize: 13,
  },
  infoBanner: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoBannerText: {
    color: "rgba(255,255,255,0.95)",
    fontFamily: "SolaimanLipi",
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  bookCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  bookGradient: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: "hidden",
    position: "relative",
  },
  bookCardContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  bookCardLeft: {
    flex: 1,
  },
  bookCardTitle: {
    color: "white",
    fontFamily: "SolaimanLipi-Bold",
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 4,
  },
  bookCardAuthor: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "SolaimanLipi",
    fontSize: 13,
    marginBottom: 8,
  },
  bookChapterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  bookChapterCount: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "SolaimanLipi",
    fontSize: 11,
  },
  bookCardRight: {
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  bookIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookCardDecoCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -20,
    right: -10,
  },
  bookCardDecoCircle2: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -15,
    right: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily: "SolaimanLipi-Bold",
    fontSize: 20,
  },
  emptyText: {
    fontFamily: "SolaimanLipi",
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    fontFamily: "SolaimanLipi",
    fontSize: 15,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.navy,
    borderRadius: 12,
  },
  retryText: {
    color: "white",
    fontFamily: "SolaimanLipi-Bold",
    fontSize: 15,
  },
});
