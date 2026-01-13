import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const VehicleTaskList = ({ tasks = [] }) => {
    const renderItem = useCallback(({ item }) => {
        return <TaskCard item={item} />;
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>My Tasks</Text>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No tasks assigned 🎉</Text>
                }
            />
        </View>
    );
};

const TaskCard = memo(({ item }) => {
    return (
        <TouchableOpacity activeOpacity={0.85} style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.appId}>{item.id}</Text>
                <StatusChip status={item.status} />
            </View>

            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.task}>{item.task}</Text>

            <Text style={styles.priority}>
                Priority: <Text style={{ fontWeight: '700' }}>{item.priority}</Text>
            </Text>
        </TouchableOpacity>
    );
});

const StatusChip = ({ status }) => {
    const color =
        status === 'Completed'
            ? '#16A34A'
            : status === 'In Progress'
                ? '#F59E0B'
                : '#DC2626';

    return (
        <View style={[styles.chip, { backgroundColor: color + '20' }]}>
            <Text style={[styles.chipText, { color }]}>{status}</Text>
        </View>
    );
};

export default memo(VehicleTaskList);

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        elevation: 2,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    appId: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E3A8A',
    },

    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginTop: 6,
    },

    task: {
        fontSize: 14,
        color: '#475569',
        marginTop: 2,
    },

    priority: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 6,
    },

    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    chipText: {
        fontSize: 12,
        fontWeight: '700',
    },

    emptyText: {
        textAlign: 'center',
        color: '#64748B',
        marginTop: 40,
    },
});

