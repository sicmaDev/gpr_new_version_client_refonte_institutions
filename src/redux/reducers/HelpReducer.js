const initialState = {
    help: {},
  };
  
  const HelpReducer = (state = initialState, action) => {
    switch (action.type) {
      case "HELP":
        return {
          ...state,
          help: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default HelpReducer;
  