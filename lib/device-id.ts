import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "device_id";

let cached: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem(KEY, id);
  }
  cached = id;
  return id;
}
