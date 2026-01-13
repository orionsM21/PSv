import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setUITheme } from '../../../../redux/moduleSlice';


const THEMES = [
    { id: 'current', label: 'Current' },
    { id: 'glass', label: 'Glass' },
    { id: 'neo', label: 'Neo' },
    { id: 'glass_neo', label: 'Glass + Neo' },
];

const UIThemeSelector = () => {
    const dispatch = useDispatch();
    const activeTheme = useSelector(state => state.module.uiTheme);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>UI Theme</Text>

            <View style={styles.row}>
                {THEMES.map(theme => {
                    const active = theme.id === activeTheme;

                    return (
                        <TouchableOpacity
                            key={theme.id}
                            onPress={() => dispatch(setUITheme(theme.id))}
                            style={[
                                styles.chip,
                                active && styles.activeChip,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    active && styles.activeText,
                                ]}
                            >
                                {theme.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default memo(UIThemeSelector);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 12,
    },

    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },

    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        marginRight: 8,
        marginBottom: 8,
    },

    activeChip: {
        backgroundColor: '#1E3A8A',
    },

    chipText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '600',
    },

    activeText: {
        color: '#fff',
    },
});
