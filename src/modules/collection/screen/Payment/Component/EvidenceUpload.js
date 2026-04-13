import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DocumentPicker from "react-native-document-picker";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const EvidenceUpload = ({ form, update }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  /* ---------------------------------------------------------
     PICK DOCUMENT (PDF / IMAGE / DOC / ANY FILE)
  --------------------------------------------------------- */
  const selectDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // allow all
        allowMultiSelection: false,
      });

      const file = res[0];

      update("evidence", {
        uri: file.uri,
        type: file.type,
        name: file.name,
        size: file.size,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return; // user cancelled
      console.log("DocumentPicker Error: ", err);
    }
  };

  const removeDocument = () => update("evidence", null);

  const isImage =
    form.evidence &&
    form.evidence.type &&
    form.evidence.type.startsWith("image");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Upload Evidence <Text style={{ color: "red" }}>*</Text>
      </Text>

      {!form.evidence ? (
        /* ---------------- EMPTY STATE ---------------- */
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={selectDocument}
            style={styles.emptyPress}
          >
            <LinearGradient
              colors={["#001B5E", "#2743A6", "#6F2DBD"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadBox}
            >
              <MaterialIcons
                name="cloud-upload"
                size={scale(30)}
                color="#fff"
                style={{ marginBottom: verticalScale(6) }}
              />
              <Text style={styles.uploadText}>Upload Evidence</Text>

              <LinearGradient
                colors={["rgba(255,255,255,0.25)", "transparent"]}
                style={styles.shine}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ) : (
        /* ---------------- ATTACHED DOCUMENT STATE ---------------- */
        <View style={styles.previewCard}>
          <View style={styles.previewRow}>
            <MaterialIcons
              name={isImage ? "image" : "description"}
              size={scale(24)}
              color="#001B5E"
            />
            <Text style={styles.previewLabel}>
              {form.evidence.name || "Attached File"}
            </Text>
          </View>

          {/* FILE PREVIEW (Only for Images) */}
          {isImage ? (
            <Image
              source={{ uri: form.evidence.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.nonImagePreview}>
              <MaterialIcons name="insert-drive-file" size={scale(35)} color="#6F2DBD" />
              <Text style={styles.fileName}>{form.evidence.name}</Text>
            </View>
          )}

          <Pressable
            onPress={removeDocument}
            style={({ pressed }) => [
              styles.removeButton,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
          >
            <MaterialIcons name="delete" size={scale(20)} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default React.memo(EvidenceUpload);

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(20),
  },

  label: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#222",
    marginBottom: verticalScale(8),
  },

  emptyPress: {
    borderRadius: moderateScale(16),
    overflow: "hidden",
  },

  uploadBox: {
    height: verticalScale(70),
    borderRadius: moderateScale(16),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 7,
    position: "relative",
  },

  uploadText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },

  shine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    opacity: 0.3,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
  },

  /* PREVIEW STATE */
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    borderWidth: scale(1),
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },

  previewLabel: {
    marginLeft: scale(8),
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#001B5E",
  },

  previewImage: {
    width: "100%",
    height: verticalScale(110),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(6),
  },

  nonImagePreview: {
    marginTop: verticalScale(10),
    alignItems: "center",
    paddingVertical: verticalScale(20),
  },

  fileName: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13),
    color: "#444",
    textAlign: "center",
  },

  removeButton: {
    position: "absolute",
    top: verticalScale(12),
    right: verticalScale(12),
    backgroundColor: "#D7263D",
    padding: moderateScale(6),
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
});
