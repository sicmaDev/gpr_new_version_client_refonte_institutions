const initialState = {
    isLoading: false,
    langue_errors: {},
    id: "",
    libelle: "",
    description: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const LanguesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'LANGUE_ERRORS':
            return {
                ...state,
                langue_errors: action.payload,
            };
        case 'LANGUE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'LANGUE_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'LANGUE_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'LANGUE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'LANGUE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'LANGUE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'LANGUE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'LANGUE_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default LanguesReducer;