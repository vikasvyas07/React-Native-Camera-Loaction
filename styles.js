import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  popupTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  popupMsg: { fontSize: 14, color: "#555", marginBottom: 20 },

  allowBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  allowText: { color: "#fff", fontSize: 16 },

  cancelBtn: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: { color: "#333", fontSize: 16 },

  box: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  note: { marginTop: 10, textAlign: "center", color: "#777" },

  actionBtn: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  actionTxt: { fontWeight: "600", fontSize: 16 },
});
