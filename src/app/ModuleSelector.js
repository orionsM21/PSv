import React, { useCallback, useRef, memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setModule } from '../redux/moduleSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Dropdown } from 'react-native-element-dropdown';
import { scale, verticalScale } from 'react-native-size-matters';
import { triggerHaptic } from '../common/utils/haptics';

const MODULES = [
  {
    id: 'gold',
    title: 'Gold Loan',
    subtitle: 'Gold backed lending',
    icon: 'cash-outline',
    gradient: ['rgba(255, 214, 79, 0.73)', 'rgba(255, 179, 0, 0.73)'],
  },
  {
    id: 'vehicle',
    title: 'Vehicle Loan',
    subtitle: 'Auto financing',
    icon: 'car-sport-outline',
    gradient: ['rgba(66, 164, 245, 0.65)', 'rgba(30, 136, 229, 0.69)'],
  },
  {
    id: 'los',
    title: 'LOS',
    subtitle: 'Loan origination',
    icon: 'layers-outline',
    gradient: ['rgba(102, 187, 106, 0.73)', 'rgba(56, 142, 60, 0.7)'],
  },
  {
    id: 'collection',
    title: 'Collection',
    subtitle: 'Recovery & repayment',
    icon: 'wallet-outline',
    gradient: ['rgba(170, 71, 188, 0.53)', 'rgba(105, 27, 154, 0.69)'],
  },
  // ✅ NEW MODULE
  {
    id: 'payment',
    title: 'Payment',
    subtitle: 'EMI & loan payments',
    icon: 'card-outline',
    gradient: ['rgba(244, 67, 54, 0.75)', 'rgba(211, 47, 47, 0.8)'],
  },

   {
    id: 'chat',
    title: 'Chat',
    subtitle: 'WhatsApp & Commnication',
    icon: 'card-outline',
    gradient: ['rgba(98, 244, 54, 0.75)', 'rgba(112, 189, 97, 0.8)'],
  },
];

const ROLE_OPTIONS = [
  { label: 'TruCollect', value: 'COLLECTION_AGENT' },
  { label: 'AFPL', value: 'LOAN_OFFICER' },
  { label: 'AHFPL', value: 'ADMIN' },
];

const MODULE_PERMISSION = {
  ADMIN: ['gold', 'vehicle', 'los', 'collection', 'payment'],
  LOAN_OFFICER: ['gold', 'vehicle', 'los','chat'],
  COLLECTION_AGENT: ['collection'],
};

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonIcon} />
    <View style={{ flex: 1 }}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
    </View>
  </View>
);

export default function ModuleSelector() {
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [focus, setFocus] = useState(false);
  const [loading, setloading] = useState(false);
  const allowedModules = useMemo(() => {
    if (!role || !MODULE_PERMISSION[role]) return [];

    return MODULES.filter(m =>
      MODULE_PERMISSION[role].includes(m.id)
    );
  }, [role]);

  console.log(allowedModules, role, MODULES, 'allowedModulesallowedModules')
  const handleSelectModule = useCallback(
    (moduleId) => {
      if (!moduleId) return; // 🛡️ safety
      dispatch(setModule(moduleId));
    },
    [dispatch]
  );


  const ModuleCard = memo(({ item, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const pressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      triggerHaptic();
      onPress(item.id);
    };


    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
        <Pressable
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handlePress}
        >
          <LinearGradient colors={item.gradient} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={26} color="#fff" />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="rgba(255,255,255,0.6)"
            />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  });


  return (
    <>
      <StatusBar
        backgroundColor="#0B1220"
        barStyle="light-content"
      />
      <SafeAreaView style={styles.container}>


        <Text style={styles.header}></Text>
        <Text style={styles.subHeader}>
          Select Your Company  and continue securely
        </Text>

        {/* ROLE DROPDOWN */}
        <Dropdown
          style={[styles.dropdown, focus && styles.focused]}
          data={ROLE_OPTIONS}
          labelField="label"
          valueField="value"
          placeholder={!focus ? 'Select role' : '...'}
          value={role}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(item) => {
            console.log('Selected Org', item)

            setRole(item.value);
            setFocus(false);
          }}
          renderLeftIcon={() => (
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#64748B"
              style={{ marginRight: 8 }}
            />
          )}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholder}
          itemTextStyle={styles.itemText}
          activeColor="rgba(99,102,241,0.08)"
        />



        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : <FlatList
            data={allowedModules}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <ModuleCard item={item} onPress={handleSelectModule} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 24 }}
            ListEmptyComponent={
              role ? (
                <Text style={styles.emptyText}>
                  No modules available for this role
                </Text>
              ) : null
            }
          />
        }
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    // paddingHorizontal: 20,
    paddingBottom: 12, // 👈 subtle protection
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: '#2196F3',
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  subHeader: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    marginBottom: 16,
  },
  dropdown: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  focused: {
    borderColor: '#6366F1',
  },
  placeholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  itemText: {
    fontSize: 14,
    color: '#0F172A',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
  },
});


