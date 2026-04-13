import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import VehicleModuleScreen from '../components/VehicleModuleScreen';
import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../components/VehicleUi';
import {createVehicleFormDefaults, vehicleFormSections} from '../data/mockData';
import {
  formatCompactCurrency,
  getVehicleTheme,
  withOpacity,
} from '../theme/uiTheme';

const ROI_PERCENT = 11.25;

export default function ApplicationForm() {
  const navigation = useNavigation();
  const route = useRoute();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);
  const template = route.params?.template || {};
  const [formData, setFormData] = useState(() =>
    createVehicleFormDefaults(template),
  );

  const loanAmount = Number(formData.requestedLoanAmount || 0);
  const monthlyIncome = Number(formData.monthlyIncome || 0);
  const monthlyObligations = Number(formData.monthlyObligations || 0);
  const tenorMonths = Number(formData.tenorMonths || 0);
  const onRoadPrice = Number(formData.onRoadPrice || 0);

  const estimatedEmi = useMemo(
    () => calculateEmi(loanAmount, tenorMonths, ROI_PERCENT),
    [loanAmount, tenorMonths],
  );
  const foir = monthlyIncome
    ? Math.round(((estimatedEmi + monthlyObligations) / monthlyIncome) * 100)
    : 0;
  const ltv = onRoadPrice ? Math.round((loanAmount / onRoadPrice) * 100) : 0;

  const updateField = (key, value) => {
    setFormData(current => ({
      ...current,
      [key]: value,
    }));
  };

  const openPreview = () => {
    navigation.navigate('Application Details', {
      application: buildPreviewApplication({
        estimatedEmi,
        foir,
        formData,
        loanAmount,
        ltv,
        monthlyIncome,
        monthlyObligations,
        onRoadPrice,
        tenorMonths,
      }),
      preview: true,
    });
  };

  return (
    <VehicleModuleScreen
      theme={theme}
      title="Application Form"
      subtitle="Capture borrower, asset, pricing, and document details after finalizing the journey setup."
      showBack
      compactHero
      heroStats={[
        {label: 'Step', value: '2 / 2'},
        {label: 'Vehicle', value: formData.vehicleCategory || 'Car'},
        {label: 'Source', value: formData.sourcingChannel || 'Dealer'},
      ]}>
      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Selected Setup"
          subtitle="This is the entry combination chosen before opening the detailed form."
          theme={theme}
        />

        <View style={styles.selectionBadgeRow}>
          <VehicleBadge
            label={formData.applicationType}
            theme={theme}
            tone="accent"
          />
          <View style={styles.badgeSpacer} />
          <VehicleBadge
            label={formData.loanPurpose}
            theme={theme}
            tone="info"
          />
          <View style={styles.badgeSpacer} />
          <VehicleBadge
            label={formData.vehicleCondition || 'Vehicle Condition'}
            theme={theme}
            tone="warning"
          />
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Loan"
            value={loanAmount ? formatCompactCurrency(loanAmount) : '--'}
            theme={theme}
          />
          <SummaryCard
            label="EMI"
            value={estimatedEmi ? formatCompactCurrency(estimatedEmi) : '--'}
            theme={theme}
          />
          <SummaryCard
            label="FOIR"
            value={monthlyIncome ? `${foir}%` : '--'}
            theme={theme}
          />
        </View>

        <Text style={[styles.helperText, {color: theme.textSecondary}]}>
          Fill the pricing and applicant fields below to see eligibility numbers
          update.
        </Text>
      </VehiclePanel>

      {vehicleFormSections.map(section => (
        <VehiclePanel key={section.id} theme={theme}>
          <VehicleSectionHeader
            title={section.title}
            subtitle={section.description}
            theme={theme}
          />

          {section.fields.map(field => (
            <View key={field.key} style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, {color: theme.textPrimary}]}>
                {field.label}
                {field.required ? (
                  <Text style={{color: theme.danger}}> *</Text>
                ) : null}
              </Text>

              {field.type === 'chip' ? (
                <View style={styles.optionsRow}>
                  {field.options.map(option => {
                    const active = formData[field.key] === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateField(field.key, option)}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: active
                              ? withOpacity(
                                  theme.accentStrong,
                                  theme.isDark ? 0.22 : 0.12,
                                )
                              : theme.surfaceAlt,
                            borderColor: active
                              ? withOpacity(theme.accentStrong, 0.36)
                              : theme.borderColor,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.optionChipText,
                            {
                              color: active
                                ? theme.accentStrong
                                : theme.textSecondary,
                            },
                          ]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  value={formData[field.key] || ''}
                  onChangeText={value => updateField(field.key, value)}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.textMuted}
                  keyboardType={field.keyboardType || 'default'}
                  multiline={field.type === 'multiline'}
                  style={[
                    styles.input,
                    field.type === 'multiline'
                      ? styles.multilineInput
                      : styles.singleLineInput,
                    {
                      color: theme.textPrimary,
                      backgroundColor: theme.inputBg,
                      borderColor: theme.borderColor,
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </VehiclePanel>
      ))}

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Application Actions"
          subtitle="Save a draft, or open the summary review before submitting to credit."
          theme={theme}
        />

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Draft Saved',
                'Vehicle loan case saved in draft state for document completion.',
              )
            }
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.borderColor,
              },
            ]}>
            <Text
              style={[styles.secondaryButtonText, {color: theme.textPrimary}]}>
              Save Draft
            </Text>
          </Pressable>

          <Pressable
            onPress={openPreview}
            style={[
              styles.primaryButton,
              {backgroundColor: theme.accentStrong},
            ]}>
            <Text style={styles.primaryButtonText}>Review Application</Text>
          </Pressable>
        </View>
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

function SummaryCard({label, value, theme}) {
  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: withOpacity(
            theme.textPrimary,
            theme.isDark ? 0.12 : 0.05,
          ),
        },
      ]}>
      <Text style={[styles.summaryValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
      <Text style={[styles.summaryLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
    </View>
  );
}

function calculateEmi(principal, months, annualRate) {
  if (!principal || !months || !annualRate) {
    return 0;
  }

  const monthlyRate = annualRate / 12 / 100;
  const compoundFactor = Math.pow(1 + monthlyRate, months);

  return Math.round(
    (principal * monthlyRate * compoundFactor) / (compoundFactor - 1),
  );
}

function buildPreviewApplication({
  estimatedEmi,
  foir,
  formData,
  loanAmount,
  ltv,
  monthlyIncome,
  monthlyObligations,
  onRoadPrice,
  tenorMonths,
}) {
  return {
    id: 'VL-DRAFT-901',
    applicantName: formData.applicantName || 'New Applicant',
    phone: formData.mobileNumber || '--',
    city: formData.city || '--',
    sourcingChannel: formData.sourcingChannel || '--',
    status: 'Draft Review',
    stage: 'Lead Intake',
    vehicle: `${formData.manufacturer || ''} ${formData.model || ''}`.trim(),
    dealer: formData.dealerName || '--',
    requestedAmount: loanAmount,
    approvedAmount: 0,
    emi: estimatedEmi,
    tenor: tenorMonths,
    bureau: foir <= 45 ? 736 : 698,
    ltv: `${ltv || 0}%`,
    riskBand: foir <= 45 ? 'A2' : 'B2',
    nextAction: 'Review draft and submit to credit desk',
    lastUpdated: 'Just now',
    turnaroundTime: 'Draft',
    documentGap:
      formData.bankStatementStatus === 'Pending'
        ? 'Bank statement pending'
        : 'Ready for review',
    assignedOfficer: 'Shivam Mishra',
    productType: `${formData.vehicleCondition || ''} ${
      formData.vehicleCategory || ''
    }`.trim(),
    income: monthlyIncome,
    obligations: monthlyObligations,
    downPayment: Number(formData.downPayment || 0),
    branch: formData.branch || '--',
    onRoadPrice,
    docs: [
      {name: 'PAN', status: formData.panDoc || 'Pending'},
      {name: 'Aadhaar', status: formData.aadhaarDoc || 'Pending'},
      {name: 'Income Proof', status: formData.incomeProofStatus || 'Pending'},
      {
        name: 'Bank Statement',
        status: formData.bankStatementStatus || 'Pending',
      },
      {name: 'Bureau Consent', status: formData.bureauConsent || 'Pending'},
    ],
    timeline: [
      {label: 'Application draft created', time: 'Now', status: 'active'},
      {label: 'Officer review pending', time: 'Next step', status: 'upcoming'},
      {label: 'Credit login', time: 'After review', status: 'upcoming'},
    ],
    remarks: formData.remarks,
  };
}

const styles = StyleSheet.create({
  selectionBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  badgeSpacer: {
    width: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  singleLineInput: {
    minHeight: 52,
    textAlignVertical: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
