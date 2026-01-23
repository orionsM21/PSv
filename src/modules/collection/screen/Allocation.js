import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  View,
  FlatList,
  ToastAndroid,
  Platform,
  RefreshControl,
  Animated,
  LayoutAnimation,
  TextInput, Modal, Alert
} from 'react-native';

import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";



import apiClient from '../../../common/hooks/apiClient';
import { theme } from '../utility/Theme';
import { BASE_URL } from '../service/api';
import FilterModal from '../component/Modals/FilterModal';
import SortModal from '../component/Modals/SortModal';
import { buildFilterPayload, getEndpoint, validateFilterValues } from '../component/controls/filterHelpers';
import useCaseTabs from '../component/useCaseTabs';
import { DrawerContext } from '../../../Drawer/DrawerContext';
const { width, height } = Dimensions.get('window');
import { useDispatch } from 'react-redux';
import { SkeletonList } from '../../los/screen/Component/SkeletonCard';

const TABS = [
  'All',
  'New',
  'My Cases',
  'Allocated',
  'In Progress',
  'Unallocated(Approval Rejected)',
  'Unallocated(Pending)',
  'Unallocated(Approved)',
  'Foreclosure',
  'Settlement',
  'CaseClosure(Approved)',
  'CaseClosure(Pending)',
  'CaseClosure(Rejected)',
];

export default function Allocation() {
  const { isDrawerVisible, openDrawer, closeDrawer } = useContext(DrawerContext);
  const dispatch = useDispatch();
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const lanCacheRef = useRef({});
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const BOTTOM_BAR_HEIGHT = 30;
  // ----- component state -----
  const [loadinglinkFromAPI, setLoadinglinkFromAPI] = useState(false);
  const [countData, setCountData] = useState({});
  const [FiledORCallvalues, setFiledORCallvalues] = useState(false);
  const [isBulkLoading, setBulkLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchinputTxt, setsearchinputTxt] = useState('');
  const [isLANSearch, setisLANSearch] = useState(true);
  const [IsSearch, setIsSearch] = useState(false);
  const [lenderLists, setlenderLists] = useState([]);
  const [isFilterApply, setisFilterApply] = useState(false);
  const [lastSearchTab, setLastSearchTab] = useState(null);
  const [filteredApiData, setFilteredApiData] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [sortTypeState, setSortTypeState] = useState(0); // 0: A-Z, 1: Z-A, 2: High to Low, 3: Low to High
  const [sortType, setSortType] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [Approved, setApproved] = useState(false);
  const [Rejected, setRejected] = useState(false);
  // Dropdown selections
  const [lenderselected, setlenderSelected] = useState([]);
  console.log(filteredApiData, 'filteredApiData')
  const [selected, setSelected] = useState([]); // portfolio
  const [selProduct, setSelProduct] = useState([]);

  const [selZone, setSelZone] = useState([]);
  const [selRegion, setSelRegion] = useState([]);
  const [selStates, setSelStates] = useState([]);
  const [selCities, setSelCities] = useState([]);
  const [selPinode, setSelPinode] = useState([]);

  // Master lists
  const [portfolio, setPortfolio] = useState([]);
  const [product, setAllProduct] = useState([]);
  const [zone, setAllZone] = useState([]);
  const [region, setAllRegion] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allPincode, setAllPincode] = useState([]);
  // const [isFilterApply, setisFilterApply] = useState(false);


  const formattedPincodeData = useMemo(() => {
    return allPincode?.map(p => ({
      label: p?.pincode?.toString(),
      value: p?.pincode?.toString(),
    }));
  }, [allPincode]);


  const [bucket, setBucket] = useState(false);
  const [bucketmin, setBucketmin] = useState();
  const [bucketMax, setBucketMax] = useState();

  const [DPD, setDPD] = useState(false);
  const [dpdMin, setDpdMin] = useState();
  const [dpdMax, setDpdMax] = useState();

  const [POS, setPOS] = useState(false);
  const [posMin, setPosMin] = useState();
  const [posMax, setPosMax] = useState();

  const [TOS, setTOS] = useState(false);
  const [tosMin, setTosMin] = useState();
  const [tosMax, setTosMax] = useState();

  const [Dormancy, setDormancy] = useState(false);
  const [DorMin, setDorMin] = useState();
  const [DorMax, setDorMax] = useState();

  const [state, setState] = useState({
    activeTab: TABS[0],
    tabDataCounts: TABS.reduce((acc, t) => ({ ...acc, [t]: 0 }), {}),
    data: [],
    loading: false,
    error: null,
    cache: {},
    isRefreshing: false,
  });


  useEffect(() => {
    if (userProfile?.activityType === 'Both') {
      setFiledORCallvalues(true);
    }
  }, [userProfile])

  useEffect(() => {
    getCount();
    getLenderListData();
    getAllPortfolio();
    getAllProduct();
    getAllZones();
    getAllRegions();
    getAllStates();
    getAllCities();
    getAllPincode();
  }, []);

  const getCount = async () => {
    if (!userProfile?.userId) return;
    setLoadinglinkFromAPI(true);
    try {
      const roleCodes = userProfile?.role?.map((a) => a?.roleCode) || [];
      const { activityType } = userProfile || {};

      const roleUrlMap = {
        MIS: activityType === 'Field' ? 'getCountCasesMISField' : 'getCountCasesMIS',
        RH: activityType === 'Field' ? 'getCountCasesMISField' : 'getCountCasesMIS',
        CH: activityType === 'Field' ? 'getCountCasesMISField' : 'getCountCasesMIS',
        OP: activityType === 'Field' ? 'getCountCasesMISField' : 'getCountCasesMIS',
        CA: 'getCountCA',
        DRA: 'getCountDRA',
      };
      const defaultUrl = activityType === 'Field' ? 'getCountField' : 'getCount';
      const matchedRole = roleCodes.find((r) => roleUrlMap[r]);
      const url = matchedRole ? roleUrlMap[matchedRole] : defaultUrl;

      const response = await apiClient.get(`${url}/${userProfile?.userId}/${roleCodes.join(',')}`, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      const data = response?.data?.data || {};
      setCountData(data);

      // update tabDataCounts
      const tabCountMapping = {
        All: 'allCount',
        New: 'newCount',
        'My Cases': 'myCases',
        Allocated: 'allocatedCount',
        'In Progress': 'inProcresCount',
        'Unallocated(Approval Rejected)': 'unAllocated_Count',
        'Unallocated(Pending)': 'unAllocated_p_Count',
        'Unallocated(Approved)': 'unAllocated_a_Count',
        Foreclosure: 'requestForCloser',
        Settlement: 'settlement',
        'CaseClosure(Approved)': 'closeApproved',
        'CaseClosure(Pending)': 'closePending',
        'CaseClosure(Rejected)': 'closeRejected',
      };

      const updatedCounts = {};
      TABS.forEach((t) => {
        const key = tabCountMapping[t];
        updatedCounts[t] = data[key] || 0;
      });

      setState((p) => ({ ...p, tabDataCounts: updatedCounts }));
    } catch (error) {
      console.error('getCount error:', error);
    } finally {
      setLoadinglinkFromAPI(false);
    }
  };

  const apiFetch = async (url, setter, transform = (d) => d) => {
    try {
      const res = await apiClient.get(`${url}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = res?.data?.data || res?.data?.response || [];
      setter(transform(raw));
    } catch (err) {
      console.error(`Fetch error -> ${url}:`, err);
      setter([]); // fail-safe
    }
  };

  const idParam = (val) => (Array.isArray(val) ? val.join(",") : val);

  const getLenderListData = () =>
    apiFetch("getLenderList", setlenderLists);

  const getAllPortfolio = () =>
    apiFetch("getAllPortfolio", setPortfolio);

  const getAllProduct = () =>
    apiFetch(
      "getAllProduct",
      setAllProduct,
      (list) =>
        list
          ?.filter((p) => p.isActive === "Y")
          ?.map((p) => ({
            label: p.productDescription,
            value: p.productCode,
          }))
    );

  const getAllZones = () =>
    apiFetch("getAllZones", setAllZone);

  const getAllRegions = () =>
    apiFetch("getAllRegions", setAllRegion);

  const getRegionByZone = (zoneIds) =>
    zoneIds?.length
      ? apiFetch(`getRegionByZone/${idParam(zoneIds)}`, setAllRegion)
      : getAllRegions();

  const getAllStates = () =>
    apiFetch("getAllStates", setAllStates);

  const getStateByRegion = (regionIds) =>
    regionIds?.length
      ? apiFetch(`getStateByRegion/${idParam(regionIds)}`, setAllStates)
      : getAllStates();

  const getAllCities = () =>
    apiFetch("getAllCities/0/0", setAllCities);

  const getCityByState = (stateIds) =>
    stateIds?.length
      ? apiFetch(`getCityByState/${idParam(stateIds)}/0/0`, setAllCities)
      : getAllCities();

  const getAllPincode = () =>
    apiFetch("getAllPincodes/0/0", setAllPincode);

  const getPincodeByCity = (cityIds) =>
    cityIds?.length
      ? apiFetch(`getPincodeByCity/${idParam(cityIds)}/0/0`, setAllPincode)
      : getAllPincode();

  const ListCard = React.memo(({ item, index, onPress }) => {

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleCard = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(prev => !prev);
    };

    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={[styles.card, isExpanded && { height: 'auto' }]}
        activeOpacity={0.9}
      >

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.headerCol}>
            <Text style={styles.labelexp}>Name</Text>
            <Text style={styles.valueexp} numberOfLines={3}>{item.name}</Text>
          </View>

          <View style={styles.headerCol}>
            <Text style={styles.labelexp}>Lender Name</Text>
            <Text style={styles.valueexp} numberOfLines={2}>{item.lenderName}</Text>
          </View>

          <TouchableOpacity onPress={toggleCard} style={styles.expandButton}>
            <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {/* EXPANDED CONTENT */}
        {isExpanded && (
          <View style={{ marginTop: 10 }}>

            {/* ROW 1 */}
            <View style={styles.expandedRow}>
              <View style={styles.expandedCol}>
                <Text style={styles.labelexp}>LAN</Text>
                <Text style={styles.valueexp}>{item.loanAccountNumber}</Text>
              </View>

              <View style={styles.expandedCol}>
                <Text style={styles.labelexp}>Product</Text>
                <Text style={styles.valueexp}>{item.loanProduct}</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  getLenderApi(item);
                  setShowPhone(true);
                  getAllContactList(item);
                }}
                style={styles.actionWrapper}
              >
                <Image
                  source={require('../../../asset/icon/call.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>

            {/* ROW 2 */}
            <View style={styles.expandedRow}>
              <View style={styles.expandedCol}>
                <Text style={styles.labelexp}>Total Overdue</Text>
                <Text style={styles.valueexp}>
                  {item.totalOverdueAmount?.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.expandedCol}>
                <Text style={styles.labelexp}>Case Status</Text>
                <Text style={styles.valueexp}>{item.caseStatus}</Text>
              </View>

              <TouchableOpacity
                onPress={() => getAllAddressList(item)}
                style={styles.actionWrapper}
              >
                <Image
                  source={require('../../../asset/updateicons/location.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>

            {/* ROW 3 – Download Only */}
            <View style={styles.expandedRow}>
              <View style={styles.expandedCol} />

              <View style={styles.expandedCol} />

              <TouchableOpacity
                onPress={() => createPDF(item)}
                style={styles.actionWrapper}
              >
                <Image
                  source={require('../../../asset/updateicons/download.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>

          </View>
        )}

      </TouchableOpacity>
    );
  });













  const buildHeaders = useCallback(() => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const lanListFetchers = useMemo(() => ({

    /* ---------------------------------------------------
       ALL
    --------------------------------------------------- */
    All: async () => {
      const headers = buildHeaders();
      const url = userProfile?.activityType === "Field"
        ? "getCaseAllocationByUseridForUnAllocatedCasesField"
        : "getCaseAllocationByUseridForUnAllocatedCases";

      const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["All"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       NEW
    --------------------------------------------------- */
    New: async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const isMIS = roleCodes.includes("MIS");

      if (isMIS) {
        const res = await apiClient.get(`getAllNewSuccessData/${userProfile.userId}/0`, { headers });
        const raw = res?.data?.response || [];
        const lanList = raw.map(r => r.allLan).filter(Boolean);

        lanCacheRef.current["New"] = lanList;
        return lanList;
      }

      const path = (FiledORCallvalues || userProfile.activityType === "Field")
        ? "getNewCaseAllocationFieldByUserid"
        : "getNewCaseAllocationByUserid";

      const res = await apiClient.get(`${path}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["New"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       MY CASES
    --------------------------------------------------- */
    "My Cases": async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const menoallocation = JSON.parse(userProfile?.role?.[0]?.access || "{}");
      const isField = userProfile.activityType === "Field" || FiledORCallvalues;

      if (menoallocation?.caseactivity_manualallocation) {
        const url = isField
          ? "getMyCaseAllocationFieldByUserid"
          : "getMyCaseAllocationByUserid";

        const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

        const raw = res?.data?.response || [];
        const lanList = raw.map(r => r.allLan).filter(Boolean);

        lanCacheRef.current["My Cases"] = lanList;
        return lanList;
      }

      let url = "";

      if (roleCodes.includes("FA") || roleCodes.includes("CA"))
        url = isField ? "getDRACaseAllocationByUserid" : "getCACaseAllocationByUserid";
      else if (roleCodes.includes("DRA"))
        url = "getDRACaseAllocationByUserid";

      if (!url) return [];

      const res = await apiClient.get(`${url}/${userProfile.userId}/${roleCodes}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["My Cases"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       IN PROGRESS
    --------------------------------------------------- */
    "In Progress": async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const isFAorCA = roleCodes.includes("FA") || roleCodes.includes("CA");
      const isDRA = roleCodes.includes("DRA");
      const isField = userProfile.activityType === "Field" || FiledORCallvalues;

      let url = "";

      if (isFAorCA) {
        url = isField ? "getMyInProcessByUseridForDRA" : "getMyInProcessByUseridForCA";
      } else if (isDRA) {
        url = isField ? "getMyInProcessByUseridForDRA" : "getMyInProcessByUserid";
      } else {
        url = isField ? "getMyInProcessByUseridField" : "getMyInProcessByUserid";
      }

      const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["In Progress"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       ALLOCATED
    --------------------------------------------------- */
    Allocated: async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const isSpecialRole = roleCodes.some(code => ["MIS", "RH", "CH", "OP"].includes(code));
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      if (isSpecialRole) return []; // Loaded via bulkFetcher

      const url = isField
        ? "getAllocatedCaseAllocationFieldByUserid"
        : "getAllocatedCaseAllocationByUserid";

      const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Allocated"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       UNALLOCATED (APPROVAL REJECTED)
    --------------------------------------------------- */
    "Unallocated(Approval Rejected)": async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const roleStr = roleCodes.join(",");
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      let url = "";
      let params = "";

      if (roleStr.includes("DRA")) {
        url = "getDRACaseAllocationByUseridUnallocatedRejected";
        params = `${userProfile.userId}/${roleStr}/0/0`;
      } else if (roleStr.includes("CA")) {
        url = isField
          ? "getDRACaseAllocationByUseridUnallocatedRejected"
          : "getCACaseAllocationByUseridUnallocatedApprovalReject";
        params = `${userProfile.userId}/${roleStr}/0/0`;
      } else {
        url = isField
          ? "getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationRejectedField"
          : "getCaseAllocationByUseridForUnallocatedCasesForUnallocationApprovalReject";
        params = `${userProfile.userId}/0/0`;
      }

      const res = await apiClient.get(`${url}/${params}`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Unallocated(Approval Rejected)"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       UNALLOCATED (PENDING)
    --------------------------------------------------- */
    "Unallocated(Pending)": async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const roleStr = roleCodes.join(",");
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      let url = "";
      let params = "";

      if (roleStr.includes("DRA")) {
        url = "getDRACaseAllocationByUseridUnAllocatedPending";
        params = `${userProfile.userId}/${roleStr}/0/0`;
      } else if (roleStr.includes("CA")) {
        url = isField
          ? "getDRACaseAllocationByUseridUnAllocatedPending"
          : "getCACaseAllocationByUseridUnAllocatedPending";
        params = `${userProfile.userId}/${roleStr}/0/0`;
      } else {
        url = isField
          ? "getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationPendingField"
          : "getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationPending";
        params = `${userProfile.userId}/0/0`;
      }

      const res = await apiClient.get(`${url}/${params}`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Unallocated(Pending)"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       UNALLOCATED (APPROVED)
    --------------------------------------------------- */
    "Unallocated(Approved)": async () => {
      const headers = buildHeaders();
      const roleCodes = userProfile.role?.map(a => a.roleCode) || [];
      const roleStr = roleCodes.join(",");
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      let url = "";

      if (roleCodes.includes("DRA")) {
        url = `getDRACaseAllocationByUseridUnAllocatedApproved/${userProfile.userId}/${roleStr}/0/0`;
      } else if (roleCodes.includes("CA")) {
        url = isField
          ? `getDRACaseAllocationByUseridUnAllocatedApproved/${userProfile.userId}/${roleStr}/0/0`
          : `getCACaseAllocationByUseridUnAllocatedApproved/${userProfile.userId}/${roleStr}/0/0`;
      } else {
        url = isField
          ? `getCaseAllocationByUseridForUnAllocatedCasesForUnAllocationApprovedField/${userProfile.userId}/0/0`
          : `getCaseAllocationByUseridForUnAllocationApproved/${userProfile.userId}/0/0`;
      }

      const res = await apiClient.get(`${url}`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Unallocated(Approved)"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       FORECLOSURE
    --------------------------------------------------- */
    Foreclosure: async () => {
      const headers = buildHeaders();
      const roles = userProfile.role?.map(a => a.roleCode) || [];
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      let url = "";

      if (roles.some(r => ["MIS", "RH", "CH", "OP"].includes(r))) {
        url = isField ? "getCaseAllocationForCloserField" : "getCaseAllocationForCloser";
      } else if (roles.includes("CA")) {
        url = isField ? "getCaseAllocationForCloserField" : "getCaseAllocationForCloser";
      } else if (roles.includes("DRA")) {
        url = "getCaseAllocationForCloserField";
      } else {
        url = isField ? "getCaseAllocationForCloserField" : "getCaseAllocationForCloser";
      }

      const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Foreclosure"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       SETTLEMENT
    --------------------------------------------------- */
    Settlement: async () => {
      const headers = buildHeaders();
      const isField = FiledORCallvalues || userProfile.activityType === "Field";

      const url = isField
        ? "getCaseAllocationSettlementField"
        : "getCaseAllocationSettlement";

      const res = await apiClient.get(`${url}/${userProfile.userId}/0/0`, { headers });

      const raw = res?.data?.response || [];
      const lanList = raw.map(r => r.allLan).filter(Boolean);

      lanCacheRef.current["Settlement"] = lanList;
      return lanList;
    },

    /* ---------------------------------------------------
       CASE CLOSURE TABS (NO LAN)
    --------------------------------------------------- */
    "CaseClosure(Approved)": async () => ["__NO_LAN__"],
    "CaseClosure(Pending)": async () => ["__NO_LAN__"],
    "CaseClosure(Rejected)": async () => ["__NO_LAN__"],

  }), [userProfile, token, FiledORCallvalues, buildHeaders]);


  const bulkFetcher = useCallback(
    async (lanBatch, tab) => {
      try {
        setBulkLoading(true);

        const headers = buildHeaders();
        const roleCodes = userProfile?.role?.map(a => a.roleCode) || [];
        const isSpecialRole = roleCodes.some(code =>
          ["MIS", "RH", "CH", "OP"].includes(code)
        );

        const isField =
          FiledORCallvalues === true || userProfile?.activityType === "Field";

        /* -----------------------------------------------------------
           1) SPECIAL CASE: Allocated + Special roles (no LAN needed)
        ----------------------------------------------------------- */
        if (tab === "Allocated" && isSpecialRole) {
          const url = isField
            ? "getAllocatedSuccessDataField/0/0"
            : "getAllocatedSuccessData/0/0";

          const res = await apiClient.get(`${url}`, { headers });
          return res?.data?.data || [];
        }

        /* -----------------------------------------------------------
           2) CASE CLOSURE TABS (no LAN paging)
        ----------------------------------------------------------- */
        if (tab === "CaseClosure(Approved)") {
          const res = await apiClient.get(
            `getCaseClosureByTab/${userProfile.userId}/Approved?1?50`,
            { headers }
          );
          return res?.data?.data?.content || [];
        }

        if (tab === "CaseClosure(Pending)") {
          const res = await apiClient.get(
            `getCaseClosureByTab/${userProfile.userId}/Pending?1?50`,
            { headers }
          );
          return res?.data?.data?.content || [];
        }

        if (tab === "CaseClosure(Rejected)") {
          const res = await apiClient.get(
            `getCaseClosureByTab/${userProfile.userId}/Rejected?1?50`,
            { headers }
          );
          return res?.data?.data?.content || [];
        }

        /* -----------------------------------------------------------
           3) NORMAL TABS (LAN BASED)
           - Use per-tab LAN cache
           - lanBatch is the list of LANs for current page
        ----------------------------------------------------------- */

        const cachedLanList = lanCacheRef.current[tab];

        // If no LAN cached → no need API call
        if (!cachedLanList || cachedLanList.length === 0) {
          return [];
        }

        // Page-based slicing handled by your hook — lanBatch already correct
        const res = await apiClient.post(
          `getBulkUploadSuccessByListOfLan/${userProfile.userId}`,
          lanBatch,
          { headers }
        );

        return res?.data?.data || [];

      } catch (err) {
        console.error("bulkFetcher error:", err);
        return [];
      } finally {
        setBulkLoading(false);
      }
    },
    [userProfile, buildHeaders, FiledORCallvalues]
  );
  const onEndReachedCalledDuringMomentum = useRef(false);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    console.log("🔥 handleLoadMore triggered");

    const lanFetcher = lanListFetchers[activeTab] || (async () => []);
    loadMore({ lanListFetcher: lanFetcher, bulkFetcher });
  }, [activeTab, hasMore, isLoadingMore, lanListFetchers, loadMore, bulkFetcher]);

  const onLoadMore = useCallback(() => {
    if (isSearching || isFilterApply) return;
    if (isFilterApply || !hasMore) return;

    handleLoadMore();
  }, [isSearching, isFilterApply, isLoadingMore, hasMore,]);
  const {
    activeTab,
    setActiveTab,
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    forceSetData
  } = useCaseTabs({
    tabs: TABS, userProfile, token, initialTab: TABS[0], lanListFetchers,   // <-- REQUIRED NOW
    bulkFetcher, FiledORCallvalues, isSearching, isFilterApply
  });


  // console.log(isSearching, isFilterApply, isFilterApply, hasMore, 'hasMorehasMorehasMorehasMore')
  console.log(activeTab, 'forceSetDataforceSetData')

  const onTabPress = useCallback(
    async (tab) => {
      console.log(tab, "onPresstab");

      // 🔥 REMOVE ALL OLD cache clearing — the hook handles it now

      // ============================
      // SEARCH MODE
      // ============================
      if (isSearching && searchinputTxt.trim()) {
        setActiveTab(tab);   // hook triggers fetchPage(tab)
        await handleSearch(tab);
        return;
      }

      // ============================
      // FILTER MODE
      // ============================
      if (isFilterApply) {
        setActiveTab(tab);   // hook triggers fetchPage(tab)
        await submitFilter(tab);
        return;
      }

      // ============================
      // NORMAL MODE
      // ============================
      setIsSearching(false);
      setFilteredApiData([]);
      setLastSearchTab(null);

      setActiveTab(tab);  // hook resets + fetches first page automatically
    },
    [
      isSearching,
      searchinputTxt,
      handleSearch,
      submitFilter,
      isFilterApply
    ]
  );

  const handleCardPress = useCallback(
    (item) => {
      navigation.navigate("CaseDetails", {
        data: item,
        selectedTab: activeTab,
      });
    },
    [activeTab]
  );

  const renderCard = ({ item, index }) => (
    <ListCard
      item={item}
      index={index}
      onPress={handleCardPress}
    />
  );
  console.log(data, 'datadatadata')
  const tabMappings = {
    "All": "All",
    "New": 'New',
    'My Cases': 'My_case',
    "Allocated": "Allocated",
    'In Progress': 'In_progress',
    'Unallocated(Pending)': 'Unallocated_pending',
    'Unallocated(Approved)': 'Unallocated_approved',
    'Unallocated(Approval Rejected)': 'Unallocated_rejected',
    'Foreclosure': 'Foreclosure',
    'Settlement': 'Settlement',
    'CaseClosure(Pending)': 'Case_closer_pending',
    'CaseClosure(Approved)': 'Case_closer_approve',
    'CaseClosure(Rejected)': 'Case_closer_rejected',
  };
  const handleSearch = async (tabToSearch = activeTab) => {

    if (!tabToSearch || !TABS.includes(tabToSearch)) return;
    if (!searchinputTxt.trim()) return;

    setLoadinglinkFromAPI(true);
    setIsSearching(true);

    try {
      const { userId, activityType, role = [] } = userProfile || {};
      const Roles = role.map(r => r.roleCode) || [];
      const primaryRole = Roles?.[0] || "";

      // ⭐ FIXED: roleUrlMap MUST BE inside this function
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

      // TAB → CASE STATUS
      const mapped = tabMappings[tabToSearch];
      const reqType = mapped || tabToSearch.replace(/\s+/g, "_");

      // FINAL URL
      const urlPath =
        ["MIS"].includes(primaryRole)
          ? `${baseUrl}/${reqType}/0/0/0`
          : ["CA", "FA", "DRA"].includes(primaryRole)
            ? `${baseUrl}/${reqType}/${primaryRole}/0/0/0`
            : `${baseUrl}/${reqType}/0/0/0`;

      // PAYLOAD
      const finalPayload = isLANSearch
        ? { lenderId: [searchinputTxt.trim()], caseStatus: reqType, paymentStatus: "NA", callStatus: "NA" }
        : { borrowerName: searchinputTxt.trim(), caseStatus: reqType, paymentStatus: "NA", callStatus: "NA" };

      // FIRST API → GET LAN LIST
      const { data: res1 } = await apiClient.post(`${urlPath}`, finalPayload, {
        headers: {
          Authorization: `Bearer ${token}`, Accept: "application/json",
          "Content-Type": "application/json",
        }
      });

      const lanList = (res1?.response || [])
        .map(x => x.allLan)
        .filter(Boolean);

      let newData = [];

      if (lanList.length) {
        // SECOND API → BULK FETCH
        const { data: res2 } = await apiClient.post(
          `getBulkUploadSuccessByListOfLan/${userId}`,
          lanList,
          {
            headers: {
              Authorization: `Bearer ${token}`, Accept: "application/json",
              "Content-Type": "application/json",
            }
          }
        );
        newData = res2?.data || [];
      }

      setFilteredApiData(newData);
      setState(prev => ({
        ...prev,
        data: newData,
        tabDataCounts: { ...prev.tabDataCounts, [tabToSearch]: newData.length }
      }));

    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoadinglinkFromAPI(false);
    }
  };


  // const finalList = isFilterApply
  //   ? filteredApiData          // always use filtered data
  //   : isSearching
  //     ? filteredApiData        // searching also uses filtered results
  //     : data;                  // normal mode uses main data

  const finalList = useMemo(() => {
    if (isFilterApply || isSearching) return filteredApiData;
    return data;
  }, [isFilterApply, isSearching, filteredApiData, data]);

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (!state.loading && data.length > 0) {
      hasLoadedOnce.current = true;
    }
  }, [state.loading, data]);


  const isInitialLoading =
    state.loading &&
    !hasLoadedOnce.current &&
    !isSearching &&
    !isFilterApply;

  const shouldShowEmpty =
    !state.loading &&
    !isLoadingMore &&
    finalList.length === 0 &&
    hasLoadedOnce.current &&
    !isSearching &&
    !isFilterApply;


  console.log(finalList, 'finalListfinalList')
  // OUTSIDE JSX (top of component)
  const bottomActions = useMemo(() => [
    {
      key: 'sort',
      onPress: () => setShowSort(true),
      icon: require('../../../asset/updateicons/sort.png'),
      label: 'Sort',
    },
    {
      key: 'filter',
      onPress: () => setShowFilter(true),
      icon: require('../../../asset/updateicons/filter.png'),
      label: 'Filter',
    },
  ], []);


  const sortOptions = [
    { label: 'A-Z (Ascending)', value: '0' },
    { label: 'Z-A (Descending)', value: '1' },
    { label: 'High to Low', value: '2' },
    { label: 'Low to High', value: '3' },
  ];

  const SORT_TYPES = {
    NAME_ASC: 0,
    NAME_DESC: 1,
    AMOUNT_DESC: 2,
    AMOUNT_ASC: 3,
  };

  const sortData = (list, sortType) => {
    if (!Array.isArray(list)) return [];

    const sorted = [...list];

    switch (sortType) {
      case SORT_TYPES.NAME_ASC:
        return sorted.sort((a, b) =>
          (a?.name || '').localeCompare(b?.name || '')
        );

      case SORT_TYPES.NAME_DESC:
        return sorted.sort((a, b) =>
          (b?.name || '').localeCompare(a?.name || '')
        );

      case SORT_TYPES.AMOUNT_DESC:
        return sorted.sort(
          (a, b) => (b?.totalOverdueAmount || 0) - (a?.totalOverdueAmount || 0)
        );

      case SORT_TYPES.AMOUNT_ASC:
        return sorted.sort(
          (a, b) => (a?.totalOverdueAmount || 0) - (b?.totalOverdueAmount || 0)
        );

      default:
        return sorted;
    }
  };
  const sortList = () => {
    // dispatch(showLoader(true));

    try {
      const sorted = sortData(data, sortTypeState);
      console.log(sorted, 'sortedsorted')
      // 🔥 This updates CURRENT TAB ONLY
      forceSetData(sorted);

      setShowSort(false);
      // setShowSortState(false);
    } finally {
      // setTimeout(() => {
      //   dispatch(showLoader(false));
      // }, 200);
    }
  };


  const onZoneSelect = (zones) => {
    setSelZone(zones);
    getRegionByZone(zones);
  };

  const onStateSelect = (states) => {
    setSelStates(states);
    getCityByState(states);
  };

  const onCitySelect = (cities) => {
    setSelCities(cities);
    getPincodeByCity(cities);
  };

  const onRegionSelect = (regions) => {
    setSelRegion(regions);
    getStateByRegion(regions);   // 🔥 correct place to call
  };


  const clearFilter = async () => {
    // 1️⃣ RESET ALL SELECTED VALUES
    setlenderSelected([]);
    setSelected([]);
    setSelProduct([]);
    setSelZone([]);
    setSelRegion([]);
    setSelStates([]);
    setSelCities([]);
    setSelPinode([]);

    // 2️⃣ RESET NUMERIC FILTERS
    setBucket(false);
    setBucketmin("");
    setBucketMax("");

    setDPD(false);
    setDpdMin("");
    setDpdMax("");

    setPOS(false);
    setPosMin("");
    setPosMax("");

    setTOS(false);
    setTosMin("");
    setTosMax("");

    setDormancy(false);
    setDorMin("");
    setDorMax("");

    // 3️⃣ RESET CASCADE LISTS
    getAllPortfolio();
    getAllProduct();
    getAllZones();
    getAllRegions();
    getAllStates();
    getAllCities();
    getAllPincode();

    // 4️⃣ STOP FILTER/SEARCH MODE IMMEDIATELY
    setisFilterApply(false);
    setIsSearching(false);

    // 5️⃣ CLOSE FILTER UI
    setShowFilter(false);

    // 6️⃣ WAIT FOR NEXT TICK SO STATE IS UPDATED BEFORE REFRESH
    await Promise.resolve(); // <-- MAGIC FIX ⚡

    // 7️⃣ NOW REFRESH ORIGINAL DATA SAFELY
    const lanFetcher = lanListFetchers[activeTab];
    refresh({ lanListFetcher: lanFetcher, bulkFetcher });
    getCount();
  };


  const handleFilterResponse = ({
    rawIndexData = [],
    bulkData = [],
    requestType = "",
    tabToSearch = "",
    isSearch = false,
  }) => {
    try {
      const ts = Date.now();

      // 1) SORT
      const sorted = [...bulkData].sort((a, b) =>
        (a?.borrowerName || "").localeCompare(b?.borrowerName || "")
      );

      // 2) GROUP (optional)
      const grouped = sorted.reduce((acc, item) => {
        const key = item?.regionName || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      // 👍 SINGLE BATCH STATE UPDATE
      setState(prev => ({
        ...prev,

        data: sorted,
        hasMoreData: false,
        loading: false,
        isLoadingMore: false,

        cache: {
          ...prev.cache,
          [tabToSearch]: sorted,
        },

        filterPreview: rawIndexData,

        tabDataCounts: {
          ...prev.tabDataCounts,
          [requestType]: sorted.length,
        },

        groupedFilter: grouped,
      }));
      setFilteredApiData(sorted)
      setisFilterApply(true);

      console.log("FILTER ANALYTICS →",
        "\nTab:", requestType,
        "\nLAN Count:", rawIndexData.length,
        "\nFinal Records:", sorted,
        "\nGroups:", Object.keys(grouped).length,
        "\nTime:", Date.now() - ts, "ms"
      );

    } catch (err) {
      console.warn("handleFilterResponse error:", err);
    }
  };

  const submitFilter = async (forcedTab = null) => {
    setLoadinglinkFromAPI(true);
    try {
      const numericState = {
        bucket, bucketMin: bucketmin, bucketMax,
        dpd: DPD, dpdMin, dpdMax,
        pos: POS, posMin, posMax,
        tos: TOS, tosMin, tosMax,
        dormancy: Dormancy, DorMin, DorMax,
      };

      if (!validateFilterValues(numericState)) return;
      const mapped = tabMappings[activeTab];
      const reqType = mapped || activeTab.replace(/\s+/g, "_");
      console.log(reqType, 'reqTypereqType')
      const payload = buildFilterPayload({
        // caseStatus:
        lenderSelected: lenderselected,
        selectedPortfolio: selected,
        selectedProduct: selProduct,
        selectedZone: selZone,
        selectedRegion: selRegion,
        selectedState: selStates,
        selectedCity: selCities,
        selectedPincode: selPinode,

        caseStatus: reqType,
        paymentStatus: 'NA',
        callStatus: "NA",
        // paymentStatus:
        //   Approved ? "Success" :
        //     Rejected ? "Reject" :
        //       "NA",

        ...numericState,
      });

      if (!Object.keys(payload).length) {
        return Alert.alert("No Filters", "Please select at least one filter.");
      }

      // -----------------------------------------------------
      // 3️⃣ Resolve Backend Tab Key
      // -----------------------------------------------------
      const tabMapping = {
        "All": "All",
        "New": 'New',
        "My Cases": "My_case",
        "Allocated": "Allocated",
        "In Progress": "In_progress",
        "Unallocated(Pending)": "Unallocated_pending",
        "Unallocated(Approved)": "Unallocated_approved",
        "Unallocated(Approval Rejected)": "Unallocated_rejected",
        "Foreclosure": "Foreclosure",
        "Settlement": "Settlement",
        "CaseClosure(Pending)": "Case_closer_pending",
        "CaseClosure(Approved)": "Case_closer_approve",
        "CaseClosure(Rejected)": "Case_closer_rejected",
      };

      const requestType = forcedTab || activeTab;       // 👈 FIXED
      const tabToSearch = tabMapping[requestType];      // 👈 FIXED

      const Roles = userProfile?.role?.map(r => r.roleCode) || [];
      const currentRoles = Roles[0]
      const url = getEndpoint(tabToSearch, userProfile, currentRoles, userProfile.userId);
      console.log(url, currentRoles, 'urlurl')
      const res1 = await apiClient.post(`${url}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`, Accept: "application/json",
          "Content-Type": "application/json",
        }
      });

      const indexData = res1?.data?.response || [];
      const lanList = indexData.map(i => i.allLan).filter(Boolean);

      let bulkData = [];
      if (lanList.length) {
        const res2 = await apiClient.post(
          `getBulkUploadSuccessByListOfLan/${userProfile.userId}`,
          lanList,
          {
            headers: {
              Authorization: `Bearer ${token}`, Accept: "application/json",
              "Content-Type": "application/json",
            }
          }
        );
        bulkData = res2?.data?.data || res2?.data || [];
      }

      handleFilterResponse({
        rawIndexData: indexData,
        bulkData,
        requestType,
        tabToSearch,
        isSearch: false,
      });

      setShowFilter(false);

    } catch (error) {
      console.error("submitFilter Error:", error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to apply filter."
      );

      setState(prev => ({
        ...prev,
        loading: false,
        isLoadingMore: false,
        error: "Filter failed",
      }));

    } finally {
      // dispatch(showLoader(false));
      setLoadinglinkFromAPI(false);
    }
  };
  const currentRoles = useMemo(() =>
    userProfile?.role.map(a => a?.roleCode?.toLowerCase()),
  );
  const filterOptions = [
    { name: 'All', visibleTo: ['cca', 'sh', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'New', visibleTo: ['cca', 'sh', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'My Cases', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Allocated', visibleTo: ['cca', 'op', 'sh', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'pco', 'arm', 'r1'] },
    { name: 'In Progress', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Unallocated(Approval Rejected)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Unallocated(Pending)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Unallocated(Approved)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Foreclosure', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'Settlement', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'CaseClosure(Approved)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'CaseClosure(Pending)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
    { name: 'CaseClosure(Rejected)', visibleTo: ['cca', 'ca', 'sh', 'dra', 'fa', 'atl', 'aa', 'rh', 'ch', 'nrm', 'mis', 'zrm', 'rrm', 'prm', 'arm', 'r1'] },
  ];

  const visibleTabs = useMemo(() => {
    return filterOptions
      .filter(option => option.visibleTo)
      .filter(option => option.visibleTo === true || (
        Array.isArray(option.visibleTo) &&
        option.visibleTo.some(role => currentRoles?.includes(role))
      ));
  }, [filterOptions, currentRoles]);

  const getFirstAvailableTab = () => {
    const accessibleTabs = TABS.filter(tab => visibleTabs.some(option => option.name === tab));
    return accessibleTabs.length > 0 ? accessibleTabs[0] : TABS[0];  // Default to 'All' if no accessible tabs
  };

  // console.log(getFirstAvailableTab, 'getFirstAvailableTabgetFirstAvailableTab')

  const hasSetInitialTab = useRef(false);

  useEffect(() => {
    if (!hasSetInitialTab.current) {
      const newActiveTab = getFirstAvailableTab();
      hasSetInitialTab.current = true;
    }
  }, [currentRoles, visibleTabs]);


  const isTabVisible = visibleTabs.some(tab => tab.name === state.activeTab);

  // const onEndReachedCalledDuringMomentum = useRef(false);


  // ----------------- UI -----------------
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="#001D56" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Image source={require('../../../asset/icon/menus.png')} style={styles.drawerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Allocation</Text>
      </View>


      <View style={{ height: 70, paddingVertical: 8 }}>
        <FlatList
          horizontal
          // data={TABS}
          data={visibleTabs.map(t => t.name)}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t}
          renderItem={({ item }) => {
            const count = state.tabDataCounts[item] ?? 0;
            const isActive = item === activeTab;

            return (
              <TouchableOpacity
                onPress={() => onTabPress(item)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginHorizontal: 6,
                  backgroundColor: isActive ? theme.light.darkBlue : '#eee',
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: isActive ? '#fff' : '#000', fontWeight: '600' }}>
                  {item}
                </Text>

                {/* Only show count if > 0 */}
                {count > 0 && (
                  <View
                    style={{
                      marginLeft: 6,
                      backgroundColor: isActive ? '#fff' : theme.light.darkBlue,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: isActive ? theme.light.darkBlue : '#fff', fontSize: 12, fontWeight: '700' }}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loadinglinkFromAPI && (
        <View style={styles.localLoaderOverlay}>
          <ActivityIndicator size="large" color="#040675FF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {isBulkLoading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0047AB" />
            <Text style={styles.loaderText}>Fetching data...</Text>
          </View>
        </View>
      )}

      <View style={styles.searchRow}>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder={isLANSearch ? "Search by LAN ID…" : "Search by Borrower Name…"}
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchinputTxt}
            onChangeText={(val) => {
              setsearchinputTxt(val);

              const trimmed = val.trim();

              if (trimmed.length === 0) {
                // 🔥 user cleared text with keyboard → disable search mode
                setIsSearch(false);
                setIsSearching(false);
                setFilteredApiData([]);
                setLastSearchTab(null);

                // 🔥 restore normal data for active tab
                const lanFetcher = lanListFetchers[activeTab];
                refresh({ lanListFetcher: lanFetcher, bulkFetcher });
                getCount();
                return;
              }

              // Otherwise normal behavior
              setIsSearch(true);
            }}

            returnKeyType="search"
            onSubmitEditing={() =>
              searchinputTxt.trim() && handleSearch(activeTab)  // use activeTab
            }
          />

          <TouchableOpacity onPress={() => setisLANSearch(prev => !prev)}>
            <Image
              source={require("../../../asset/icon/swap.png")}
              style={styles.swapIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* CLEAR BUTTON */}
        <TouchableOpacity
          onPress={() => {
            if (IsSearch) {
              setsearchinputTxt("");
              setIsSearch(false);

              setFilteredApiData([]);
              setLastSearchTab(null);
              setIsSearching(false);      // exit search mode

              getCount();

              // Reload actual paginated data
              const lanFetcher = lanListFetchers[activeTab];
              refresh({ lanListFetcher: lanFetcher, bulkFetcher });
            }
          }}
          disabled={!IsSearch}
          style={[styles.clearBtn, { opacity: IsSearch ? 1 : 0.5 }]}
        >
          <Image
            source={
              IsSearch
                ? require("../../../asset/icon/cross.png")
                : require("../../../asset/icon/searchIcon.png")
            }
            style={styles.searchOrClearIcon}
          />
        </TouchableOpacity>

      </View>


      {isSearching && lastSearchTab && (
        <Text style={{ marginLeft: 14, marginVertical: 6, color: '#777' }}>
          Showing results from: <Text style={{ fontWeight: 'bold' }}>{lastSearchTab}</Text>
        </Text>
      )}


      {isInitialLoading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={finalList}
          keyExtractor={(item, index) =>
            item.id?.toString() ?? index.toString()
          }
          renderItem={renderCard}

          onEndReached={() => {
            if (isSearching || isFilterApply) return;
            if (onEndReachedCalledDuringMomentum.current) return;

            onEndReachedCalledDuringMomentum.current = true;

            if (!isLoadingMore && hasMore) {
              handleLoadMore();
            }
          }}

          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}

          onEndReachedThreshold={0.2}

          contentContainerStyle={{
            paddingBottom: 140,
            flexGrow: 1,
          }}

          // ListEmptyComponent={
          //   shouldShowEmpty ? (
          //     <Text style={styles.emptyText}>No records found</Text>
          //   ) : null
          // }

          ListFooterComponent={
            !isSearching && !isFilterApply && isLoadingMore ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}



      {/* BOTTOM SORT / FILTER BAR */}
      <View style={styles.bottomBar}>
        {bottomActions.map(({ key, onPress, icon, label }) => (
          <TouchableOpacity
            key={key}
            style={styles.bottomButton}
            onPress={onPress}
          >
            <Image source={icon} style={styles.bottomIcon} />
            <Text style={styles.bottomText}>{label}</Text>
          </TouchableOpacity>
        ))}

        {isFilterApply && (
          <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilter}>
            <Image
              source={require('../../../asset/icon/cross.png')}
              style={{ height: 23, width: 23 }}
            />
          </TouchableOpacity>
        )}
      </View>


      {/* SORT MODAL */}
      <SortModal
        visible={showSort}
        onClose={() => setShowSort(false)}
        sortType={sortTypeState}
        setSortType={setSortTypeState}
        options={sortOptions}
        onApply={() => {
          setShowSort(false);
          sortList();
        }}
      />


      {/* FILTER MODAL */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onSubmit={() => {
          submitFilter();
          setShowFilter(false);
        }}
        onClear={clearFilter}

        lenderLists={lenderLists}
        lenderSelected={lenderselected}
        setLenderSelected={setlenderSelected}

        portfolio={portfolio}
        selectedPortfolio={selected}
        setSelectedPortfolio={setSelected}

        product={product}
        selectedProduct={selProduct}
        setSelectedProduct={setSelProduct}

        zone={zone}
        selectedZone={selZone}
        onZoneSelect={onZoneSelect}

        region={region}
        selectedRegion={selRegion}
        onRegionSelect={onRegionSelect}   // ✅ FIXED

        stateList={allStates}
        selectedState={selStates}
        onStateSelect={onStateSelect}

        cities={allCities}
        selectedCity={selCities}
        onCitySelect={onCitySelect}

        pincodes={formattedPincodeData}
        selectedPincode={selPinode}
        setSelectedPincode={setSelPinode}


        Approved={Approved}
        setApproved={setApproved}
        Rejected={Rejected}
        setRejected={setRejected}
        // theme={theme}


        bucket={bucket}
        setBucket={setBucket}
        bucketMin={bucketmin}
        setBucketMin={setBucketmin}
        bucketMax={bucketMax}
        setBucketMax={setBucketMax}

        dpd={DPD}
        setDPD={setDPD}
        dpdMin={dpdMin}
        setDpdMin={setDpdMin}
        dpdMax={dpdMax}
        setDpdMax={setDpdMax}

        pos={POS}
        setPOS={setPOS}
        posMin={posMin}
        setPosMin={setPosMin}
        posMax={posMax}
        setPosMax={setPosMax}

        tos={TOS}
        setTOS={setTOS}
        tosMin={tosMin}
        setTosMin={setTosMin}
        tosMax={tosMax}
        setTosMax={setTosMax}

        dormancy={Dormancy}
        setDormancy={setDormancy}
        dorMin={DorMin}
        setDorMin={setDorMin}
        dorMax={DorMax}
        setDorMax={setDorMax}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.light.darkBlue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  drawerIcon: { width: scale(22), height: scale(22), tintColor: '#FFFFFF' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#FFFFFF', marginLeft: scale(8) },

  localLoaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, color: 'black', fontSize: 16 },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1 },


  labelexp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  valueexp: {
    fontSize: 14,
    color: '#333',
  },


  leftSection: {
    flex: 0.75,
  },

  actionColumn: {
    flex: 0.25,
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  headerCol: {
    flex: 1,
    paddingRight: 10,
  },

  expandButton: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  expandArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },

  expandedCol: {
    flex: 1,
    paddingRight: 10,
  },

  actionWrapper: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  emptyText: {
    textAlign: "center",
    marginTop: "50%",
    color: "#9CA3AF",
    fontSize: 14,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 6,
  },

  swapIcon: {
    height: 22,
    width: 22,
    tintColor: "#555",
    marginLeft: 8,
  },

  clearBtn: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#eee",
  },

  searchOrClearIcon: {
    height: 26,
    width: 26,
    tintColor: "#444",
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 55,
    backgroundColor: theme.light.darkBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    elevation: 12,
  },

  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loaderBox: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: 180,
  },

  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },

  bottomButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  bottomIcon: {
    height: 18,
    width: 18,
    tintColor: "#fff",
    marginRight: 6,
  },

  bottomText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  clearFilterBtn: {
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
  },

});
