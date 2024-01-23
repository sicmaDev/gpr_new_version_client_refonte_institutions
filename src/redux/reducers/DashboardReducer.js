const initialState = {
    dashboard: {},
    etat1:false
  };
  
  const DashboardReducer = (state = initialState, action) => {
    switch (action.type) {
      case "DASHBOARD":
        return {
          ...state,
          dashboard: action.payload,
        };
      case "ETAT1_CHANGED":
        return {
          ...state,
          etat1: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default DashboardReducer;
  