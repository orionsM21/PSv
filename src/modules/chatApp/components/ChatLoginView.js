import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import { Button, Card, Input } from '../../../design-system/components';
import { designTheme } from '../../../design-system/theme';
import ChatModuleShell from './ChatModuleShell';
import { SafeAreaView } from 'react-native-safe-area-context';

function ModePill({ label, icon, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modePill,
        active && styles.modePillActive,
        pressed && styles.pressed,
      ]}>
      <Ionicons
        name={icon}
        size={15}
        color={active ? '#FFFFFF' : '#0F766E'}
        style={styles.modeIcon}
      />
      <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function TrustCard({ icon, title, body }) {
  return (
    <View style={styles.trustCard}>
      <View style={styles.trustIconWrap}>
        <Ionicons name={icon} size={16} color="#0F766E" />
      </View>
      <View style={styles.trustCopy}>
        <Text style={styles.trustTitle}>{title}</Text>
        <Text style={styles.trustBody}>{body}</Text>
      </View>
    </View>
  );
}

function StatusPanel({ title, body, tone = 'default' }) {
  return (
    <View
      style={[styles.statusPanel, tone === 'error' && styles.statusPanelError]}>
      <View
        style={[
          styles.statusIconWrap,
          tone === 'error' && styles.statusIconWrapError,
        ]}>
        <Ionicons
          name={tone === 'error' ? 'alert-circle-outline' : 'sparkles-outline'}
          size={16}
          color={tone === 'error' ? '#DC2626' : '#0F766E'}
        />
      </View>
      <View style={styles.statusCopy}>
        <Text
          style={[
            styles.statusTitle,
            tone === 'error' && styles.statusTitleError,
          ]}>
          {title}
        </Text>
        <Text
          style={[
            styles.statusBody,
            tone === 'error' && styles.statusBodyError,
          ]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function ChatLoginView({
  phone,
  otp,
  email,
  password,
  isEmailMode,
  pendingPhoneLink,
  identityNotice,
  loading,
  error,
  confirmation,
  onPhoneChange,
  onOtpChange,
  onEmailChange,
  onPasswordChange,
  onVerifyOtp,
  onSubmit,
  onEmailLogin,
  onEmailSignup,
  toggleMode,
  onBack,
  onSavePhoneAfterEmailLogin,
}) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < scale(390);
  let statusTitle = 'Start with a trusted sign-in path';
  let statusBody =
    'Choose OTP for the fastest entry or switch to email when the account is already registered.';
  let statusTone = 'default';

  if (error) {
    statusTitle = 'Action needed';
    statusBody = error;
    statusTone = 'error';
  } else if (identityNotice) {
    statusTitle = 'Identity linked';
    statusBody = identityNotice;
  } else if (pendingPhoneLink) {
    statusTitle = 'Phone number required';
    statusBody = `Add a 10 digit mobile number to finish linking ${pendingPhoneLink.email} into one reusable chat profile.`;
  } else if (confirmation) {
    statusTitle = 'OTP sent successfully';
    statusBody =
      'Enter the code delivered to the mobile number to open the chat workspace.';
  } else if (isEmailMode) {
    statusTitle = 'Email access enabled';
    statusBody =
      'Sign in with existing credentials or create a new chat identity before linking a phone number.';
  }

  const renderForm = () => {
    if (pendingPhoneLink) {
      return (
        <>
          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={onPhoneChange}
            placeholder="Enter 10 digit number"
            containerStyle={styles.input}
          />

          <Button
            label="Save Phone & Continue"
            onPress={() =>
              onSavePhoneAfterEmailLogin(
                phone,
                pendingPhoneLink.uid,
                pendingPhoneLink.email,
              )
            }
            loading={loading}
            style={styles.primaryButton}
          />
        </>
      );
    }

    if (isEmailMode) {
      return (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={onEmailChange}
            placeholder="Enter email"
            containerStyle={styles.input}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={onPasswordChange}
            placeholder="Enter password"
            secureTextEntry
            containerStyle={styles.input}
          />

          <Button
            label="Login with Email"
            onPress={onEmailLogin}
            loading={loading}
            style={styles.primaryButton}
          />
          <Button
            label="Create New Account"
            onPress={onEmailSignup}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </>
      );
    }

    if (confirmation) {
      return (
        <>
          <Input
            label="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={onOtpChange}
            placeholder="Enter OTP"
            containerStyle={styles.input}
          />

          <Button
            label="Verify OTP"
            onPress={onVerifyOtp}
            loading={loading}
            style={styles.primaryButton}
          />
        </>
      );
    }

    return (
      <>
        <Input
          label="Mobile Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="Enter 10 digit mobile number"
          containerStyle={styles.input}
        />

        <Button
          label="Send OTP"
          onPress={onSubmit}
          loading={loading}
          style={styles.primaryButton}
        />
      </>
    );
  };

  return (
    <ChatModuleShell >
      {/* //     // title="Chat Access Hub"
    //     // subtitle="Move between OTP and email sign-in without leaving the secure customer communication workspace."
    //     // eyebrow="Realtime Messaging"
    //     // iconName="chatbubble-ellipses-outline"
    //     // scroll={false}
    //     // stats={[ */}
      {/* //     //   {label: 'Mode', value: isEmailMode ? 'Email' : 'Phone'},
    //     //   {label: 'Security', value: 'Protected'},
    //     //   {label: 'Sync', value: 'Live'},
    //     // ]}
    //     // highlights={[
    //     //   {icon: 'shield-checkmark-outline', label: 'Private customer access'},
    //     //   {icon: 'flash-outline', label: 'Fast OTP or email entry'},
    //     // ]}
    //     contentContainerStyle={styles.content}> */}
      <SafeAreaView style={styles.content}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <Card style={styles.formCard}>
            <View
              style={[
                styles.formHeader,
                isCompactLayout && styles.formHeaderCompact,
              ]}>
              <View>
                <Text style={styles.formTitle}>Enter secure chat workspace</Text>
                <Text style={styles.formBody}>
                  Use the flow that matches the customer account you want to open.
                </Text>
              </View>
              <View
                style={[
                  styles.secureBadge,
                  isCompactLayout && styles.secureBadgeCompact,
                ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color="#0F766E"
                  style={styles.secureBadgeIcon}
                />
                <Text style={styles.secureBadgeText}>Secure</Text>
              </View>
            </View>

            {!pendingPhoneLink ? (
              <View
                style={[
                  styles.modeRow,
                  isCompactLayout && styles.modeRowCompact,
                ]}>
                <ModePill
                  label="Phone Login"
                  icon="call-outline"
                  active={!isEmailMode}
                  onPress={isEmailMode ? toggleMode : undefined}
                />
                <ModePill
                  label="Email Login"
                  icon="mail-outline"
                  active={isEmailMode}
                  onPress={!isEmailMode ? toggleMode : undefined}
                />
              </View>
            ) : null}

            <StatusPanel
              title={statusTitle}
              body={statusBody}
              tone={statusTone}
            />

            {/* <View style={styles.trustRow}>
            <TrustCard
              icon="people-outline"
              title="Unified identity"
              body="Keep one chat profile even when the same person signs in with phone and email."
            />
            <TrustCard
              icon="sync-outline"
              title="Instant continuity"
              body="OTP, email, and phone linking stay in one guided flow without losing continuity."
            />
          </View> */}

            {renderForm()}

            <Button
              label="Back to Modules"
              variant="secondary"
              onPress={onBack}
              style={styles.backButton}
            />
          </Card>
        </KeyboardAvoidingView>

      </SafeAreaView >
    </ChatModuleShell>


  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    padding: designTheme.spacing[5],
    borderRadius: designTheme.radii.xl,
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  formHeaderCompact: {
    flexDirection: 'column',
  },
  formTitle: {
    ...designTheme.typography.h3,
    maxWidth: scale(220),
  },
  formBody: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[2],
    color: designTheme.semanticColors.textSecondary,
    maxWidth: scale(250),
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: designTheme.radii.pill,
    paddingHorizontal: designTheme.spacing[3],
    paddingVertical: designTheme.spacing[2],
    backgroundColor: 'rgba(15,118,110,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(15,118,110,0.16)',
  },
  secureBadgeCompact: {
    marginTop: verticalScale(12),
  },
  secureBadgeIcon: {
    marginRight: 6,
  },
  secureBadgeText: {
    ...designTheme.typography.caption,
    color: '#0F766E',
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: designTheme.spacing[5],
    marginBottom: designTheme.spacing[4],
  },
  modeRowCompact: {
    flexWrap: 'wrap',
  },
  modePill: {
    width: '48%',
    minHeight: verticalScale(48),
    borderRadius: designTheme.radii.md,
    borderWidth: 1,
    borderColor: 'rgba(15,118,110,0.16)',
    backgroundColor: 'rgba(15,118,110,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  modeIcon: {
    marginRight: 6,
  },
  modeLabel: {
    ...designTheme.typography.bodyStrong,
    color: '#0F766E',
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: designTheme.radii.lg,
    padding: designTheme.spacing[4],
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: 'rgba(15,118,110,0.16)',
    marginBottom: designTheme.spacing[4],
  },
  statusPanelError: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(220,38,38,0.16)',
  },
  statusIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.1)',
    marginRight: designTheme.spacing[3],
  },
  statusIconWrapError: {
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    ...designTheme.typography.bodyStrong,
    color: designTheme.semanticColors.textPrimary,
  },
  statusTitleError: {
    color: '#B91C1C',
  },
  statusBody: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[1],
    color: designTheme.semanticColors.textSecondary,
  },
  statusBodyError: {
    color: '#991B1B',
  },
  trustRow: {
    marginBottom: designTheme.spacing[2],
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: designTheme.radii.md,
    padding: designTheme.spacing[3],
    marginBottom: designTheme.spacing[3],
    backgroundColor: designTheme.semanticColors.surfaceMuted,
    borderWidth: 1,
    borderColor: designTheme.semanticColors.border,
  },
  trustIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,118,110,0.1)',
    marginRight: designTheme.spacing[3],
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    ...designTheme.typography.bodyStrong,
    color: designTheme.semanticColors.textPrimary,
  },
  trustBody: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
    color: designTheme.semanticColors.textSecondary,
    lineHeight: 18,
  },
  input: {
    marginTop: designTheme.spacing[2],
    marginBottom: designTheme.spacing[3],
  },
  primaryButton: {
    marginTop: designTheme.spacing[2],
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  secondaryButton: {
    marginTop: designTheme.spacing[3],
  },
  backButton: {
    marginTop: designTheme.spacing[3],
  },
  pressed: {
    opacity: 0.94,
  },
});
