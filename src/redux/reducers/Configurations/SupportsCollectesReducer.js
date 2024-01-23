const initialState = {
    isLoading: false,
    sc_errors: {},
    id: "",
    name: "",
    description: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const SupportsCollectesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'SC_ERRORS':
            return {
                ...state,
                sc_errors: action.payload,
            };
        case 'SC_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'SC_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'SC_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'SC_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'SC_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'SC_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'SC_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'SC_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default SupportsCollectesReducer;