import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

const USER = "vikas";
const PASS = "12345";

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (username === USER && password === PASS) onLogin(username);
        else Alert.alert("Wrong!", "Incorrect username or password");
    };

    return (
        <View style={styles.loginMain}>
            <View style={styles.loginCard}>
                <Text style={styles.loginTitle}>Login</Text>
                <Text style={styles.loginSubtitle}>Enter your credentials</Text>

                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholderTextColor="#777"
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholderTextColor="#777"
                />

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                    <Text style={styles.loginBtnText}>Login</Text>
                </TouchableOpacity>

                <Text style={styles.useText}>Use → vikas / 12345</Text>
            </View>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    loginMain: { flex: 1, justifyContent: "center", alignItems: "center" },
    loginCard: { width: "85%", backgroundColor: "#fff", padding: 30, borderRadius: 16, elevation: 10 },
    loginTitle: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 5, color: "#222" },
    loginSubtitle: { textAlign: "center", color: "#666", marginBottom: 20 },
    input: { backgroundColor: "#f0f1f5", padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 16 },
    loginBtn: { backgroundColor: "#0d6efd", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 5 },
    loginBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    useText: { marginTop: 12, textAlign: "center", color: "#777" },
});
