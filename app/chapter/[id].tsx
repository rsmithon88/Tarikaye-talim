import React, { useState, useCallback } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import Colors from "@/constants/colors";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Chapter {
  id: number;
  book_id: number;
  title: string;
  content: string;
  sort_order: number;
}

interface Book {
  id: number;
  title: string;
  cover_color: string;
  cover_accent: string;
}

const FONT_SIZES = [14, 16, 18, 20, 22];
const LINE_HEIGHTS = [1.6, 1.8, 2.0, 2.2, 2.4];

export default function ChapterReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const { data: chapter, isLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", id],
  });

  const { data: book } = useQuery<Book>({
    queryKey: ["/api/books", chapter?.book_id?.toString()],
    enabled: !!chapter?.book_id,
  });

  // Save reading progress
  useEffect(() => {
    if (chapter) {
      AsyncStorage.setItem(
        `reading_progress_${chapter.book_id}`,
        JSON.stringify({ chapterId: chapter.id, chapterTitle: chapter.title, timestamp: Date.now() })
      ).catch(() => {});
    }
  }, [chapter]);

  // Load font size preference
  useEffect(() => {
    AsyncStorage.getItem("reader_font_size_idx").then((val) => {
      if (val !== null) setFontSizeIdx(Number(val));
    });
  }, []);

  const changeFontSize = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(FONT_SIZES.length - 1, fontSizeIdx + delta));
      setFontSizeIdx(next);
      AsyncStorage.setItem("reader_font_size_idx", String(next));
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [fontSizeIdx]
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={{ color: isDark ? Colors.darkText : Colors.textDark, fontFamily: "Inter_600SemiBold" }}>
          অধ্যায় খুঁজে পাওয়া যায়নি
        </Text>
      </View>
    );
  }

  const accentColor = book?.cover_color || Colors.navy;
  const fontSize = FONT_SIZES[fontSizeIdx];
  const lineHeight = fontSize * LINE_HEIGHTS[fontSizeIdx];
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111820" : "#FFFDF8" }]}>
      {/* Floating Settings Bar */}
      <View
        style={[
          styles.settingsBar,
          {
            backgroundColor: isDark ? Colors.darkSurface : Colors.white,
            borderBottomColor: isDark ? Colors.darkBorder : Colors.border,
          },
        ]}
      >
        <View style={styles.chapterTitleBar}>
          <View style={[styles.chapterDot, { backgroundColor: accentColor }]} />
          <Text
            style={[
              styles.chapterTitleText,
              { color: isDark ? Colors.darkTextMid : Colors.textMid },
            ]}
            numberOfLines={1}
          >
            {chapter.title}
          </Text>
        </View>
        <View style={styles.fontControls}>
          <Pressable
            onPress={() => changeFontSize(-1)}
            disabled={fontSizeIdx === 0}
            style={[styles.fontBtn, { opacity: fontSizeIdx === 0 ? 0.3 : 1 }]}
          >
            <Text style={[styles.fontBtnText, { color: isDark ? Colors.darkText : Colors.textDark }]}>A</Text>
          </Pressable>
          <Pressable
            onPress={() => changeFontSize(1)}
            disabled={fontSizeIdx === FONT_SIZES.length - 1}
            style={[styles.fontBtn, { opacity: fontSizeIdx === FONT_SIZES.length - 1 ? 0.3 : 1 }]}
          >
            <Text style={[styles.fontBtnTextLg, { color: isDark ? Colors.darkText : Colors.textDark }]}>A</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Book title */}
        {book ? (
          <Text style={[styles.bookNameLabel, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
            {book.title}
          </Text>
        ) : null}

        {/* Chapter heading */}
        <Text
          style={[
            styles.chapterHeading,
            { color: isDark ? Colors.darkText : Colors.textDark },
          ]}
        >
          {chapter.title}
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: accentColor }]} />

        {/* Content */}
        {chapter.content ? (
          <Text
            style={[
              styles.chapterContent,
              {
                fontSize,
                lineHeight,
                color: isDark ? "#E8E3D8" : "#2A2A3E",
              },
            ]}
          >
            {chapter.content}
          </Text>
        ) : (
          <View style={styles.emptyContent}>
            <Ionicons
              name="document-outline"
              size={40}
              color={isDark ? Colors.darkBorder : Colors.border}
            />
            <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
              এই অধ্যায়ে এখনো কোনো লেখা নেই
            </Text>
          </View>
        )}

        {/* End of chapter */}
        {chapter.content ? (
          <View style={styles.endMark}>
            <View style={[styles.endLine, { backgroundColor: isDark ? Colors.darkBorder : Colors.border }]} />
            <View style={[styles.endDot, { backgroundColor: accentColor }]} />
            <View style={[styles.endLine, { backgroundColor: isDark ? Colors.darkBorder : Colors.border }]} />
          </View>
        ) : null}

        {/* Back to book button */}
        {chapter.book_id ? (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => [
              styles.backToBookBtn,
              { backgroundColor: accentColor, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="arrow-back" size={16} color="white" />
            <Text style={styles.backToBookText}>বইয়ে ফিরুন</Text>
          </Pressable>
        ) : null}
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
  settingsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chapterTitleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  chapterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  chapterTitleText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    flex: 1,
  },
  fontControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 12,
  },
  fontBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fontBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  fontBtnTextLg: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },
  bookNameLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: "center",
  },
  chapterHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    height: 3,
    width: 40,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 32,
  },
  chapterContent: {
    fontFamily: "Inter_400Regular",
    textAlign: "justify",
  },
  emptyContent: {
    alignItems: "center",
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  endMark: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
    gap: 8,
  },
  endLine: {
    flex: 1,
    height: 1,
  },
  endDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backToBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backToBookText: {
    color: "white",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
