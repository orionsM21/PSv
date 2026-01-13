// src/components/modals/FilterModal.js
import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import Modal from "react-native-modal";

import ModalHeader from "./Modalheadr";
import { modalStyles } from "./ModalStyles";

import FilterSelect from "../controls/FilterSelect";
import RangeInput from "../controls/RangeInput";
import SectionTitle from "../controls/SectionTitle";

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
    setSelectedZone,
    onZoneSelect,

    region,
    selectedRegion,
    setSelectedRegion,
    onRegionSelect,

    stateList,
    selectedState,
    setSelectedState,
    onStateSelect,

    cities,
    selectedCity,
    setSelectedCity,
    onCitySelect,

    pincodes,
    selectedPincode,
    setSelectedPincode,

    Approved,
    setApproved,
    Rejected,
    setRejected,
    theme,


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
            backdropOpacity={0.4}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            useNativeDriver
            hideModalContentWhileAnimating
            style={{
                margin: 0,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* MAIN CONTAINER */}
            <View
                style={[
                    modalStyles.wrapper,
                    {
                        width: "95%",
                        maxHeight: "88%",     // prevents overflow
                        paddingBottom: 10,
                    },
                ]}
            >
                {/* HEADER WITH CLEAR BTN */}
                <ModalHeader title="Filter" onClear={onClear} />

                {/* SCROLLABLE CONTENT */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 40,
                        paddingTop: 5,
                    }}
                >
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

                    <FilterSelect
                        label="Zone"
                        data={zone}
                        labelField="zoneName"
                        valueField="zoneId"
                        value={selectedZone}
                        onChange={onZoneSelect}   // ONLY THIS, no setSelectedZone needed
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
                    {/* Label */}
                    <Text
                        style={{
                            marginTop: 8,
                            fontSize: 16,
                            fontWeight: "500",
                            color: '#AAAAAAFF',
                            marginHorizontal: 10,
                        }}
                    >
                        Payment Status
                    </Text>

                    {/* Toggle Buttons */}
                    <View style={{ flexDirection: "row", marginHorizontal: 10, marginTop: 6 }}>
                        {/* APPROVED */}
                        <TouchableOpacity
                            onPress={() => setApproved(prev => !prev)}
                            activeOpacity={0.85}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 8,
                                backgroundColor:
                                    Approved ? '#BEBEC0' : '#EDEDF0',
                                marginRight: 6,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: Approved ? '#ffff' : '#131313FF',
                                }}
                            >
                                Approved
                            </Text>
                        </TouchableOpacity>

                        {/* REJECTED */}
                        <TouchableOpacity
                            onPress={() => setRejected(prev => !prev)}
                            activeOpacity={0.85}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 8,
                                backgroundColor:
                                    Rejected ? "#E63946" : '#EDEDF0',
                                marginLeft: 6,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: Rejected ? '#ffff' : 'black',
                                }}
                            >
                                Rejected
                            </Text>
                        </TouchableOpacity>
                    </View>



                    {/* NUMERIC SECTION */}
                    <SectionTitle title="Numeric Filters" />

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
                </ScrollView>

                {/* FOOTER BUTTONS */}
                <View style={[modalStyles.buttonRow, { marginTop: 10 }]}>
                    <TouchableOpacity style={modalStyles.buttonSecondary} onPress={onClose}>
                        <Text style={modalStyles.buttonTextSecondary}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={modalStyles.buttonPrimary} onPress={onSubmit}>
                        <Text style={modalStyles.buttonTextPrimary}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
