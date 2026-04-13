// src/hooks/useFilter.js
import { useReducer, useCallback, useEffect } from "react";
import { userApi } from "../api/userApi";
import { useSelector } from "react-redux";

const initial = {
  date: new Date(),
  startTime: (() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  })(),
  endTime: new Date(),

  userType: null,
  state: null,
  city: null,
  portfolio: null,
  activity: null,

  states: [],
  cities: [],
  portfolios: []
};

function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };

    case "RESET":
      return {
        ...initial,
        states: state.states,
        portfolios: state.portfolios,
        cities: []
      };

    case "SET_OPTIONS":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export default function useFilter() {
  const token = useSelector(s => s.auth.token);
  const [state, dispatch] = useReducer(reducer, initial);

  const setFilterValue = useCallback(
    (key, value) => dispatch({ type: "SET", key, value }),
    []
  );

  const resetFilters = useCallback(() => dispatch({ type: "RESET" }), []);

  // Load states + portfolios on startup
  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const [statesRes, portfolioRes] = await Promise.all([
          userApi.getAllStates(token),
          userApi.getAllPortfolio(token)
        ]);

        const states = (statesRes?.data?.data || []).map(s => ({
          label: s.stateName,
          value: s.stateId
        }));

        const portfolios = (portfolioRes?.data?.data || []).map(p => ({
          label: p.portfolioDescription,
          value: p.portfolioId
        }));

        if (mounted)
          dispatch({
            type: "SET_OPTIONS",
            payload: { states, portfolios }
          });

      } catch (e) {
        console.warn("useFilter.loadOptions", e);
      }
    };

    if (token) loadOptions();
    return () => (mounted = false);
  }, [token]);

  // Load cities when state changes
  useEffect(() => {
    let mounted = true;
    const loadCities = async () => {
      if (!state.state || !token) return;

      try {
        const res = await userApi.getCityByState(state.state, token);
        const cities = (res?.data?.response || []).map(c => ({
          label: c.cityName,
          value: c.cityId
        }));

        if (mounted)
          dispatch({ type: "SET_OPTIONS", payload: { cities } });

      } catch (e) {
        console.warn("useFilter.loadCities", e);
      }
    };

    loadCities();
    return () => (mounted = false);
  }, [state.state, token]);

  return {
    filters: state,
    setFilterValue,
    resetFilters
  };
}
