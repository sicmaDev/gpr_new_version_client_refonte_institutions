const initialState = {
    isLoading: false,
    isAuthenticated: false,
    actif: false,
    page:"Titre",
};

const LayoutReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
      
        case 'AUTHENTICATED':
            return {
                ...state,
                isAuthenticated: !state.isAuthenticated,
            };
        case 'PAGE':
            return {
                ...state,
                page: state.page,
            };
        case 'ACTIF':
            return {
                ...state,
                actif: state.actif,
            };
        default:
            return state
    }
};

export default LayoutReducer;