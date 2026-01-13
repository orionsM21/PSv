// components/ui/GlobalSearchBar.js
import React, { useState, useMemo, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';// or use your icon
import useDebouncedValue from './useDebouncedValue';

/**
 * Props:
 * - dataSource: { local: () => Promise<array>, remoteSearch?: (q) => Promise<array> } 
 * - onSelect(item)
 * - placeholder
 */
export default function GlobalSearchBar({ dataSource, onSelect, placeholder = "Search apps, leads, users..." }) {
    const [q, setQ] = useState('');
    const debQ = useDebouncedValue(q, 350);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function run() {
            if (!debQ || debQ.trim().length < 1) {
                setResults([]);
                setOpen(false);
                return;
            }
            setLoading(true);
            // local-first
            try {
                const local = dataSource?.local ? await dataSource.local(debQ) : [];
                if (mounted && local && local.length > 0) {
                    setResults(local);
                    setOpen(true);
                    setLoading(false);
                    return;
                }
                // fallback: remote search if provided
                if (dataSource?.remoteSearch) {
                    const remote = await dataSource.remoteSearch(debQ);
                    if (mounted) {
                        setResults(remote || []);
                        setOpen(true);
                    }
                } else {
                    // basic fuzzy filter if local data is available via getAll
                    if (dataSource?.getAll) {
                        const all = await dataSource.getAll();
                        const ql = debQ.toLowerCase();
                        const filtered = all.filter(it => {
                            const s = (it.applicationNo || '') + ' ' + (it.name || '') + ' ' + (it.leadId || '') + ' ' + (it.user || '');
                            return s.toLowerCase().includes(ql);
                        }).slice(0, 30);
                        if (mounted) setResults(filtered);
                        setOpen(true);
                    }
                }
            } catch (e) {
                console.warn('Search error', e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        run();
        return () => (mounted = false);
    }, [debQ]);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => { setOpen(false); setQ(''); onSelect(item); Keyboard.dismiss(); }} style={styles.item}>
            <Text style={styles.title}>{item.applicationNo ?? item.leadId ?? item.name ?? item.title}</Text>
            <Text style={styles.sub}>{item.user || item.stage || item.meta || ''}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <View style={styles.row}>
                <Icon name="search" size={20} color="#555" />
                <TextInput
                    placeholder={placeholder}
                    value={q}
                    onChangeText={setQ}
                    style={styles.input}
                    returnKeyType="search"
                    onSubmitEditing={() => { }}
                    clearButtonMode="while-editing"
                />
                {!!q && (
                    <TouchableOpacity onPress={() => setQ('')}>
                        <Icon name="close-circle" size={18} color="#666" />
                    </TouchableOpacity>
                )}

            </View>

            {open && (
                <View style={styles.results}>
                    <FlatList data={results} keyExtractor={(i, idx) => (i.applicationNo || i.leadId || i.id || idx).toString()} renderItem={renderItem} keyboardShouldPersistTaps="handled" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF9'
    },
    input: { flex: 1, fontSize: 14, color: '#222' },
    results: {
        maxHeight: 320, backgroundColor: '#fff', marginTop: 8, borderRadius: 12, padding: 6, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8
    },
    item: { paddingVertical: 10, paddingHorizontal: 8, borderBottomColor: '#f0f0f0', borderBottomWidth: 1 },
    title: { fontWeight: '700', color: '#111' },
    sub: { marginTop: 4, color: '#666', fontSize: 12 },
});
