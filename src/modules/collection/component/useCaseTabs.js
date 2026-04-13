//New 
import { useCallback, useRef, useState } from "react";

export default function useCaseTabs({
  tabs = [],
  lanListFetchers = {},
  bulkFetcher,
  initialTab = null,
  isSearching = false,
  isFilterApply = false,
}) {

  /* ---------------------------------------------------------
     REFS: LAN cache, data cache, page info (per tab)
  --------------------------------------------------------- */
  const lanCache = useRef({});
  const dataCache = useRef({});
  const pageInfo = useRef({});  // { page, limit, hasMore }

  const LIMIT = 20;

  const ensurePageInfo = (tab) => {
    if (!pageInfo.current[tab]) {
      pageInfo.current[tab] = { page: 1, limit: LIMIT, hasMore: true };
    }
    return pageInfo.current[tab];
  };

  const resetTab = (tab) => {
    lanCache.current[tab] = [];
    dataCache.current[tab] = [];
    pageInfo.current[tab] = { page: 1, limit: LIMIT, hasMore: true };
  };

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */
  const [activeTab, setActiveTabState] = useState(initialTab || tabs[0]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* ---------------------------------------------------------
     MAIN FETCHER
  --------------------------------------------------------- */
  const fetchPage = useCallback(
    async (tab, { reset = false } = {}) => {
      if (isSearching || isFilterApply) return;

      const page = ensurePageInfo(tab);
      if (reset) resetTab(tab);

      const isFirstPage = page.page === 1;
      isFirstPage ? setIsLoading(true) : setIsLoadingMore(true);

      try {
        /* --------------------------------------------
           1) Get LAN list (or reuse cache)
        -------------------------------------------- */
        let allLANs = lanCache.current[tab];

        if (!allLANs || allLANs.length === 0) {
          const fetcher = lanListFetchers[tab];
          allLANs = fetcher ? await fetcher() : [];

          // Case closure or special tabs → no LAN
          if (allLANs.includes("__NO_LAN__")) {
            const items = await bulkFetcher(null, tab);

            dataCache.current[tab] = items;
            setData(items);
            setHasMore(false);
            return;
          }

          lanCache.current[tab] = allLANs;
        }

        if (allLANs.length === 0) {
          dataCache.current[tab] = [];
          setData([]);
          setHasMore(false);
          return;
        }

        /* --------------------------------------------
           2) Prepare LAN batch (current page)
        -------------------------------------------- */
        const start = (page.page - 1) * page.limit;
        const end = start + page.limit;

        const lanBatch = allLANs.slice(start, end);

        if (lanBatch.length === 0) {
          page.hasMore = false;
          setHasMore(false);
          return;
        }

        /* --------------------------------------------
           3) Bulk fetch cases
        -------------------------------------------- */
        const newItems = await bulkFetcher(lanBatch, tab);
        const existing = dataCache.current[tab] || [];

        const merged = page.page === 1
          ? newItems
          : [...existing, ...newItems];

        dataCache.current[tab] = merged;
        setData(merged);

        /* --------------------------------------------
           4) Pagination update
        -------------------------------------------- */
        page.page += 1;

        // Only stop when backend returns ZERO rows
        if (!newItems || newItems.length === 0) {
          page.hasMore = false;
        } else {
          page.hasMore = true;
        }

        setHasMore(page.hasMore);


      } catch (e) {
        console.log("fetchPage error:", e);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [isSearching, isFilterApply, lanListFetchers, bulkFetcher]
  );

  /* ---------------------------------------------------------
     SWITCH TAB
  --------------------------------------------------------- */
  const switchTab = useCallback(
    async (tab) => {
      setActiveTabState(tab);

      // If cached → return instantly (no API)
      if (dataCache.current[tab]?.length) {
        setData(dataCache.current[tab]);
        setHasMore(pageInfo.current[tab]?.hasMore ?? true);
        return;
      }

      // Else → fresh fetch
      await fetchPage(tab, { reset: true });
    },
    [fetchPage]
  );

  /* ---------------------------------------------------------
     LOAD MORE
  --------------------------------------------------------- */
  const loadMore = useCallback(() => {
    if (isSearching || isFilterApply) return;

    const info = ensurePageInfo(activeTab);
    if (!info.hasMore) return;

    fetchPage(activeTab);
  }, [activeTab, fetchPage, isSearching, isFilterApply]);

  /* ---------------------------------------------------------
     REFRESH (pull to refresh)
  --------------------------------------------------------- */
  const refresh = useCallback(async () => {
    if (isSearching || isFilterApply) return;
    await fetchPage(activeTab, { reset: true });
  }, [activeTab, fetchPage, isSearching, isFilterApply]);

  const forceSetData = useCallback(
    (newData) => {
      if (!activeTab) return;

      // Update cache for CURRENT TAB
      dataCache.current[activeTab] = newData;

      // Update UI immediately
      setData(newData);
    },
    [activeTab]
  );

  /* ---------------------------------------------------------
     RETURN
  --------------------------------------------------------- */
  return {
    activeTab,
    setActiveTab: switchTab,
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
    forceSetData,
    // For debugging
    _cache: { lanCache, dataCache, pageInfo },
  };
}
