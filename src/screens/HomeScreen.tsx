import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Geolocation from "@react-native-community/geolocation";
import { launchCamera } from "react-native-image-picker";
import { request, RESULTS, PERMISSIONS, openSettings } from "react-native-permissions";

interface HomeScreenProps {
  username: string;
  onLogout: () => void;
}

type Message = {
  id: string;
  type: "text" | "image" | "location";
  content: string;
  time?: string;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ username = "User", onLogout }) => {
  
  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    addMessage({
      id: Date.now().toString(),
      type: "text",
      content: "👋 Welcome! This chat is ready — type below or use the buttons.",
      time: nowTime(),
    });
  }, []);

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const addMessage = (msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const sendTextMessage = () => {
    const txt = inputText.trim();
    if (!txt) return;
    addMessage({ id: Date.now().toString(), type: "text", content: txt, time: nowTime() });
    setInputText("");
  };

  const openMapWithLocation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open Google Maps."));
  };

  // 🔥 UNIFIED PERMISSION FUNCTION
  const requestAllPermissions = async () => {
    const camera =
      Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;

    const location =
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
        : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    let results: any[] = [];

    results.push(await request(camera));
    results.push(await request(location));

    // BLOCKED
    if (results.includes(RESULTS.BLOCKED)) {
      Alert.alert(
        "Permission Blocked",
        "Enable Camera & Location from Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => openSettings() },
        ]
      );
      return false;
    }

    // DENIED
    if (results.includes(RESULTS.DENIED)) {
      Alert.alert("Permission Required", "Camera & Location are required.");
      return false;
    }

    return true;
  };

  // 🔥 Custom popup BEFORE permission request
  const showAllowDialog = (callback: () => void) => {
    Alert.alert(
      "Permission Required",
      "Please allow permissions to proceed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Allow", onPress: callback },
      ]
    );
  };

  // 🔥 LOCATION SENDER
  const sendLocation = () => {
    showAllowDialog(async () => {
      const ok = await requestAllPermissions();
      if (!ok) return;

      setLoading(true);
      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLoading(false);
          addMessage({
            id: Date.now().toString(),
            type: "location",
            content: `${latitude},${longitude}`,
            time: nowTime(),
          });
        },
        (err) => {
          setLoading(false);
          Alert.alert("Location Error", err.message);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  };

  // 🔥 CAMERA SENDER
  const sendCameraImage = () => {
    showAllowDialog(async () => {
      const ok = await requestAllPermissions();
      if (!ok) return;

      launchCamera({ mediaType: "photo", saveToPhotos: true }, (res) => {
        if (res.didCancel) return;
        if (res.errorCode) return Alert.alert("Error", res.errorMessage);

        if (res.assets && res.assets[0].uri) {
          addMessage({
            id: Date.now().toString(),
            type: "image",
            content: res.assets[0].uri,
            time: nowTime(),
          });
        }
      });
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          
          {/* HEADER UI (UNCHANGED) */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}>Start ✔</Text>
              <Text style={styles.appSubtitle}>Welcome, {username}</Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutTxt}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* CHAT AREA (UNCHANGED) */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
          >
            {messages.map((m) => (
              <View key={m.id} style={styles.messageRow}>
                <View style={styles.bubble}>
                  {m.type === "text" && <Text style={styles.bubbleText}>{m.content}</Text>}

                  {m.type === "location" && (
                    <>
                      <Text style={styles.bubbleText}>📍 Location</Text>
                      <Text style={styles.locationText}>{m.content}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const [lat, lng] = m.content.split(",");
                          openMapWithLocation(Number(lat), Number(lng));
                        }}
                      >
                        <Text style={styles.mapLink}>Open in Maps</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {m.type === "image" && (
                    <Image source={{ uri: m.content }} style={styles.imageMsg} />
                  )}

                  <Text style={styles.timeText}>{m.time}</Text>
                </View>
              </View>
            ))}

            {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}
          </ScrollView>

          {/* BOTTOM BAR (UNCHANGED) */}
          <View style={styles.bottomBar}>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={sendLocation} style={styles.iconBtn}>
                <Text style={styles.icon}>📍</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={sendCameraImage} style={styles.iconBtn}>
                <Text style={styles.icon}>📸</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
            />

            <TouchableOpacity style={styles.sendButton} onPress={sendTextMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HomeScreen;

// ⭐ YOUR ORIGINAL UI STYLES — UNCHANGED
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ebeff5",
  },
  appTitle: { fontSize: 18, fontWeight: "700", color: "#1A73E8" },
  appSubtitle: { fontSize: 13, color: "#666" },

  logoutBtn: { backgroundColor: "#1A73E8", padding: 8, borderRadius: 6 },
  logoutTxt: { color: "#fff", fontWeight: "600" },

  chatArea: { flex: 1, paddingHorizontal: 14 },
  chatContent: { paddingVertical: 16 },

  messageRow: { marginBottom: 12, alignItems: "flex-start" },

  bubble: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6ebf2",
  },
  bubbleText: { fontSize: 15, color: "#111" },
  locationText: { fontSize: 13, marginTop: 4 },
  mapLink: { marginTop: 6, color: "#1A73E8", fontWeight: "600" },

  imageMsg: { width: 180, height: 140, borderRadius: 8, marginTop: 6 },
  timeText: { fontSize: 11, color: "#888", marginTop: 6, textAlign: "right" },

  bottomBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#e6ebf2",
    backgroundColor: "#fff",
  },

  actionButtons: { flexDirection: "row", marginRight: 8 },
  iconBtn: { marginRight: 4, padding: 6 },
  icon: { fontSize: 22 },

  input: {
    flex: 1,
    backgroundColor: "#f1f4f8",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginHorizontal: 6,
  },
  sendButton: {
    backgroundColor: "#1A73E8",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
  },
  sendText: { color: "#fff", fontWeight: "700" },
});
