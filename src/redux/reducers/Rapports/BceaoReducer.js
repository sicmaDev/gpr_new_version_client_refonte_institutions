const initialState = {
    global: {},
    open : true,
  };
  
  const BceaoReducer = (state = initialState, action) => {
    switch (action.type) {
      case "REPORT_BCEAO_GLOBAL":
        return {
          ...state,
          global: action.payload,
        };
      case "REPORT_BCEAO_OPEN":
        return {
          ...state,
          open: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default BceaoReducer;
  