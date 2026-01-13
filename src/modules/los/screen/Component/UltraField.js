import React, { useEffect, useMemo, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    Animated,
    Easing,
    useWindowDimensions,
    TouchableOpacity,
} from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

/**
 * UltraField
 * - Animated auto-height
 * - auto font-size shrink
 * - prevents mid-word breaks (textBreakStrategy / lineBreakStrategyIOS)
 */
const UltraField = ({
    label,
    value,
    isValid = false,
    editable = false,
    placeholder = "",
    type = "text",
    minFont = moderateScale(10),
    baseFont = moderateScale(12),
    maxHeight = verticalScale(220),
    onChangeText = () => { },
}) => {
    const stringValue = value != null ? String(value) : "";
    const multiline = stringValue.length > 25 || ["Address", "Description", "Remarks", "Organization Name"].some(k => label.includes(k));

    // animated height
    const initialHeight = multiline ? verticalScale(40) : verticalScale(34);
    const animHeight = useRef(new Animated.Value(initialHeight)).current;

    // simple auto font-size calculation (can be improved)
    const computedFont = useMemo(() => {
        const len = stringValue.length || 0;
        // reduce font by 1 for every 40 chars up to 6 steps
        const reduce = Math.min(6, Math.floor(len / 40));
        return Math.max(minFont, baseFont - reduce);
    }, [stringValue, baseFont, minFont]);

    const onContentSizeChange = (e) => {
        if (!multiline) return;
        const newH = Math.min(Math.max(e.nativeEvent.contentSize.height + verticalScale(8), verticalScale(40)), maxHeight);
        Animated.timing(animHeight, {
            toValue: newH,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={{
                fontSize: moderateScale(13),
                fontWeight: "600",
                color: "#000",
                marginBottom: verticalScale(4),
            }}>
                {label}
                {isValid && (
                    <Image
                        source={require("../../asset/greencheck.png")}
                        style={{ width: scale(12), height: scale(12), marginLeft: 6 }}
                    />
                )}
            </Text>

            <Animated.View style={{ height: multiline ? animHeight : undefined }}>
                <TextInput
                    value={stringValue}
                    onChangeText={onChangeText}
                    multiline={multiline}
                    editable={editable}
                    scrollEnabled={false}
                    onContentSizeChange={onContentSizeChange}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    style={{
                        width: "100%",
                        paddingVertical: verticalScale(8),
                        paddingHorizontal: moderateScale(8),
                        borderWidth: 1,
                        borderColor: "#bbb",
                        borderRadius: scale(6),
                        fontSize: computedFont,
                        fontWeight: "600",
                        color: "#111",
                        textAlignVertical: multiline ? "top" : "center",
                        includeFontPadding: false,
                    }}
                    // prevent mid-word breaks
                    textBreakStrategy="balanced"
                    lineBreakStrategyIOS="hangul-word"
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize={type === "email" ? "none" : "sentences"}
                />
            </Animated.View>
        </View>
    );
};

/**
 * Simple keyword-based grouping
 * Returns: [{ title: 'Basic', items: [...] }, ...]
 */
const groupFields = (fields) => {
    const groups = {
        Contact: { test: /email|mobile|phone|contact/i, items: [] },
        Identity: { test: /cin|pan|registration|gst|id|number/i, items: [] },
        Address: { test: /address|area|pincode|city|state|country/i, items: [] },
        Other: { test: /./i, items: [] },
    };

    fields.forEach(f => {
        const label = f.label || "";
        let placed = false;
        Object.keys(groups).forEach(k => {
            if (!placed && groups[k].test.test(label)) {
                groups[k].items.push(f);
                placed = true;
            }
        });
        if (!placed) groups.Other.items.push(f);
    });

    return Object.keys(groups).map(k => ({ title: k, items: groups[k].items }));
};

/**
 * UltraResponsiveGrid
 * - fields: [{ label, value, isValid, onChangeText? }]
 * - minColWidth: minimum column width (px) to compute number of columns
 */
export const UltraResponsiveGrid = ({ fields = [], minColWidth = 320, spacing = 12 }) => {
    const { width } = useWindowDimensions();

    // compute number of columns based on available width & minColWidth
    const columns = Math.max(1, Math.floor((width - 32) / minColWidth)); // 32 for padding margin
    const grouped = useMemo(() => groupFields(fields), [fields]);

    // flatten groups into rows but keep visual separation (group title)
    return (
        <View style={{ paddingHorizontal: 12 }}>
            {grouped.map(group => {
                if (!group.items || group.items.length === 0) return null;

                // chunk group.items into rows of `columns`
                const rows = [];
                for (let i = 0; i < group.items.length; i += columns) {
                    rows.push(group.items.slice(i, i + columns));
                }

                return (
                    <View key={group.title} style={{ marginBottom: verticalScale(12) }}>
                        <Text style={{ fontWeight: "700", marginBottom: verticalScale(8) }}>{group.title}</Text>

                        {rows.map((row, idx) => (
                            <View key={idx} style={{ flexDirection: "row", marginBottom: verticalScale(8) }}>
                                {row.map((f, i) => (
                                    <View key={i} style={{ flex: 1, paddingHorizontal: spacing / 2 }}>
                                        <UltraField
                                            label={f.label}
                                            value={f.value}
                                            isValid={f.isValid}
                                            editable={f.editable}
                                            type={f.type}
                                            onChangeText={f.onChangeText}
                                        />
                                    </View>
                                ))}
                                {/* fill empty columns */}
                                {row.length < columns && Array(columns - row.length).fill(0).map((_, k) => (
                                    <View key={`empty-${k}`} style={{ flex: 1, paddingHorizontal: spacing / 2 }} />
                                ))}
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
};
