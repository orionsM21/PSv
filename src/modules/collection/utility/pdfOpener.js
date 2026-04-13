// pdfOpener.js
import { Alert, Linking, Platform } from "react-native";
import IntentLauncher from "react-native-intent-launcher";
import RNFetchBlob from "rn-fetch-blob";

// ------------------------------------
// 1) Try to open using native PDF viewer
// ------------------------------------
export const openPdfNative = async (filePath) => {
  try {
    if (Platform.OS !== "android") {
      await Linking.openURL(filePath);
      return true;
    }

    await IntentLauncher.startActivity({
      action: "android.intent.action.VIEW",
      type: "application/pdf",
      data: "file://" + filePath,
      flags: 1,
    });

    return true;
  } catch (err) {
    return false;
  }
};

// ------------------------------------
// 2) Fallback to Google Drive Online Viewer
// ------------------------------------
export const openPdfOnline = async (filePath) => {
  try {
    const encoded = encodeURIComponent(filePath);
    const url =
      "https://drive.google.com/viewerng/viewer?embedded=true&url=" + encoded;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return false;

    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
};

// ------------------------------------
// Main Automatic Handler
// ------------------------------------
export const openPdfAuto = async (path) => {
  try {
    const exists = await RNFetchBlob.fs.exists(path);
    if (!exists) {
      Alert.alert("Error", "PDF file not found.");
      return;
    }

    // 1) Try native viewer (best)
    const openedNative = await openPdfNative(path);
    if (openedNative) return;

    // 2) Fallback to online viewer
    const openedOnline = await openPdfOnline(path);
    if (openedOnline) return;

    // 3) Final fallback
    Alert.alert(
      "No PDF Viewer",
      "Please install a PDF reader like Adobe Acrobat or WPS Office."
    );
  } catch (err) {
    Alert.alert("PDF Error", err?.message || "Unable to open PDF");
  }
};
