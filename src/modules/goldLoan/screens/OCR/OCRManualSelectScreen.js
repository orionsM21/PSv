import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';

import { createField } from './configs/createField';
import { AUTO_HIGHLIGHT_RULES } from './parser/ocrAutoHighlight';

const FIELD_OPTIONS = [
    'firstName',
    'middleName',
    'lastName',
    'pan',
    'dob',
];

const OCRManualSelectScreen = ({
    imageUri,
    blocks = [],
    originalImageSize,
    autoSelectedKeys = [],
    onConfirm,
    onCancel,
}) => {
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [showFieldPicker, setShowFieldPicker] = useState(false);

    const IMAGE_WIDTH = 350;
    const IMAGE_HEIGHT = 500;

    const getAspectFit = (
        containerW,
        containerH,
        imageW,
        imageH
    ) => {
        const scale = Math.min(
            containerW / imageW,
            containerH / imageH
        );

        const renderedWidth = imageW * scale;
        const renderedHeight = imageH * scale;

        const offsetX = (containerW - renderedWidth) / 2;
        const offsetY = (containerH - renderedHeight) / 2;

        return { scale, offsetX, offsetY };
    };

    /* ---------------- SCALE BOX (CRITICAL) ---------------- */
    const scaleBox = useCallback(
        (box) => {
            if (!box || !originalImageSize) return null;

            const { scale, offsetX, offsetY } = getAspectFit(
                IMAGE_WIDTH,
                IMAGE_HEIGHT,
                originalImageSize.width,
                originalImageSize.height
            );

            return {
                left: box.left * scale + offsetX,
                top: box.top * scale + offsetY,
                width: box.width * scale,
                height: box.height * scale,
            };
        },
        [originalImageSize]
    );



    const getAutoHighlightStyle = (text = '') => {
        const upper = text.toUpperCase();

        for (const rule of Object.values(AUTO_HIGHLIGHT_RULES)) {
            if (rule.regex.test(upper)) {
                return rule;
            }
        }
        return null;
    };

    /* ---------------- SELECT BLOCK ---------------- */
    const toggleBlock = useCallback((block, multi = false) => {
        setSelectedBlocks(prev => {
            if (!multi) return [block];
            return prev.includes(block)
                ? prev.filter(b => b !== block)
                : [...prev, block];
        });
    }, []);

    /* ---------------- ASSIGN FIELD ---------------- */
    const assignField = (field) => {
        const combinedText = selectedBlocks.map(b => b.text).join(' ');

        onConfirm({
            [field]: createField(combinedText, 1), // manual = 100% confidence
        });

        setSelectedBlocks([]);
        setShowFieldPicker(false);
    };

    /* ---------------- DEBUG (REMOVE LATER) ---------------- */
    useEffect(() => {
        console.log('OCRManualSelectScreen');
        console.log('blocks:', blocks.length);
        console.log('originalImageSize:', originalImageSize);
        // console.log('imageLayout:', imageLayout);
    }, [blocks, originalImageSize,]);


    useEffect(() => {
        const autoSelected = blocks.filter(b =>
            Object.values(AUTO_HIGHLIGHT_RULES).some(rule =>
                rule.regex.test(b.text.toUpperCase())
            )
        );

        setSelectedBlocks(autoSelected);
    }, [blocks]);


    return (
        <Modal visible animationType="slide">
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Manual OCR Selection</Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* IMAGE + OCR BOXES */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ alignItems: 'center' }}
                    minimumZoomScale={1}
                    maximumZoomScale={3}
                    pinchGestureEnabled
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="contain"   // IMPORTANT
                            pointerEvents="none"
                        />

                        {blocks.map((block, index) => {
                            const scaled = scaleBox(block.box);
                            if (!scaled) return null;

                            const autoRule = getAutoHighlightStyle(block.text);
                            const isSelected = selectedBlocks.includes(block);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleBlock(block)}
                                    style={[
                                        styles.ocrBox,
                                        {
                                            left: scaled.left,
                                            top: scaled.top,
                                            width: scaled.width,
                                            height: scaled.height,

                                            backgroundColor: isSelected
                                                ? 'rgba(46, 204, 113, 0.45)' // selected = green
                                                : autoRule
                                                    ? autoRule.color           // PAN/DOB auto
                                                    : 'rgba(0,255,0,0.20)',    // default

                                            borderColor: isSelected
                                                ? '#2ecc71'
                                                : autoRule
                                                    ? autoRule.border
                                                    : 'lime',
                                        },
                                    ]}
                                />
                            );
                        })}

                    </View>



                </ScrollView>

                {/* FOOTER */}
                {selectedBlocks.length > 0 && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.assignBtn}
                            onPress={() => setShowFieldPicker(true)}
                        >
                            <Text style={styles.assignText}>
                                Assign ({selectedBlocks.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* FIELD PICKER */}
                <Modal visible={showFieldPicker} transparent>
                    <View style={styles.fieldPicker}>
                        <View style={styles.fieldPickerCard}>
                            {FIELD_OPTIONS.map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={styles.fieldBtn}
                                    onPress={() => assignField(f)}
                                >
                                    <Text style={styles.fieldText}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

export default OCRManualSelectScreen;


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },

    title: { fontSize: 16, fontWeight: '700' },
    cancel: { color: '#e74c3c', fontWeight: '600' },

    imageWrapper: {
        position: 'relative',
        width: 350,
        height: 500,
    },
    image: {
        width: 350,
        height: 500,
    },


    ocrBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'lime',
        backgroundColor: 'rgba(0,255,0,0.25)',
        zIndex: 1000,
    },


    footer: {
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
    },

    assignBtn: {
        backgroundColor: '#2ecc71',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },

    assignText: {
        color: '#000',
        fontWeight: '700',
    },

    fieldPicker: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fieldPickerCard: {
        backgroundColor: '#fff',
        width: '80%',
        borderRadius: 8,
        padding: 16,
    },

    fieldBtn: {
        padding: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },

    fieldText: {
        fontSize: 14,
        fontWeight: '600',
        color:'#000'
    },
});
