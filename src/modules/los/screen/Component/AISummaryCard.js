// components/ui/AISummaryCard.js
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

export default function AISummaryCard({ remoteEndpoint }) {
  const recent = useSelector(state => state.dashboard.recentActivity || []);
  const [loading, setLoading] = useState(false);
  const [serverSummary, setServerSummary] = useState(null);

  // Local quick insights (very fast)
  const insights = useMemo(() => {
    const total = recent.length;
    const idle = recent.filter(r => r.idleHours && Number(r.idleHours) > 12).length;
    const byUser = recent.reduce((acc, cur) => {
      if (!cur.user) return acc;
      acc[cur.user] = (acc[cur.user] || 0) + 1;
      return acc;
    }, {});
    const topUser = Object.entries(byUser).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
    return { total, idle, topUser, byUserCount: Object.keys(byUser).length };
  }, [recent]);

  useEffect(() => {
    let mounted = true;
    if (!remoteEndpoint) return;
    setLoading(true);
    apiClient.post(remoteEndpoint, { items: recent.slice(0, 200) }).then(res => {
      if (!mounted) return;
      setServerSummary(res.data?.summary || null);
    }).catch(()=>{}).finally(()=> mounted && setLoading(false));
    return () => mounted = false;
  }, [recent, remoteEndpoint]);

  return (
    <View style={styles.card}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        <Text style={styles.title}>AI Summary</Text>
        {loading ? <ActivityIndicator /> : null}
      </View>

      <Text style={styles.line}>Quick: {insights.total} recent events • {insights.idle} idle</Text>
      <Text style={styles.hint}>Top user: {insights.topUser || '—'}</Text>

      {serverSummary ? (
        <View style={{marginTop:8}}>
          <Text style={styles.serverTitle}>Server AI</Text>
          <Text style={styles.serverText}>{serverSummary.text}</Text>
        </View>
      ) : (
        <Text style={styles.serverTextSmall}>Server insights not available — local summarizer running.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#fff', borderRadius:14, padding:12, marginVertical:8, shadowColor:'#000',shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  title: { fontSize:16, fontWeight:'700' },
  line: { marginTop:8, color:'#444', fontWeight:'600' },
  hint: { marginTop:6, color:'#666' },
  serverTitle: { fontWeight:'700', marginTop:10 },
  serverText: { color:'#333', marginTop:4 },
  serverTextSmall: { marginTop:6, color:'#888', fontSize:12 }
});
