import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format, differenceInYears } from "date-fns";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

// --- Responsive scale helpers ---
// const guidelineBaseWidth = 375;
// const guidelineBaseHeight = 812;
// const scale = (size) => (width / guidelineBaseWidth) * size;
// const verticalScale = (size) => (height / guidelineBaseHeight) * size;
// const moderateScale = (size, factor = 0.5) =>
//   size + (scale(size) - size) * factor;

const DateOfBirthInput = ({
  label,
  value,
  onChange,
  setError,
  error,
  type,
  businessDate,
  isRequired = true,
  hideAsterisk = false,
  minAge = 0,
  maxAge = 100,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // 🗓️ Build current date reference
  const today =
    businessDate && Array.isArray(businessDate) && businessDate.length === 3
      ? new Date(businessDate[0], businessDate[1] - 1, businessDate[2])
      : new Date();

  // 🔢 Validation Logic
  const validateDate = (date) => {
    if (!date) return null;

    const ageYears = differenceInYears(today, date);

    if (date > today) {
      return type === "incorpDate"
        ? "Incorporation date cannot be in the future."
        : "DOB cannot be in the future.";
    }
    console.log(date, today, 'DOB cannot be Future')
    if (ageYears < minAge) {
      if (type === "incorpDate") {
        return minAge === 1
          ? "Entity must be at least 1 year old."
          : `Entity must be at least ${minAge} year(s) old.`;
      }
      return `Applicant must be at least ${minAge} years old.`;
    }

    if (ageYears > maxAge) {
      return type === "incorpDate"
        ? `Entity age cannot exceed ${maxAge} years.`
        : `Applicant age cannot exceed ${maxAge} years.`;
    }

    return null;
  };

  const handleConfirm = (date) => {
    const formattedDate = format(date, "dd-MM-yyyy");
    const validationError = validateDate(date);
    console.log(validationError, 'validationErrorvalidationError')
    // 🧩 Log both selected date and current date
    console.log("📅 Selected Date:", date, today);
    console.log("🕒 Today's Date (Reference):", today);
    console.log("🧮 Formatted Date:", formattedDate);
    console.log("⚠️ Validation Error:", validationError);
    setError(validationError);
    if (!validationError) onChange(formattedDate);
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    if (value) {
      const parsed = new Date(value.split("-").reverse().join("-"));
      const validationError = validateDate(parsed);
      setError(validationError);
    }
  }, [minAge, maxAge, type, businessDate]);

  // 🧮 Date limits
  let maxSelectableDate = today;
  let minSelectableDate = new Date(
    today.getFullYear() - maxAge,
    today.getMonth(),
    today.getDate()
  );

  if (minAge === 1) {
    maxSelectableDate = new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate()
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {isRequired && !hideAsterisk && <Text style={styles.required}>*</Text>}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? "#DC2626" // red
              : isDarkMode
                ? "#555"
                : "#ccc",
            // backgroundColor: isDarkMode ? "#1E1E1E" : "#F9F9F9",
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: isDarkMode ? "#E5E5E5" : "#111" }]}
          value={value || ""}
          editable={false}
          placeholder="DD-MM-YYYY"
          placeholderTextColor={isDarkMode ? "#808080" : "#808080"}
        />

        <TouchableOpacity
          onPress={() => setDatePickerVisibility(true)}
          style={styles.iconContainer}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../asset/calendar.png")}
            style={[
              styles.icon,
              // { tintColor: isDarkMode ? "#E5E5E5" : "#2196F3" },
            ]}
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={maxSelectableDate}
        minimumDate={minSelectableDate}
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: moderateScale(5),
    marginVertical: verticalScale(4),
    // backgroundColor:'yellow',
    // height:height * 0.4
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#333",
    marginBottom: verticalScale(4),
    width: width * 0.4,
  },
  required: {
    color: "#DC2626",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: moderateScale(4),
    // backgroundColor:'pink',
    height: height * 0.05
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(6),
    fontSize: moderateScale(12),
    minHeight: verticalScale(38),
    color: "#333",
    fontWeight: "600",
    borderRadius: scale(6),
    // borderWidth: 1,
    // backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    // paddingHorizontal: moderateScale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: moderateScale(18),
    height: moderateScale(18),
    resizeMode: "contain",
  },
  errorText: {
    color: "#DC2626",
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
    minHeight: verticalScale(18),
  },
});

export default DateOfBirthInput;
