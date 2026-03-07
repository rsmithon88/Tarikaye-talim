import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
  useColorScheme,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface DevSettings {
  dev_name: string;
  dev_address: string;
  dev_madrasa: string;
  dev_facebook: string;
  dev_mobile: string;
  dev_whatsapp: string;
  dev_email: string;
}

function InfoRow({
  icon,
  label,
  value,
  onPress,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
  isDark: boolean;
}) {
  if (!value) return null;
  const content = (
    <View style={[s.infoRow, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
      <View style={[s.infoIconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F0F4F8" }]}>
        <Ionicons name={icon} size={20} color={Colors.navy} />
      </View>
      <View style={s.infoTextWrap}>
        <Text style={[s.infoLabel, { color: isDark ? Colors.darkTextMid : Colors.textLight }]}>{label}</Text>
        <Text style={[s.infoValue, { color: isDark ? Colors.darkText : Colors.textDark }]}>{value}</Text>
      </View>
      {onPress && <Ionicons name="open-outline" size={18} color={isDark ? Colors.darkTextMid : Colors.textLight} />}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export default function DeveloperScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const { data: settings, isLoading } = useQuery<DevSettings>({
    queryKey: ["/api/settings"],
  });

  const topPad = Platform.OS === "web" ? 67 + insets.top : insets.top;

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const hasAnyInfo =
    settings &&
    (settings.dev_name ||
      settings.dev_address ||
      settings.dev_madrasa ||
      settings.dev_facebook ||
      settings.dev_mobile ||
      settings.dev_whatsapp ||
      settings.dev_email);

  return (
    <View style={[s.container, { backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
      <View style={[s.header, { paddingTop: topPad + 12, backgroundColor: isDark ? Colors.darkBg : Colors.cream }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.darkText : Colors.textDark} />
        </Pressable>
        <Text style={[s.headerTitle, { color: isDark ? Colors.darkText : Colors.textDark }]}>
          ডেভেলপার তথ্য
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.navy} />
        </View>
      ) : !hasAnyInfo ? (
        <View style={s.emptyWrap}>
          <Ionicons name="person-outline" size={48} color={isDark ? Colors.darkBorder : Colors.border} />
          <Text style={[s.emptyText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
            এখনো কোনো তথ্য যোগ করা হয়নি
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[s.profileCard, { backgroundColor: isDark ? Colors.darkSurface : Colors.white }]}>
            <View style={s.profileIconWrap}>
              <Ionicons name="code-slash" size={32} color="#fff" />
            </View>
            {settings?.dev_name ? (
              <Text style={[s.profileName, { color: isDark ? Colors.darkText : Colors.textDark }]}>
                {settings.dev_name}
              </Text>
            ) : null}
            {settings?.dev_madrasa ? (
              <Text style={[s.profileMadrasa, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
                {settings.dev_madrasa}
              </Text>
            ) : null}
          </View>

          <View style={s.infoSection}>
            <InfoRow
              icon="location-outline"
              label="ঠিকানা"
              value={settings?.dev_address || ""}
              isDark={isDark}
            />
            <InfoRow
              icon="call-outline"
              label="মোবাইল"
              value={settings?.dev_mobile || ""}
              onPress={settings?.dev_mobile ? () => openUrl(`tel:${settings.dev_mobile}`) : undefined}
              isDark={isDark}
            />
            <InfoRow
              icon="logo-whatsapp"
              label="WhatsApp"
              value={settings?.dev_whatsapp || ""}
              onPress={settings?.dev_whatsapp ? () => openUrl(`https://wa.me/${settings.dev_whatsapp.replace(/[^0-9]/g, "")}`) : undefined}
              isDark={isDark}
            />
            <InfoRow
              icon="mail-outline"
              label="ইমেইল"
              value={settings?.dev_email || ""}
              onPress={settings?.dev_email ? () => openUrl(`mailto:${settings.dev_email}`) : undefined}
              isDark={isDark}
            />
            <InfoRow
              icon="logo-facebook"
              label="ফেসবুক"
              value={settings?.dev_facebook || ""}
              onPress={settings?.dev_facebook ? () => openUrl(settings.dev_facebook) : undefined}
              isDark={isDark}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingBottom: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  profileMadrasa: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    textAlign: "center",
  },
  infoSection: { gap: 8 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
