import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';

import ModalHeader from './Modalheadr';
import {modalStyles} from './ModalStyles';

import FilterSelect from '../controls/FilterSelect';
import RangeInput from '../controls/RangeInput';
import SectionTitle from '../controls/SectionTitle';

export default function FilterModal({
  visible,
  onClose,
  onSubmit,
  onClear,

  lenderLists,
  lenderSelected,
  setLenderSelected,

  portfolio,
  selectedPortfolio,
  setSelectedPortfolio,

  product,
  selectedProduct,
  setSelectedProduct,

  zone,
  selectedZone,
  onZoneSelect,

  region,
  selectedRegion,
  onRegionSelect,

  stateList,
  selectedState,
  onStateSelect,

  cities,
  selectedCity,
  onCitySelect,

  pincodes,
  selectedPincode,
  setSelectedPincode,

  Approved,
  setApproved,
  Rejected,
  setRejected,

  bucket,
  setBucket,
  bucketMin,
  setBucketMin,
  bucketMax,
  setBucketMax,

  dpd,
  setDPD,
  dpdMin,
  setDpdMin,
  dpdMax,
  setDpdMax,

  pos,
  setPOS,
  posMin,
  setPosMin,
  posMax,
  setPosMax,

  tos,
  setTOS,
  tosMin,
  setTosMin,
  tosMax,
  setTosMax,

  dormancy,
  setDormancy,
  dorMin,
  setDorMin,
  dorMax,
  setDorMax,
}) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.35}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      style={modalStyles.sheet}>
      <View style={modalStyles.wrapper}>
        <View style={modalStyles.handle} />
        <ModalHeader
          title="Filter cases"
          subtitle="Refine the allocation list by lender, portfolio, geography, payment status, and numeric ranges."
          onClear={onClear}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={modalStyles.sectionCard}>
            <SectionTitle
              title="Core filters"
              subtitle="Start with the commercial and portfolio context."
            />

            <FilterSelect
              label="Lender"
              data={lenderLists}
              labelField="lenderName"
              valueField="lenderName"
              value={lenderSelected}
              onChange={setLenderSelected}
            />

            <FilterSelect
              label="Portfolio"
              data={portfolio}
              labelField="portfolioDescription"
              valueField="portfolioId"
              value={selectedPortfolio}
              onChange={setSelectedPortfolio}
            />

            <FilterSelect
              label="Product"
              data={product}
              labelField="label"
              valueField="value"
              value={selectedProduct}
              onChange={setSelectedProduct}
              disabled={selectedPortfolio.length === 0}
            />
          </View>

          <View style={modalStyles.sectionCard}>
            <SectionTitle
              title="Geography"
              subtitle="Narrow the queue by zone, region, state, city, and pincode."
            />

            <FilterSelect
              label="Zone"
              data={zone}
              labelField="zoneName"
              valueField="zoneId"
              value={selectedZone}
              onChange={onZoneSelect}
            />

            <FilterSelect
              label="Region"
              data={region}
              labelField="regionName"
              valueField="regionId"
              value={selectedRegion}
              onChange={onRegionSelect}
            />

            <FilterSelect
              label="State"
              data={stateList}
              labelField="stateName"
              valueField="stateId"
              value={selectedState}
              onChange={onStateSelect}
            />

            <FilterSelect
              label="City"
              data={cities}
              labelField="cityName"
              valueField="cityId"
              value={selectedCity}
              onChange={onCitySelect}
            />

            <FilterSelect
              label="Pincode"
              data={pincodes}
              labelField="label"
              valueField="value"
              value={selectedPincode}
              onChange={setSelectedPincode}
            />
          </View>

          <View style={modalStyles.sectionCard}>
            <SectionTitle
              title="Payment status"
              subtitle="Use these toggles to focus on approved or rejected payment outcomes."
            />

            <View style={styles.statusRow}>
              <TouchableOpacity
                onPress={() => setApproved(prev => !prev)}
                style={[
                  styles.statusChip,
                  styles.statusChipLeft,
                  Approved && styles.statusChipApproved,
                ]}>
                <Text
                  style={[
                    styles.statusChipText,
                    Approved && styles.statusChipTextActive,
                  ]}>
                  Approved
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRejected(prev => !prev)}
                style={[
                  styles.statusChip,
                  styles.statusChipRight,
                  Rejected && styles.statusChipRejected,
                ]}>
                <Text
                  style={[
                    styles.statusChipText,
                    Rejected && styles.statusChipTextActive,
                  ]}>
                  Rejected
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={modalStyles.sectionCard}>
            <SectionTitle
              title="Numeric ranges"
              subtitle="Enable a metric, then enter minimum and maximum thresholds."
            />

            <RangeInput
              label="Bucket"
              enabled={bucket}
              setEnabled={setBucket}
              min={bucketMin}
              max={bucketMax}
              setMin={setBucketMin}
              setMax={setBucketMax}
            />

            <RangeInput
              label="DPD"
              enabled={dpd}
              setEnabled={setDPD}
              min={dpdMin}
              max={dpdMax}
              setMin={setDpdMin}
              setMax={setDpdMax}
            />

            <RangeInput
              label="POS"
              enabled={pos}
              setEnabled={setPOS}
              min={posMin}
              max={posMax}
              setMin={setPosMin}
              setMax={setPosMax}
            />

            <RangeInput
              label="TOS"
              enabled={tos}
              setEnabled={setTOS}
              min={tosMin}
              max={tosMax}
              setMin={setTosMin}
              setMax={setTosMax}
            />

            <RangeInput
              label="Dormancy"
              enabled={dormancy}
              setEnabled={setDormancy}
              min={dorMin}
              max={dorMax}
              setMin={setDorMin}
              setMax={setDorMax}
            />
          </View>
        </ScrollView>

        <View style={modalStyles.buttonRow}>
          <TouchableOpacity
            style={modalStyles.buttonSecondary}
            onPress={onClose}>
            <Text style={modalStyles.buttonTextSecondary}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.buttonPrimary}
            onPress={onSubmit}>
            <Text style={modalStyles.buttonTextPrimary}>Apply filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipLeft: {
    marginRight: 6,
  },
  statusChipRight: {
    marginLeft: 6,
  },
  statusChipApproved: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  statusChipRejected: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  statusChipText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
});
