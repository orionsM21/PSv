const SearchItem = (textForSearch, ItemFormSearch) => {
    let selectedData;
    const productData = ItemFormSearch;
    const searchText = textForSearch.toLowerCase();
    const AllData = productData;
    // console.warn('all ', AllData.product)
    // AllData.map((data) => {
    //   console.warn('all ',data.productTitle)
    // });
    // const result = array.findIndex(item => query.toLowerCase() === item.toLowerCase());
    const filterData = AllData.filter((Dt) => {
      return Dt.productTitle.toLowerCase().match(searchText.toLowerCase());
    });
    if (searchText === '') {
      selectedData = productData;
    } else {
      selectedData = filterData;
    }
    return selectedData;
  };
  
  const SearchItem1 = (textForSearch, ItemFormSearch) => {
    let selectedData;
    const productData = ItemFormSearch;
    const searchText = textForSearch.toLowerCase();
    const AllData = productData;
    const filterData = AllData.filter((Dt) => {
      return Dt.subCategoryName.toLowerCase().match(searchText);
    });
    if (searchText === '') {
      selectedData = productData;
    } else {
      selectedData = filterData;
    }
    return selectedData;
  };
  
  const SearchItem2 = (textForSearch, ItemFormSearch) => {
    let selectedData;
    const productData = ItemFormSearch;
    const searchText = textForSearch.toLowerCase();
    const AllData = productData;
    const filterData = AllData.filter((Dt) => {
      return Dt.categoryName.toLowerCase().match(searchText);
    });
    if (searchText === '') {
      selectedData = productData;
    } else {
      selectedData = filterData;
    }
    return selectedData;
  };
  
  const SearchItem3 = (textForSearch, ItemFormSearch) => {
    let selectedData;
    const productData = ItemFormSearch;
    const searchText = textForSearch.toLowerCase();
    const AllData = productData;
    // console.warn('AllData ', AllData);
  
    // AllData.map((data) => {
    //   console.warn('data ', data.productTitle);
    // });
  
    const filterData = AllData.filter((Dt) => {
      return Dt.productTitle.toLowerCase().match(searchText);
    });
  
    if (searchText === '') {
      selectedData = productData;
    } else {
      selectedData = filterData;
    }
    return selectedData;
  };
  
  const SearchItem4 = (textForSearch, ItemFormSearch) => {
    let selectedData;
    const productData = ItemFormSearch;
    const searchText = textForSearch.toLowerCase();
    const AllData = productData;
  
    // AllData.map((data) => {
    //   console.warn('data ', data.productTitle);
    // });
  
    const filterData = AllData.filter((Dt) => {
      // console.warn('data ', searchText);
      return Dt.productTitle.toLowerCase().match(searchText);
    });
  
    if (searchText === '') {
      selectedData = productData;
      console.warn('selectedData0 ', selectedData);
    } else {
      selectedData = filterData;
      console.warn('selectedData1 ', selectedData);
    }
    return selectedData;
  };
  
  const Ascending = (a, b) => {
    if (a.totalPrice < b.totalPrice) {
      return -1;
    }
    if (a.totalPrice < b.totalPrice) {
      return 1;
    }
    return 0;
  };
  
  const sortItem = (productData, type) => {
    let Data;
    if (type === 'lowHigh') {
      Data = productData.sort(Ascending);
    }
    if (type === 'highLow') {
      Data = productData.sort(Ascending);
      Data = Data.reverse();
    }
    return Data;
  };
  
  const sortBtntitle = [
    {
      id: '1',
      title: 'Price -- Low to High',
      type: 'lowHigh',
    },
    {
      id: '2',
      title: 'Price -- High to Low',
      type: 'highLow',
    },
  ];
  
  export {SearchItem, sortBtntitle, sortItem, SearchItem1, SearchItem2, SearchItem3, SearchItem4};