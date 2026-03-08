import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Platform,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getDeviceId } from "@/lib/device-id";
import { apiRequest } from "@/lib/query-client";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Bookmark {
  id: number;
  device_id: string;
  book_id: number;
  chapter_id: number;
  book_title: string;
  chapter_title: string;
  scroll_position: number;
  created_at: string;
}

export default function BookmarksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const { data: bookmarks, isLoading, refetch, isFetching } = useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks", deviceId],
    queryFn: async () => {
      if (!deviceId) return [];
      const res = await fetch(
        new URL(`/api/bookmarks?device_id=${deviceId}`, getApiUrl()).toString()
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!deviceId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const did = await getDeviceId();
      await apiRequest("DELETE", `/api/bookmarks/${id}?device_id=${did}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  const handleDelete = useCallback((id: number) => {
    if (Platform.OS === "web") {
      if (confirm("এই বুকমার্ক মুছে ফেলবেন?")) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert("বুকমার্ক মুছুন", "এই বুকমার্ক মুছে ফেলবেন?", [
        { text: "না", style: "cancel" },
        { text: "হ্যাঁ", style: "destructive", onPress: () => deleteMutation.mutate(id) },
      ]);
    }
  }, [deleteMutation]);

  if (isLoading || !deviceId) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      <FlatList
        data={bookmarks || []}
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
              বুকমার্ক
            </Text>
            <Text style={[styles.headerSub, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
              আপনার সংরক্ষিত পৃষ্ঠাগুলো
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="bookmark-outline" size={48} color={isDark ? Colors.darkBorder : Colors.border} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
              কোনো বুকমার্ক নেই
            </Text>
            <Text style={[styles.emptyHint, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
              অধ্যায় পড়ার সময় বুকমার্ক আইকনে ট্যাপ করুন
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push({ pathname: "/chapter/[id]", params: { id: item.chapter_id } });
            }}
            style={[styles.card, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
                <Ionicons name="bookmark" size={20} color={Colors.navy} />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={[styles.cardBook, { color: isDark ? Colors.darkTextMid : Colors.textLight }]} numberOfLines={1}>
                  {item.book_title}
                </Text>
                <Text style={[styles.cardChapter, { color: isDark ? Colors.darkText : Colors.textDark }]} numberOfLines={1}>
                  {item.chapter_title}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id)}
                hitSlop={10}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#E74C3C" />
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

import { getApiUrl } from "@/lib/query-client";

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontFamily: "SolaimanLipi-Bold", fontSize: 22 },
  headerSub: { fontFamily: "SolaimanLipi", fontSize: 13, marginTop: 4 },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "SolaimanLipi", fontSize: 15 },
  emptyHint: { fontFamily: "SolaimanLipi", fontSize: 12, textAlign: "center" },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextWrap: { flex: 1 },
  cardBook: { fontFamily: "SolaimanLipi", fontSize: 11, marginBottom: 2 },
  cardChapter: { fontFamily: "SolaimanLipi-Bold", fontSize: 15 },
  deleteBtn: { padding: 8 },
});
