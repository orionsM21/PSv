import { useFocusEffect } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const DEFAULT_ACCENT = '#8BD3FF';

function withAlpha(color, alpha = '22') {
  if (
    typeof color === 'string' &&
    color.startsWith('#') &&
    color.length === 7
  ) {
    return `${color}${alpha}`;
  }

  return 'rgba(255,255,255,0.08)';
}

function StatChip({ item, accent, compactLayout }) {
  return (
    <View
      style={[
        styles.statChip,
        compactLayout && styles.statChipCompact,
        {
          backgroundColor: withAlpha(accent, '14'),
          borderColor: withAlpha(accent, '26'),
        },
      ]}>
      <Text style={[styles.statValue, { color: accent }]}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
}

function HighlightChip({ item, accent, compactLayout }) {
  const label = typeof item === 'string' ? item : item.label;
  const icon = typeof item === 'string' ? 'sparkles-outline' : item.icon;

  return (
    <View
      style={[
        styles.highlightChip,
        compactLayout && styles.highlightChipCompact,
        { borderColor: withAlpha(accent, '22') },
      ]}>
      <Ionicons name={icon} size={14} color={accent} />
      <Text style={styles.highlightText}>{label}</Text>
    </View>
  );
}

function LoginLink({ item, accent }) {
  const label = typeof item === 'string' ? item : item.label;
  const onPress = typeof item === 'string' ? null : item.onPress;
  const disabled =
    typeof item === 'string'
      ? true
      : item.disabled || typeof item.onPress !== 'function';
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        linkTextTone: {
          color: disabled ? '#7B8797' : accent,
        },
      }),
    [accent, disabled],
  );

  const content = (
    <View
      style={[
        styles.linkChip,
        {
          backgroundColor: withAlpha(accent, disabled ? '10' : '14'),
          borderColor: withAlpha(accent, disabled ? '18' : '30'),
        },
      ]}>
      <Text style={[styles.linkText, dynamicStyles.linkTextTone]}>{label}</Text>
    </View>
  );

  if (disabled) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

export default function GenericLogin({
  title,
  subtitle,
  gradient,
  onLogin,
  loading,
  type = 'default',
  accent = DEFAULT_ACCENT,
  heroLabel = 'Secure Access',
  logo,
  footerText = 'Powered by',
  footerLogo,
  version = 'v1.0.0',
  showLinks = true,
  onBackPress,
  iconName = 'shield-checkmark-outline',
  stats = [],
  highlights = [],
  cardTitle = 'Sign in to continue',
  cardSubtitle = 'Use your registered credentials to continue into the workspace.',
  supportTitle = 'Secure workspace',
  supportText = 'Role-based authentication keeps access aligned to your assigned module.',
  buttonLabel = 'Continue',
  linkItems,
}) {
  const { width } = useWindowDimensions();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState(null);

  const isPhoneLogin = type === 'phone';
  const isCompactLayout = width < scale(390);
  const isDisabled =
    loading || !userId.trim() || (!isPhoneLogin && !password.trim());

  const resolvedLinks = useMemo(() => {
    if (Array.isArray(linkItems)) {
      return linkItems;
    }

    if (!showLinks) {
      return [];
    }

    return ['Login with OTP', 'Forgot Password?'];
  }, [linkItems, showLinks]);

  useFocusEffect(
    React.useCallback(() => {
      setUserId('');
      setPassword('');
      setSecure(true);
      setFocused(null);

      const handleBack = () => {
        if (onBackPress) {
          return onBackPress();
        }

        return false;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);

      return () => sub.remove();
    }, [onBackPress]),
  );

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[
              styles.wrapper,
              isCompactLayout && styles.wrapperCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[styles.topBar, isCompactLayout && styles.topBarCompact]}>
              {onBackPress ? (
                <Pressable
                  onPress={onBackPress}
                  style={({ pressed }) => [
                    styles.backBtn,
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name="arrow-back" size={18} color="#F8FAFC" />
                </Pressable>
              ) : (
                <View style={styles.backBtnPlaceholder} />
              )}

              <View
                style={[styles.pill, { borderColor: withAlpha(accent, '2E') }]}>
                <Ionicons
                  name="sparkles-outline"
                  size={13}
                  color={accent}
                  style={styles.pillIcon}
                />
                <Text style={[styles.pillText, { color: accent }]}>
                  {heroLabel}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.authCard,
                isCompactLayout && styles.authCardCompact,
              ]}>
              <View style={[styles.cardAccent, { backgroundColor: accent }]} />

              <View
                style={[
                  styles.brandRow,
                  isCompactLayout && styles.brandRowCompact,
                ]}>
                <View
                  style={[
                    styles.brandIcon,
                    { backgroundColor: withAlpha(accent, '18') },
                  ]}>
                  <Ionicons name={iconName} size={24} color={accent} />
                </View>

                {logo ? (
                  <View style={styles.brandLogoWrap}>
                    <Image
                      source={logo}
                      style={styles.brandLogo}
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
              </View>

              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>

              {/* {stats.length ? (
                <View
                  style={[
                    styles.statsWrap,
                    isCompactLayout && styles.statsWrapCompact,
                  ]}>
                  {stats.map(item => (
                    <StatChip
                      key={`${item.label}-${item.value}`}
                      item={item}
                      accent={accent}
                      compactLayout={isCompactLayout}
                    />
                  ))}
                </View>
              ) : null} */}

              {/* {highlights.length ? (
                <View
                  style={[
                    styles.highlightWrap,
                    isCompactLayout && styles.highlightWrapCompact,
                  ]}>
                  {highlights.map((item, index) => (
                    <HighlightChip
                      key={`${
                        typeof item === 'string' ? item : item.label
                      }-${index}`}
                      item={item}
                      accent={accent}
                      compactLayout={isCompactLayout}
                    />
                  ))}
                </View>
              ) : null} */}

              {/* <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{cardTitle}</Text>
                <Text style={styles.cardSubtitle}>{cardSubtitle}</Text>
              </View> */}

              {/* <View style={styles.supportCard}>
                <View
                  style={[
                    styles.supportIconWrap,
                    {backgroundColor: withAlpha(accent, '16')},
                  ]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={15}
                    color={accent}
                  />
                </View>
                <View style={styles.supportCopy}>
                  <Text style={styles.supportTitle}>{supportTitle}</Text>
                  <Text style={styles.supportText}>{supportText}</Text>
                </View>
              </View> */}

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {isPhoneLogin ? 'Mobile Number' : 'User ID'}
                  </Text>
                  <View
                    style={[
                      styles.inputShell,
                      focused === 'user' && [
                        styles.inputShellFocused,
                        { borderColor: accent, shadowColor: accent },
                      ],
                    ]}>
                    <Ionicons
                      name={isPhoneLogin ? 'call-outline' : 'person-outline'}
                      size={18}
                      color={focused === 'user' ? accent : '#94A3B8'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={
                        isPhoneLogin ? 'Enter mobile number' : 'Enter user ID'
                      }
                      placeholderTextColor="#94A3B8"
                      value={userId}
                      onChangeText={setUserId}
                      style={styles.input}
                      keyboardType={isPhoneLogin ? 'phone-pad' : 'default'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={isPhoneLogin ? 10 : undefined}
                      onFocus={() => setFocused('user')}
                      onBlur={() => setFocused(null)}
                    />
                  </View>
                </View>

                {!isPhoneLogin ? (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <View
                      style={[
                        styles.inputShell,
                        focused === 'pass' && [
                          styles.inputShellFocused,
                          { borderColor: accent, shadowColor: accent },
                        ],
                      ]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={focused === 'pass' ? accent : '#94A3B8'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder="Enter password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={secure}
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setFocused('pass')}
                        onBlur={() => setFocused(null)}
                      />
                      <Pressable
                        onPress={() => setSecure(current => !current)}
                        style={({ pressed }) => [
                          styles.eyeBtn,
                          pressed && styles.pressed,
                        ]}>
                        <Ionicons
                          name={secure ? 'eye-outline' : 'eye-off-outline'}
                          size={18}
                          color="#94A3B8"
                        />
                      </Pressable>
                    </View>
                  </View>
                ) : null}

                <Pressable
                  disabled={isDisabled}
                  onPress={() => onLogin({ userId, password })}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: accent },
                    isDisabled && styles.btnDisabled,
                    pressed && !isDisabled && styles.pressed,
                  ]}>
                  {loading ? (
                    <ActivityIndicator color="#08111F" />
                  ) : (
                    <>
                      <Text style={styles.btnText}>{buttonLabel}</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#08111F"
                      />
                    </>
                  )}
                </Pressable>

                {resolvedLinks.length ? (
                  <View style={styles.linksWrap}>
                    {resolvedLinks.map((item, index) => (
                      <LoginLink
                        key={`${typeof item === 'string' ? item : item.label
                          }-${index}`}
                        item={item}
                        accent={accent}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{footerText}</Text>
              {footerLogo ? (
                <Image
                  source={footerLogo}
                  style={styles.footerLogo}
                  resizeMode="contain"
                />
              ) : null}
              <Text style={styles.version}>{version}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
  },
  wrapperCompact: {
    justifyContent: 'flex-start',
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  topBarCompact: {
    marginBottom: verticalScale(12),
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  backBtnPlaceholder: {
    width: scale(40),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pillIcon: {
    marginRight: scale(6),
  },
  pillText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  authCard: {
    backgroundColor: 'rgba(250,252,255,0.98)',
    borderRadius: moderateScale(28),
    paddingHorizontal: scale(18),
    paddingBottom: verticalScale(18),
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(18),
    shadowOffset: { width: 0, height: verticalScale(12) },
    elevation: 8,
    overflow: 'hidden',
  },
  authCardCompact: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
  },
  cardAccent: {
    height: verticalScale(5),
    marginHorizontal: -scale(18),
    marginBottom: verticalScale(16),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  brandRowCompact: {
    alignItems: 'flex-start',
  },
  brandIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoWrap: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(16),
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5EBF3',
  },
  brandLogo: {
    width: scale(92),
    height: verticalScale(26),
  },
  heroTitle: {
    fontSize: moderateScale(24),
    lineHeight: moderateScale(30),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: verticalScale(6),
  },
  heroSubtitle: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    color: '#64748B',
  },
  statsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(14),
  },
  statsWrapCompact: {
    marginTop: verticalScale(12),
  },
  statChip: {
    minWidth: '31%',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    marginRight: scale(8),
    marginBottom: verticalScale(8),
  },
  statChipCompact: {
    minWidth: '47%',
  },
  statValue: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  statLabel: {
    color: '#64748B',
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  highlightWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  highlightWrapCompact: {
    marginBottom: verticalScale(6),
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    marginRight: scale(8),
    marginBottom: verticalScale(8),
    backgroundColor: '#FFFFFF',
  },
  highlightChipCompact: {
    width: '100%',
    marginRight: 0,
  },
  highlightText: {
    flexShrink: 1,
    marginLeft: scale(8),
    color: '#334155',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  cardHeader: {
    marginTop: verticalScale(6),
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: verticalScale(4),
  },
  cardSubtitle: {
    color: '#64748B',
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E6ECF2',
    marginBottom: verticalScale(14),
  },
  supportIconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  supportCopy: {
    flex: 1,
  },
  supportTitle: {
    color: '#0F172A',
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(3),
  },
  supportText: {
    color: '#64748B',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  form: {
    gap: 0,
  },
  field: {
    marginBottom: verticalScale(14),
  },
  fieldLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#334155',
    marginBottom: verticalScale(8),
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E1EB',
    borderRadius: moderateScale(16),
    backgroundColor: '#FFFFFF',
    minHeight: verticalScale(54),
    paddingHorizontal: scale(14),
  },
  inputShellFocused: {
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: verticalScale(5) },
    elevation: 2,
  },
  inputIcon: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#0F172A',
    paddingVertical: verticalScale(13),
  },
  eyeBtn: {
    marginLeft: scale(8),
  },
  btn: {
    minHeight: verticalScale(52),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: verticalScale(4),
  },
  btnDisabled: {
    opacity: 0.58,
  },
  btnText: {
    color: '#08111F',
    fontWeight: '800',
    fontSize: moderateScale(15),
    marginRight: scale(8),
  },
  linksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(16),
  },
  linkChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    marginRight: scale(10),
    marginBottom: verticalScale(10),
  },
  linkText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  footer: {
    marginTop: verticalScale(16),
    alignItems: 'center',
  },
  footerText: {
    fontSize: moderateScale(11),
    color: 'rgba(255,255,255,0.74)',
  },
  footerLogo: {
    height: verticalScale(24),
    width: scale(90),
    marginVertical: verticalScale(6),
  },
  version: {
    fontSize: moderateScale(11),
    color: 'rgba(255,255,255,0.74)',
  },
  pressed: {
    opacity: 0.92,
  },
});
