import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { apiRequest } from "@/lib/query-client";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [supportName, setSupportName] = useState("");
  const [supportAddress, setSupportAddress] = useState("");
  const [supportMobile, setSupportMobile] = useState("");
  const [supportDetails, setSupportDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRefresh = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    queryClient.invalidateQueries();
  };

  const handleSendSupport = async () => {
    if (!supportName.trim() || !supportDetails.trim()) {
      const msg = "নাম ও বিস্তারিত লিখুন";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("ত্রুটি", msg);
      }
      return;
    }
    setSending(true);
    try {
      await apiRequest("POST", "/api/support", {
        name: supportName.trim(),
        address: supportAddress.trim(),
        mobile: supportMobile.trim(),
        details: supportDetails.trim(),
      });
      setSent(true);
      setSupportName("");
      setSupportAddress("");
      setSupportMobile("");
      setSupportDetails("");
      setTimeout(() => setSent(false), 4000);
    } catch {
      const msg = "পাঠাতে সমস্যা হয়েছে";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("ত্রুটি", msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.pageTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
          সেটিংস
        </Text>

        <View style={[styles.section, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/developer");
            }}
            style={styles.menuItem}
          >
            <Ionicons name="information-circle-outline" size={22} color={Colors.navy} />
            <Text style={[styles.menuText, { color: isDark ? Colors.darkText : Colors.textDark }]}>ডেভেলপার তথ্য</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.darkTextMid : Colors.textLight} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? Colors.darkBorder : Colors.border }]} />

          <Pressable onPress={handleRefresh} style={styles.menuItem}>
            <Ionicons name="refresh" size={22} color={Colors.navy} />
            <Text style={[styles.menuText, { color: isDark ? Colors.darkText : Colors.textDark }]}>রিফ্রেশ করুন</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.darkTextMid : Colors.textLight} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>
          যোগাযোগ ও সাপোর্ট
        </Text>
        <View style={[styles.supportBox, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
          {sent ? (
            <View style={styles.sentWrap}>
              <Ionicons name="checkmark-circle" size={48} color="#27AE60" />
              <Text style={[styles.sentText, { color: isDark ? Colors.darkText : Colors.textDark }]}>
                আপনার বার্তা পাঠানো হয়েছে!
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                style={[styles.input, {
                  color: isDark ? Colors.darkText : Colors.textDark,
                  backgroundColor: isDark ? Colors.darkBg : Colors.cream,
                  borderColor: isDark ? Colors.darkBorder : Colors.border,
                }]}
                placeholder="আপনার নাম *"
                placeholderTextColor={isDark ? Colors.darkTextMid : Colors.textLight}
                value={supportName}
                onChangeText={setSupportName}
              />
              <TextInput
                style={[styles.input, {
                  color: isDark ? Colors.darkText : Colors.textDark,
                  backgroundColor: isDark ? Colors.darkBg : Colors.cream,
                  borderColor: isDark ? Colors.darkBorder : Colors.border,
                }]}
                placeholder="ঠিকানা"
                placeholderTextColor={isDark ? Colors.darkTextMid : Colors.textLight}
                value={supportAddress}
                onChangeText={setSupportAddress}
              />
              <TextInput
                style={[styles.input, {
                  color: isDark ? Colors.darkText : Colors.textDark,
                  backgroundColor: isDark ? Colors.darkBg : Colors.cream,
                  borderColor: isDark ? Colors.darkBorder : Colors.border,
                }]}
                placeholder="মোবাইল নাম্বার"
                placeholderTextColor={isDark ? Colors.darkTextMid : Colors.textLight}
                value={supportMobile}
                onChangeText={setSupportMobile}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.textArea, {
                  color: isDark ? Colors.darkText : Colors.textDark,
                  backgroundColor: isDark ? Colors.darkBg : Colors.cream,
                  borderColor: isDark ? Colors.darkBorder : Colors.border,
                }]}
                placeholder="বিস্তারিত লিখুন... *"
                placeholderTextColor={isDark ? Colors.darkTextMid : Colors.textLight}
                value={supportDetails}
                onChangeText={setSupportDetails}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Pressable
                onPress={handleSendSupport}
                disabled={sending}
                style={[styles.sendBtn, sending && { opacity: 0.6 }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendBtnText}>
                  {sending ? "পাঠানো হচ্ছে..." : "পাঠান"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  pageTitle: { fontFamily: "SolaimanLipi-Bold", fontSize: 22, marginBottom: 20 },
  section: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuText: { fontFamily: "SolaimanLipi", fontSize: 16, flex: 1 },
  divider: { height: 1, marginHorizontal: 16 },
  sectionTitle: {
    fontFamily: "SolaimanLipi-Bold",
    fontSize: 13,
    marginTop: 28,
    marginBottom: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  supportBox: {
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "SolaimanLipi",
    fontSize: 15,
    marginBottom: 10,
  },
  textArea: { minHeight: 100 },
  sendBtn: {
    backgroundColor: Colors.navy,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  sendBtnText: { fontFamily: "SolaimanLipi-Bold", fontSize: 15, color: "#fff" },
  sentWrap: { alignItems: "center", paddingVertical: 24, gap: 12 },
  sentText: { fontFamily: "SolaimanLipi", fontSize: 16 },
});
