import React, { useContext } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    StyleSheet,
    Platform,
} from 'react-native';
import { DrawerContext } from '../Drawer/DrawerContext';

const ApplicationHistory = () => {
    const { openDrawer } = useContext(DrawerContext);

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            {/* HEADER */}
            <View style={styles.headerWrapper}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.headerLeft}
                        onPress={openDrawer}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={require('../../asset/menus.png')}
                            style={styles.drawerIcon}
                        />
                        <Text style={styles.headerTitle}>Application Status</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* MAIN CONTENT */}
            <View style={styles.mainContainer}>
                <Text style={styles.heading}>Application History</Text>
                <Text style={styles.subText}>Track all your loan / lead applications here.</Text>

                {/* Placeholder for now */}
                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>No applications found</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ApplicationHistory;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#005BEA',
    },

    headerWrapper: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#005BEA',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    drawerIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 12,
    },

    mainContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 16,
    },

    heading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
    },

    subText: {
        fontSize: 15,
        marginTop: 4,
        color: '#555',
    },

    placeholderBox: {
        marginTop: 40,
        padding: 20,
        borderRadius: 14,
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },

    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
});


// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const ApplicationHistory = () => {
//   return (
//     <View>
//       <Text>ApplicationHistory</Text>
//     </View>
//   )
// }

// export default ApplicationHistory

// const styles = StyleSheet.create({})