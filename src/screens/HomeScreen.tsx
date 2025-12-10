import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Modal, StyleSheet, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { launchCamera } from "react-native-image-picker";
import { request, check, RESULTS, PERMISSIONS, openSettings } from "react-native-permissions";

interface HomeScreenProps {
    username: string;
    onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ username, onLogout }) => {
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [showCameraPopup, setShowCameraPopup] = useState(false);

    const openLocation = async () => {
        const permission =
            Platform.OS === "android"
                ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
                : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const status = await request(permission);

        if (status === RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
                (pos) => {
                    Alert.alert("Your Location", `Lat: ${pos.coords.latitude}\nLong: ${pos.coords.longitude}`);
                },
                (err) => Alert.alert("Error", err.message)
            );
        } else if (status === RESULTS.BLOCKED) {
            Alert.alert("Blocked", "Enable location from settings", [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => openSettings() },
            ]);
        } else {
            Alert.alert("Denied", "You denied location permission.");
        }
    };

    const openCameraFunc = () => {
        launchCamera({ mediaType: "photo" }, (res) => {
            if (res.didCancel) Alert.alert("Cancelled", "Camera closed");
            else if (res.errorCode) Alert.alert("Error", res.errorMessage);
            else Alert.alert("Success", "Photo captured!");
        });
    };

    const handleCamera = async () => {
        const permission = Platform.OS === "android" ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
        const res = await check(permission);

        if (res === RESULTS.GRANTED) return openCameraFunc();

        const req = await request(permission);
        if (req === RESULTS.GRANTED) return openCameraFunc();
        else if (req === RESULTS.BLOCKED) {
            Alert.alert("Blocked", "Enable camera from settings", [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => openSettings() },
            ]);
        }
    };

    return (
        <View style={styles.homeMain}>
            {/* Location Modal */}
            <Modal visible={showLocationPopup} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popTitle}>Allow Location?</Text>
                        <Text style={styles.popMsg}>We need your location.</Text>
                        <TouchableOpacity
                            style={styles.popBtn}
                            onPress={() => {
                                setShowLocationPopup(false);
                                openLocation();
                            }}
                        >
                            <Text style={styles.popBtnText}>Allow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popCancel} onPress={() => setShowLocationPopup(false)}>
                            <Text style={styles.popCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Camera Modal */}
            <Modal visible={showCameraPopup} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.popup}>
                        <Text style={styles.popTitle}>Allow Camera?</Text>
                        <Text style={styles.popMsg}>We need camera access.</Text>
                        <TouchableOpacity
                            style={styles.popBtn}
                            onPress={() => {
                                setShowCameraPopup(false);
                                handleCamera();
                            }}
                        >
                            <Text style={styles.popBtnText}>Allow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popCancel} onPress={() => setShowCameraPopup(false)}>
                            <Text style={styles.popCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Home UI */}
            <View style={styles.homeHeader}>
                <Text style={styles.welcomeText}>Welcome, {username} 👋</Text>
                <Text style={styles.welcomeSub}>Good to see you again</Text>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowLocationPopup(true)}>
                <Text style={styles.actionText}>📍 Get Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCameraPopup(true)}>
                <Text style={styles.actionText}>📷 Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    homeMain: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    homeHeader: { backgroundColor: "#0d6efd", width: "100%", padding: 22, borderRadius: 14, marginBottom: 25 },
    welcomeText: { color: "#fff", fontSize: 24, fontWeight: "700" },
    welcomeSub: { color: "#e9e9e9", marginTop: 4 },
    actionBtn: { width: "100%", backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 3, marginBottom: 15, alignItems: "center", borderLeftWidth: 6, borderLeftColor: "#0d6efd" },
    actionText: { fontSize: 18, fontWeight: "600", color: "#0d6efd" },
    logoutBtn: { width: "100%", backgroundColor: "red", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
    logoutText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    popup: { backgroundColor: "#fff", width: "80%", padding: 20, borderRadius: 12, elevation: 8 },
    popTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
    popMsg: { color: "#666", marginBottom: 20 },
    popBtn: { backgroundColor: "#0d6efd", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
    popBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    popCancel: { backgroundColor: "#ddd", padding: 12, borderRadius: 8, alignItems: "center" },
    popCancelText: { color: "#444" },
});
