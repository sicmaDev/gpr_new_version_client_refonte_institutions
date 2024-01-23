const initialState = {
    isLoading: false,
    items: [],
};
const AlertesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'ALERT_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        default:
            return state
    }
}
export default AlertesReducer;