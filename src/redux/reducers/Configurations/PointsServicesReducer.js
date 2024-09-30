const initialState = {
    isLoading: false,
    ps_errors: {},
    id: "",
    code: "",
    libelle: "",
    type: "",
    description: "",
    unit: "",
    unitLibelle: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const PointsServicesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'PS_ERRORS':
            return {
                ...state,
                ps_errors: action.payload,
            };
        case 'PS_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'PS_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        
        case 'PS_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'PS_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'PS_TYPE_CHANGED':
            return {
                ...state,
                type: action.payload,
            };
        case 'PS_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'PS_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'PS_UNIT_LIBELLE_CHANGED':
            return {
                ...state,
                unitLibelle: action.payload,
            };
        case 'PS_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'PS_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'PS_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'PS_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default PointsServicesReducer;