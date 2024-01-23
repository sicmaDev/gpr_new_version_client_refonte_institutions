const initialState = {
    isLoading: false,
    report_errors: {},
    year: "",
    start: "",
    start_dp: "",
    end: "",
    end_dp: "",
    pos: "",
    unit: "",
    director: "",
    pilote: "",
    monthsYears: [],
    claims: [],
    denunciations: [],
    suggestions: [],
    claim_trend: [],
    global_trend: {},
    genre_trend: [],
    response_rate: [],
    satisfaction_rate: [],
    claimReport: {},
    denunReport: {},
    sugReport: {},
    basicStat: {},
    stat: {},
  };
  
  const GlobalReducer = (state = initialState, action) => {
    switch (action.type) {
      case "LOADING":
        return {
          ...state,
          isLoading: !state.isLoading,
        };
      case "REPORT_ERRORS":
        return {
          ...state,
          report_errors: action.payload,
        };
      case "REPORT_YEAR":
        return {
          ...state,
          year: action.payload,
        };
      case "REPORT_START":
        return {
          ...state,
          start: action.payload,
        };
      case "REPORT_END":
        return {
          ...state,
          end: action.payload,
        };
      case "REPORT_START_DP":
        return {
          ...state,
          start_dp: action.payload,
        };
      case "REPORT_END_DP":
        return {
          ...state,
          end_dp: action.payload,
        };
      case "REPORT_UNIT":
        return {
          ...state,
          unit: action.payload,
        };
      case "REPORT_POS":
        return {
          ...state,
          pos: action.payload,
        };
      case "REPORT_DIRECTOR":
        return {
          ...state,
          director: action.payload,
        };
      case "REPORT_PILOTE":
        return {
          ...state,
          pilote: action.payload,
        };
      case "REPORT_MONTHS_YEARS":
        return {
          ...state,
          monthsYears: action.payload,
        };
      case "REPORT_CLAIMS":
        return {
          ...state,
          claims: action.payload,
        };
      case "REPORT_DENUNCIATIONS":
        return {
          ...state,
          denunciations: action.payload,
        };
      case "REPORT_SUGGESTIONS":
        return {
          ...state,
          suggestions: action.payload,
        };
      case "REPORT_CLAIM_TREND":
        return {
          ...state,
          claim_trend: action.payload,
        };
      case "REPORT_GLOBAL_TREND":
        return {
          ...state,
          global_trend: action.payload,
        };
      case "REPORT_GENRE_TREND":
        return {
          ...state,
          genre_trend: action.payload,
        };
      case "REPORT_RESPONSE_RATE":
        return {
          ...state,
          response_rate: action.payload,
        };
      case "REPORT_SATISFACTION_RATE":
        return {
          ...state,
          satisfaction_rate: action.payload,
        };
      case "REPORT_CLAIM":
        return {
          ...state,
          claimReport: action.payload,
        };
      case "REPORT_DENUN":
        return {
          ...state,
          denunReport: action.payload,
        };
      case "REPORT_SUG":
        return {
          ...state,
          sugReport: action.payload,
        };
      case "REPORT_BASIC_STAT":
        return {
          ...state,
          basicStat: action.payload,
        };
      case "REPORT_STAT":
        return {
          ...state,
          stat: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default GlobalReducer;
  