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
import { request, check, RESULTS, PERMISSIONS, openSettings } from "react-native-permissions";

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
  // enable LayoutAnimation on Android
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
    // welcome message (other/system)
    addMessage({
      id: Date.now().toString(),
      type: "text",
      content: "👋 Welcome! This chat is ready — type below or use the buttons.",
      time: nowTime(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nowTime() {
    const d = new Date();
    // format HH:MM
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const addMessage = (msg: Message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => {
      const next = [...prev, msg];
      // auto scroll after tiny delay
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
      return next;
    });
  };

  const sendTextMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    addMessage({ id: Date.now().toString(), type: "text", content: text, time: nowTime() });
    setInputText("");
  };

  const openMapWithLocation = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open Google Maps."));
  };

  // location
  const sendLocation = async () => {
    setLoading(true);
    const permission = Platform.OS === "android"
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    try {
      const status = await request(permission);

      if (status === RESULTS.GRANTED) {
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
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else if (status === RESULTS.BLOCKED) {
        setLoading(false);
        Alert.alert("Permission Blocked", "Enable location from settings", [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => openSettings() },
        ]);
      } else {
        setLoading(false);
        Alert.alert("Permission Denied", "Location permission denied.");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Failed to request location permission.");
    }
  };

  // camera
  const sendCameraImage = async () => {
    const permission = Platform.OS === "android"
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.IOS.CAMERA;

    try {
      const checkStatus = await check(permission);
      if (checkStatus !== RESULTS.GRANTED) {
        const req = await request(permission);
        if (req !== RESULTS.GRANTED) {
          if (req === RESULTS.BLOCKED) {
            Alert.alert("Camera Blocked", "Enable camera from Settings", [
              { text: "Cancel", style: "cancel" },
              { text: "Settings", onPress: () => openSettings() },
            ]);
          } else {
            Alert.alert("Camera Denied", "Please enable camera access.");
          }
          return;
        }
      }

      launchCamera({ mediaType: "photo", saveToPhotos: true }, (res) => {
        if (res.didCancel) return;
        if (res.errorCode) return Alert.alert("Error", res.errorMessage || "Camera error");
        if (res.assets && res.assets[0].uri) {
          addMessage({
            id: Date.now().toString(),
            type: "image",
            content: res.assets[0].uri,
            time: nowTime(),
          });
        }
      });
    } catch (e) {
      Alert.alert("Error", "Camera permission failed.");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appTitle}> Start ✔</Text>
              <Text style={styles.appSubtitle}>Welcome, {username}</Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutTxt}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Chat / messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
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
                    <Image source={{ uri: m.content }} style={styles.imageMsg} resizeMode="cover" />
                  )}

                  {/* timestamp */}
                  {m.time ? <Text style={styles.timeText}>{m.time}</Text> : null}
                </View>
              </View>
            ))}

            {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}
          </ScrollView>

          {/* Bottom bar */}
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
              placeholderTextColor="#8a8a8a"
              returnKeyType="send"
              onSubmitEditing={sendTextMessage}
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

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === "android" ? 20 : 8, // small android top spacing
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#ebeff5",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  appTitle: { fontSize: 18, fontWeight: "700", color: "#1A73E8" },
  appSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },

  logoutBtn: {
    backgroundColor: "#1A73E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutTxt: { color: "#fff", fontWeight: "600" },

  chatArea: { flex: 1, paddingHorizontal: 14 },
  chatContent: { paddingTop: 12, paddingBottom: 20 },

  messageRow: {
    marginBottom: 10,
    alignItems: "flex-start", // keep simple left alignment for uniform professional look
  },

  bubble: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    maxWidth: "87%",
    borderWidth: 1,
    borderColor: "#eef2f7",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  bubbleText: { fontSize: 15, color: "#111", lineHeight: 20 },
  locationText: { marginTop: 6, color: "#333", fontSize: 13 },

  mapLink: { marginTop: 8, color: "#1A73E8", fontWeight: "600" },

  imageMsg: {
    width: 180,
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6eaf0",
    marginTop: 6,
  },

  timeText: { marginTop: 6, fontSize: 11, color: "#888", textAlign: "right" },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eef2f7",
    backgroundColor: "#fff",
    // extra bottom padding for Android navigation bar
    paddingBottom: Platform.OS === "android" ? 22 : 12,
  },

  actionButtons: { flexDirection: "row", marginRight: 8 },
  iconBtn: { marginHorizontal: 4, padding: 6 },
  icon: { fontSize: 22 },

  input: {
    flex: 1,
    backgroundColor: "#f1f4f8",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: "#111",
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: "#1A73E8",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
  },
  sendText: { color: "#fff", fontWeight: "700" },
});
