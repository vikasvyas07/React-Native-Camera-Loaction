import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {!loggedIn ? (
        <LoginScreen
          onLogin={(user) => {
            setUsername(user);
            setLoggedIn(true);
          }}
        />
      ) : (
        <HomeScreen username={username} onLogout={() => setLoggedIn(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7ff" },
});
