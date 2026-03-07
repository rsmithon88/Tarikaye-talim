import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  useColorScheme,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

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

function BookHero({ book }: { book: Book }) {
  const isDark = useColorScheme() === "dark";
  const coverColor = book.cover_color || Colors.navy;
  const accentColor = book.cover_accent || Colors.gold;

  return (
    <View style={[styles.hero, { backgroundColor: coverColor }]}>
      <View style={[styles.heroSpine, { backgroundColor: accentColor, opacity: 0.5 }]} />

      <View style={styles.heroCoverWrap}>
        <View style={[styles.heroCover, { backgroundColor: coverColor }]}>
          <View style={[styles.heroCoverSpine, { backgroundColor: accentColor }]} />
          <View style={[styles.heroCoverLine1, { backgroundColor: accentColor }]} />
          <View style={[styles.heroCoverLine2, { backgroundColor: accentColor }]} />
          <View style={styles.heroCoverTextWrap}>
            <Text style={styles.heroCoverTitle} numberOfLines={4}>
              {book.title}
            </Text>
            {book.author ? (
              <Text style={styles.heroCoverAuthor} numberOfLines={1}>
                {book.author}
              </Text>
            ) : null}
          </View>
          <View style={[styles.heroCoverBottom, { backgroundColor: accentColor }]} />
        </View>
      </View>

      <View style={styles.heroMeta}>
        <Text style={styles.heroTitle}>{book.title}</Text>
        {book.author ? (
          <Text style={styles.heroAuthor}>{book.author}</Text>
        ) : null}
        <View style={styles.heroStats}>
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="list" size={13} color="white" />
            <Text style={styles.heroBadgeText}>{book.chapter_count} অধ্যায়</Text>
          </View>
        </View>
      </View>
    </View>
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

  const { data: chapters, isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/books", id, "chapters"],
  });

  const handleChapterPress = useCallback(
    (chapterId: number) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push({ pathname: "/chapter/[id]", params: { id: chapterId } });
    },
    []
  );

  if (bookLoading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDark ? Colors.darkBg : Colors.cream },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  if (!book) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: isDark ? Colors.darkBg : Colors.cream },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={[styles.errorText, { color: isDark ? Colors.darkText : Colors.textDark }]}>
          বই খুঁজে পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <BookHero book={book} />

        <View style={styles.body}>
          {book.description ? (
            <View style={[styles.descCard, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
              <Text style={[styles.descTitle, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
                বইয়ের পরিচয়
              </Text>
              <Text style={[styles.descText, { color: isDark ? Colors.darkText : Colors.textDark }]}>
                {book.description}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.chaptersHeading, { color: isDark ? Colors.darkText : Colors.textDark }]}>
            অধ্যায়সমূহ
          </Text>

          {chaptersLoading ? (
            <ActivityIndicator size="small" color={Colors.navy} style={{ marginTop: 20 }} />
          ) : !chapters || chapters.length === 0 ? (
            <View style={styles.emptyChapters}>
              <Ionicons
                name="document-outline"
                size={40}
                color={isDark ? Colors.darkBorder : Colors.border}
              />
              <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
                এখনো কোনো অধ্যায় নেই
              </Text>
            </View>
          ) : (
            <View style={styles.chapterList}>
              {chapters.map((chapter, index) => (
                <Pressable
                  key={chapter.id}
                  onPress={() => handleChapterPress(chapter.id)}
                  style={({ pressed }) => [
                    styles.chapterItem,
                    {
                      backgroundColor: isDark ? Colors.darkSurface : Colors.white,
                    },
                    pressed && styles.chapterItemPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.chapterNum,
                      { backgroundColor: book.cover_color || Colors.navy },
                    ]}
                  >
                    <Text style={styles.chapterNumText}>{index + 1}</Text>
                  </View>
                  <View style={styles.chapterInfo}>
                    <Text
                      style={[
                        styles.chapterTitle,
                        { color: isDark ? Colors.darkText : Colors.textDark },
                      ]}
                      numberOfLines={2}
                    >
                      {chapter.title}
                    </Text>
                    {chapter.content ? (
                      <Text
                        style={[
                          styles.chapterPreview,
                          { color: isDark ? Colors.darkTextMid : Colors.textLight },
                        ]}
                        numberOfLines={1}
                      >
                        {chapter.content.slice(0, 60)}…
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? Colors.darkTextMid : Colors.textLight}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
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
  hero: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    overflow: "hidden",
  },
  heroSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  heroCoverWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  heroCover: {
    width: 100,
    height: 140,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  heroCoverSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    opacity: 0.7,
  },
  heroCoverLine1: {
    position: "absolute",
    left: 16,
    top: 16,
    right: 10,
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
  heroCoverLine2: {
    position: "absolute",
    left: 16,
    top: 22,
    right: 22,
    height: 1,
    borderRadius: 1,
    opacity: 0.3,
  },
  heroCoverTextWrap: {
    position: "absolute",
    left: 16,
    right: 10,
    top: 32,
    bottom: 16,
    justifyContent: "center",
  },
  heroCoverTitle: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 6,
  },
  heroCoverAuthor: {
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_400Regular",
    fontSize: 8,
  },
  heroCoverBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    opacity: 0.5,
  },
  heroMeta: {
    flex: 1,
  },
  heroTitle: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 6,
  },
  heroAuthor: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    marginBottom: 12,
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: "white",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  body: {
    padding: 20,
  },
  descCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  descTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  descText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 24,
  },
  chaptersHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    marginBottom: 14,
  },
  chapterList: {
    gap: 10,
  },
  chapterItem: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chapterItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  chapterNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chapterNumText: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 21,
  },
  chapterPreview: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 3,
  },
  emptyChapters: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
});
