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

interface Book {
  id: number;
  title: string;
  description: string;
  author: string;
  cover_color: string;
  cover_accent: string;
  chapter_count: number;
}

function BookCover({
  color,
  accent,
  title,
  author,
}: {
  color: string;
  accent: string;
  title: string;
  author: string;
}) {
  return (
    <View style={[styles.cover, { backgroundColor: color }]}>
      <View style={[styles.coverSpine, { backgroundColor: accent, opacity: 0.6 }]} />
      <View style={[styles.coverAccentLine, { backgroundColor: accent }]} />
      <View style={styles.coverContent}>
        <Text style={styles.coverTitle} numberOfLines={3}>
          {title}
        </Text>
        {author ? (
          <Text style={styles.coverAuthor} numberOfLines={1}>
            {author}
          </Text>
        ) : null}
      </View>
      <View style={[styles.coverBottomBar, { backgroundColor: accent, opacity: 0.4 }]} />
    </View>
  );
}

function BookCard({ book }: { book: Book }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
        { backgroundColor: isDark ? Colors.darkSurface : Colors.white },
        pressed && styles.bookCardPressed,
      ]}
    >
      <BookCover
        color={book.cover_color || Colors.navy}
        accent={book.cover_accent || Colors.gold}
        title={book.title}
        author={book.author || ""}
      />
      <View style={styles.bookInfo}>
        <Text
          style={[styles.bookTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}
          numberOfLines={2}
        >
          {book.title}
        </Text>
        {book.author ? (
          <Text
            style={[styles.bookAuthor, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}
            numberOfLines={1}
          >
            {book.author}
          </Text>
        ) : null}
        {book.description ? (
          <Text
            style={[styles.bookDesc, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}
            numberOfLines={2}
          >
            {book.description}
          </Text>
        ) : null}
        <View style={styles.bookMeta}>
          <Ionicons
            name="list-outline"
            size={14}
            color={isDark ? Colors.darkTextMid : Colors.textLight}
          />
          <Text style={[styles.bookMetaText, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
            {book.chapter_count || 0} অধ্যায়
          </Text>
        </View>
        <View style={[styles.readBtn, { backgroundColor: book.cover_color || Colors.navy }]}>
          <Text style={styles.readBtnText}>পড়ুন</Text>
          <Ionicons name="arrow-forward" size={14} color="white" />
        </View>
      </View>
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

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <ActivityIndicator size="large" color={Colors.navy} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
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
          { paddingTop: topPad + 16 },
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
            <Text style={[styles.headerLabel, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
              আমার পাঠশালা
            </Text>
            <Text style={[styles.headerTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
              বইয়ের তালিকা
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color={isDark ? Colors.darkBorder : Colors.border} />
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
              কোনো বই নেই
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
              অ্যাডমিন প্যানেল থেকে বই যোগ করুন
            </Text>
          </View>
        }
        renderItem={({ item }) => <BookCard book={item} />}
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
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  listHeader: {
    marginBottom: 24,
  },
  headerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  bookCard: {
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cover: {
    width: 90,
    height: 130,
    position: "relative",
    overflow: "hidden",
  },
  coverSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
  },
  coverAccentLine: {
    position: "absolute",
    left: 12,
    top: 14,
    right: 10,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  coverContent: {
    position: "absolute",
    left: 14,
    right: 8,
    top: 22,
    bottom: 20,
    justifyContent: "center",
  },
  coverTitle: {
    color: "white",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 4,
  },
  coverAuthor: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 9,
  },
  coverBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  bookInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  bookTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  bookAuthor: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 4,
  },
  bookDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },
  bookMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  readBtnText: {
    color: "white",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.navy,
    borderRadius: 10,
  },
  retryText: {
    color: "white",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
