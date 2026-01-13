// FormModal.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const FormModal = ({
    visible,
    title,
    children,
    onCancel,
    onSubmit,
    submitText = "Add",
    height,
    // theme,
}) => {
    return (
        <Modal isVisible={visible}>
            <View
                style={{
                    width: "90%",
                    alignSelf: "center",
                    borderRadius: 12,
                    backgroundColor: "white",
                    paddingBottom: 16,
                }}
            >
                {/* Header */}
                <View style={{ marginTop: 12, alignItems: "center" }}>
                    <Text
                        style={{
                            fontSize: 22,
                            fontWeight: "bold",
                            color: '#001D56',
                        }}
                    >
                        {title}
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={{ marginTop: 10, alignItems: "center" }}>
                    {children}
                </View>

                {/* Footer Buttons */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                        paddingHorizontal: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={onCancel}
                        style={{
                            flex: 1,
                            height: 42,
                            borderRadius: 10,
                            marginRight: 8,
                            borderWidth: 2,
                            borderColor: '#001D56',
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "900",
                                color: '#001D56',
                            }}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onSubmit}
                        style={{
                            flex: 1,
                            height: 42,
                            borderRadius: 10,
                            marginLeft: 8,
                            backgroundColor: '#001D56',
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "900",
                                color: "white",
                            }}
                        >
                            {submitText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default FormModal;
