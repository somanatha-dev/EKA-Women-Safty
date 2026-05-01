import { useState, useEffect } from 'react';

export function useLocationFilters() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [campuses, setCampuses] = useState([]);

  const [countryId, setCountryId] = useState(null);
  const [stateId, setStateId] = useState(null);
  const [cityId, setCityId] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const [campusId, setCampusId] = useState(null);

  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
    areas: false,
    campuses: false
  });

  const resetAll = () => {
    setCountryId(null);
    setStateId(null);
    setCityId(null);
    setAreaId(null);
    setCampusId(null);
  };

  // Mock data or fetch logic could go here
  // For now, keeping it minimal to resolve imports

  return {
    countries,
    states,
    cities,
    areas,
    campuses,
    countryId,
    stateId,
    cityId,
    areaId,
    campusId,
    setCountryId,
    setStateId,
    setCityId,
    setAreaId,
    setCampusId,
    loading,
    resetAll,
    selectedCountry: null,
    selectedState: null,
    selectedCity: null,
    selectedArea: null,
    selectedCampus: null
  };
}
