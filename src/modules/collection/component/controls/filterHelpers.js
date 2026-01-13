export const validateFilterValues = ({
    bucket, bucketMin, bucketMax,
    dpd, dpdMin, dpdMax,
    pos, posMin, posMax,
    tos, tosMin, tosMax,
    dormancy, dorMin, dorMax,
}) => {

    const validateRange = (enabled, min, max, label) => {
        if (!enabled) return true;

        if (!min || !max) {
            Alert.alert("Invalid Input", `${label}: Enter both Min and Max`);
            return false;
        }

        if (Number(min) > Number(max)) {
            Alert.alert("Invalid Input", `${label}: Min should be ≤ Max`);
            return false;
        }

        return true;
    };

    return (
        validateRange(bucket, bucketMin, bucketMax, "Bucket") &&
        validateRange(dpd, dpdMin, dpdMax, "DPD") &&
        validateRange(pos, posMin, posMax, "POS") &&
        validateRange(tos, tosMin, tosMax, "TOS") &&
        validateRange(dormancy, dorMin, dorMax, "Dormancy")
    );
};

export const buildFilterPayload = ({
    lenderSelected,
    selectedPortfolio,
    selectedProduct,
    selectedZone,
    selectedRegion,
    selectedState,
    selectedCity,
    selectedPincode,
    paymentStatus,
    caseStatus,
    callStatus,
    bucket, bucketMin, bucketMax,
    dpd, dpdMin, dpdMax,
    pos, posMin, posMax,
    tos, tosMin, tosMax,
    dormancy, dorMin, dorMax,
}) => {

    const payload = {};

    if (caseStatus)
        payload.caseStatus = caseStatus;
    if (callStatus)
        payload.callStatus = callStatus;

    // ------------------------------
    // -----------------
    // MULTI SELECT FIX (extract correct backend fields)
    // -----------------------------------------------
    if (lenderSelected?.length)
        payload.lenderName = lenderSelected.map(x => x.lenderName ?? x);

    if (selectedPortfolio?.length)
        payload.portfolio = selectedPortfolio.map(x => x.portfolioId ?? x);

    if (selectedProduct?.length)
        payload.product = selectedProduct.map(x => x.value ?? x);

    if (selectedZone?.length)
        payload.zone = selectedZone.map(x => x.zoneId ?? x);

    if (selectedRegion?.length)
        payload.region = selectedRegion.map(x => x.regionId ?? x);

    if (selectedState?.length)
        payload.state = selectedState.map(x => x.stateId ?? x);

    if (selectedCity?.length)
        payload.city = selectedCity.map(x => x.cityId ?? x);

    if (selectedPincode?.length)
        payload.pincode = selectedPincode.map(x => x.value ?? x);

    // -----------------------------------------------
    // PAYMENT STATUS — FIX (send only if chosen)
    // -----------------------------------------------
    if (paymentStatus !== "NA")
        payload.paymentStatus = paymentStatus;

    // -----------------------------------------------
    // NUMERIC FILTERS
    // -----------------------------------------------
    if (bucket) payload.bucketRange = [bucketMin, bucketMax];
    if (dpd) payload.dpdRange = [dpdMin, dpdMax];
    if (pos) payload.posRange = [posMin, posMax];
    if (tos) payload.tosRange = [tosMin, tosMax];
    if (dormancy) payload.dormancyRange = [dorMin, dorMax];

    return payload;
};



export const getEndpoint = (reqType, userProfile, Roles, userId) => {
    console.log(reqType, 'reqTypegetEndpoint')
    const { activityType } = userProfile || {};
    const primaryRole = Roles;

    const roleUrlMap = {
        MIS: activityType === "Field"
            ? "getFilterBulkUpLoadByMISField"
            : "getFilterBulkUpLoadByMIS",

        CA: `getFilterBulkUpLoadByAllCA/${userId}`,
        FA: `getFilterBulkUpLoadByAllCA/${userId}`,
        DRA: `getFilterBulkUpLoadByAllFieldDRA/${userId}`,
    };

    const defaultUrl = activityType === "Field"
        ? `getFilterBulkUpLoadByAllField/${userId}`
        : `getFilterBulkUpLoadByAll/${userId}`;

    const baseUrl = roleUrlMap[primaryRole] || defaultUrl;
    console.log(baseUrl,reqType, primaryRole, 'baseUrlbaseUrl')
    return `${baseUrl}/${reqType}/${primaryRole}/0/1/10`;
};

