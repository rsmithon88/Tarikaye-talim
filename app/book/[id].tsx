import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
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

interface Chapter {
  id: number;
  book_id: number;
  title: string;
  sort_order: number;
  content: string;
}

const CHAPTER_GRADIENTS = [
  ["#1B7A3D", "#2A9D55", "#38C76E"],
  ["#1A6B35", "#28A54C", "#36BF63"],
  ["#0F7B4F", "#1D9B6C", "#2BB585"],
  ["#1E8B50", "#2CA868", "#3AC580"],
  ["#148040", "#22A05A", "#30C074"],
  ["#1C7344", "#2A935C", "#38B374"],
  ["#178B3E", "#25AB56", "#33CB6E"],
  ["#1A6840", "#289858", "#36B870"],
];

function ChapterCard({
  chapter,
  index,
  bookColor,
  onPress,
}: {
  chapter: Chapter;
  index: number;
  bookColor: string;
  onPress: () => void;
}) {
  const gradients = CHAPTER_GRADIENTS[index % CHAPTER_GRADIENTS.length];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chapterCard,
        pressed && styles.chapterCardPressed,
      ]}
    >
      <LinearGradient
        colors={gradients as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.chapterGradient}
      >
        <View style={styles.chapterDecoCircle} />
        <View style={styles.chapterDecoCircle2} />
        <View style={styles.chapterContent}>
          <View style={styles.chapterNumBadge}>
            <Text style={styles.chapterNumText}>{index + 1}</Text>
          </View>
          <Text style={styles.chapterTitle} numberOfLines={2}>
            {chapter.title}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ["/api/books", id],
  });

  const {
    data: chapters,
    isLoading: chaptersLoading,
    refetch,
    isFetching,
  } = useQuery<Chapter[]>({
    queryKey: ["/api/books", id, "chapters"],
  });

  const handleChapterPress = useCallback((chapterId: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/chapter/[id]", params: { id: chapterId } });
  }, []);

  if (bookLoading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={[styles.errorText, { color: isDark ? Colors.darkText : Colors.textDark }]}>
          বই খুঁজে পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 20;
  const coverColor = book.cover_color || Colors.navy;

  const renderHeader = () => (
    <View>
      <LinearGradient
        colors={[coverColor, shiftColor(coverColor, 30)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroDecoCircle1} />
        <View style={styles.heroDecoCircle2} />
        <View style={styles.heroContent}>
          <View style={styles.heroBookIcon}>
            <Ionicons name="book" size={28} color="rgba(255,255,255,0.95)" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {book.title}
            </Text>
            {book.author ? (
              <Text style={styles.heroAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
            <View style={styles.heroStatRow}>
              <View style={styles.heroStat}>
                <Ionicons name="layers" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroStatText}>{book.chapter_count} অধ্যায়</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {book.description ? (
        <View
          style={[
            styles.descCard,
            { backgroundColor: isDark ? Colors.darkSurface : Colors.white },
          ]}
        >
          <Ionicons name="information-circle" size={18} color={coverColor} />
          <Text style={[styles.descText, { color: isDark ? Colors.darkText : Colors.textDark }]}>
            {book.description}
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
          অধ্যায়সমূহ
        </Text>
        <Text style={[styles.sectionCount, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
          {chapters?.length || 0}টি
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      {chaptersLoading ? (
        <View style={styles.center}>
          {renderHeader()}
          <View style={{ marginTop: 20 }}>
            <LoadingSpinner size="small" showText={false} />
          </View>
        </View>
      ) : (
        <FlatList
          data={chapters || []}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomPad }]}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !chaptersLoading}
              onRefresh={refetch}
              tintColor={coverColor}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyChapters}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: isDark ? Colors.darkSurface : Colors.white },
                ]}
              >
                <Ionicons
                  name="document-outline"
                  size={32}
                  color={isDark ? Colors.darkBorder : Colors.border}
                />
              </View>
              <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
                এখনো কোনো অধ্যায় নেই
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ChapterCard
              chapter={item}
              index={index}
              bookColor={coverColor}
              onPress={() => handleChapterPress(item.id)}
            />
          )}
          scrollEnabled={!!(chapters && chapters.length > 0)}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function shiftColor(hex: string, amount: number): string {
  try {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  heroBanner: {
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  heroDecoCircle1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -30,
    right: -20,
  },
  heroDecoCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -10,
    left: 20,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    zIndex: 2,
  },
  heroBookIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 4,
  },
  heroAuthor: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 10,
  },
  heroStatRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroStatText: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  descCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  descText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
  },
  sectionCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  chapterCard: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  chapterCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  chapterGradient: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    overflow: "hidden",
    position: "relative",
  },
  chapterDecoCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -15,
    right: 20,
  },
  chapterDecoCircle2: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -10,
    left: 30,
  },
  chapterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 2,
  },
  chapterNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chapterNumText: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  chapterTitle: {
    color: "white",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  emptyChapters: {
    alignItems: "center",
    paddingTop: 40,
    gap: 14,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
});
