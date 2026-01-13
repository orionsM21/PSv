// src/components/modals/modalStyles.js
import { StyleSheet } from "react-native";

export const modalStyles = StyleSheet.create({
  wrapper: {
    width: "95%",
    maxHeight: "85%",              // 🔥 LIMIT MODAL HEIGHT (IMPORTANT!)
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,

    // Shadow for both iOS & Android
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#001D56",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  buttonPrimary: {
    flex: 1,
    backgroundColor: "#001D56",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  buttonSecondary: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  buttonTextPrimary: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  buttonTextSecondary: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  // For Radio rows
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  radioLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 6,
    color: '#000'
  },
});
