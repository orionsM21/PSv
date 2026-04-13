import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import VehicleModuleScreen from '../components/VehicleModuleScreen';
import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../components/VehicleUi';
import {getVehicleTheme, withOpacity} from '../theme/uiTheme';

const APPLICATION_TYPES = [
  {
    id: 'fresh',
    title: 'Fresh Application',
    subtitle:
      'Standard new or used vehicle sourcing flow for retail borrowers.',
    icon: 'car-sport-outline',
    applicationType: 'Fresh Application',
    loanPurpose: 'New Vehicle',
  },
  {
    id: 'balance-transfer',
    title: 'Balance Transfer',
    subtitle: 'Transfer an existing loan with top-up or rate optimization.',
    icon: 'swap-horizontal-outline',
    applicationType: 'Balance Transfer',
    loanPurpose: 'Top-up',
  },
  {
    id: 'refinance',
    title: 'Refinance',
    subtitle: 'Used asset refinance journey with repayment history checks.',
    icon: 'refresh-outline',
    applicationType: 'Refinance',
    loanPurpose: 'Used Vehicle',
  },
];

const VEHICLE_CATEGORIES = ['Car', 'Bike', 'Commercial Vehicle', 'EV'];
const VEHICLE_CONDITIONS = ['New', 'Used', 'Demo', 'Refinance'];
const SOURCING_CHANNELS = ['Dealer', 'DSA', 'Branch Walk-in', 'Digital'];
const EMPLOYMENT_TYPES = [
  'Salaried',
  'Self-employed',
  'Business Owner',
  'Driver',
];

export default function NewApplication() {
  const navigation = useNavigation();
  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = getVehicleTheme(uiTheme);

  const [selectedTypeId, setSelectedTypeId] = useState(APPLICATION_TYPES[0].id);
  const [vehicleCategory, setVehicleCategory] = useState('Car');
  const [vehicleCondition, setVehicleCondition] = useState('New');
  const [sourcingChannel, setSourcingChannel] = useState('Dealer');
  const [employmentType, setEmploymentType] = useState('Salaried');

  const selectedType = useMemo(
    () =>
      APPLICATION_TYPES.find(item => item.id === selectedTypeId) ||
      APPLICATION_TYPES[0],
    [selectedTypeId],
  );

  const openForm = () => {
    navigation.navigate('Application Form', {
      template: {
        applicationType: selectedType.applicationType,
        loanPurpose: selectedType.loanPurpose,
        vehicleCategory,
        vehicleCondition,
        sourcingChannel,
        employmentType,
      },
    });
  };

  return (
    <VehicleModuleScreen
      theme={theme}
      title="New Vehicle Loan"
      subtitle="Choose the application journey first, then open the detailed form with the right setup."
      showBack
      compactHero
      heroStats={[
        {label: 'Step', value: '1 / 2'},
        {label: 'Journey', value: 'Select'},
        {label: 'Form', value: 'Next'},
      ]}>
      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Application Type"
          subtitle="Start the case the way a vehicle loan desk normally does: decide the journey before opening the full form."
          theme={theme}
        />

        {APPLICATION_TYPES.map((item, index) => {
          const active = item.id === selectedTypeId;

          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedTypeId(item.id);
                if (item.id === 'refinance') {
                  setVehicleCondition('Refinance');
                }
              }}
              style={[
                styles.typeCard,
                {
                  backgroundColor: active
                    ? withOpacity(theme.accentStrong, theme.isDark ? 0.2 : 0.08)
                    : theme.surfaceAlt,
                  borderColor: active
                    ? withOpacity(theme.accentStrong, 0.34)
                    : theme.borderColor,
                },
                index === APPLICATION_TYPES.length - 1 && styles.noMarginBottom,
              ]}>
              <View
                style={[
                  styles.typeIcon,
                  {
                    backgroundColor: withOpacity(
                      theme.accentStrong,
                      theme.isDark ? 0.22 : 0.12,
                    ),
                  },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={theme.accentStrong}
                />
              </View>

              <View style={styles.typeCopy}>
                <Text style={[styles.typeTitle, {color: theme.textPrimary}]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.typeSubtitle, {color: theme.textSecondary}]}>
                  {item.subtitle}
                </Text>
              </View>

              {active ? (
                <View
                  style={[
                    styles.checkWrap,
                    {backgroundColor: theme.accentStrong},
                  ]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Journey Setup"
          subtitle="Pick the core setup values before moving into applicant and vehicle details."
          theme={theme}
        />

        <SelectionGroup
          title="Vehicle Category"
          options={VEHICLE_CATEGORIES}
          selectedValue={vehicleCategory}
          onSelect={setVehicleCategory}
          theme={theme}
        />
        <SelectionGroup
          title="Vehicle Condition"
          options={VEHICLE_CONDITIONS}
          selectedValue={vehicleCondition}
          onSelect={setVehicleCondition}
          theme={theme}
        />
        <SelectionGroup
          title="Sourcing Channel"
          options={SOURCING_CHANNELS}
          selectedValue={sourcingChannel}
          onSelect={setSourcingChannel}
          theme={theme}
        />
        <SelectionGroup
          title="Applicant Profile"
          options={EMPLOYMENT_TYPES}
          selectedValue={employmentType}
          onSelect={setEmploymentType}
          theme={theme}
        />
      </VehiclePanel>

      <VehiclePanel theme={theme}>
        <VehicleSectionHeader
          title="Selected Flow"
          subtitle="This setup will be carried into the detailed application form."
          theme={theme}
        />

        <View style={styles.badgeRow}>
          <VehicleBadge
            label={selectedType.title}
            theme={theme}
            tone="accent"
          />
          <View style={styles.badgeSpacer} />
          <VehicleBadge label={vehicleCategory} theme={theme} tone="info" />
          <View style={styles.badgeSpacer} />
          <VehicleBadge label={sourcingChannel} theme={theme} tone="warning" />
        </View>

        <View
          style={[
            styles.previewCard,
            {backgroundColor: theme.surfaceAlt, borderColor: theme.borderColor},
          ]}>
          <PreviewRow
            label="Loan Purpose"
            value={selectedType.loanPurpose}
            theme={theme}
          />
          <PreviewRow
            label="Vehicle Condition"
            value={vehicleCondition}
            theme={theme}
          />
          <PreviewRow
            label="Applicant Profile"
            value={employmentType}
            theme={theme}
          />
          <PreviewRow
            label="Next Step"
            value="Open application form"
            theme={theme}
            isLast
          />
        </View>

        <Pressable
          onPress={openForm}
          style={[styles.primaryButton, {backgroundColor: theme.accentStrong}]}>
          <Text style={styles.primaryButtonText}>Continue to Form</Text>
        </Pressable>
      </VehiclePanel>
    </VehicleModuleScreen>
  );
}

function SelectionGroup({title, options, selectedValue, onSelect, theme}) {
  return (
    <View style={styles.selectionGroup}>
      <Text style={[styles.groupTitle, {color: theme.textPrimary}]}>
        {title}
      </Text>
      <View style={styles.groupOptions}>
        {options.map(option => {
          const active = option === selectedValue;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
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
                    ? withOpacity(theme.accentStrong, 0.34)
                    : theme.borderColor,
                },
              ]}>
              <Text
                style={[
                  styles.optionChipText,
                  {color: active ? theme.accentStrong : theme.textSecondary},
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PreviewRow({label, value, theme, isLast}) {
  return (
    <View
      style={[
        styles.previewRow,
        !isLast && styles.previewRowDivider,
        !isLast && {borderBottomColor: theme.borderColor},
      ]}>
      <Text style={[styles.previewLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
      <Text style={[styles.previewValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeCopy: {
    flex: 1,
    paddingRight: 12,
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  typeSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionGroup: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  groupOptions: {
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  badgeSpacer: {
    width: 8,
  },
  previewCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  previewRowDivider: {
    borderBottomWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    flex: 1,
    paddingLeft: 12,
  },
  primaryButton: {
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
