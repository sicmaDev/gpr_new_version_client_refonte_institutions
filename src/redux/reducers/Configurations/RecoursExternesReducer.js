const initialState = {
    isLoading: false,
    recoursExternesErrors: {},
    id: "",
    libelle: "",
    description: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const RecoursExternesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'RECOURS_EXTERNES_ERRORS':
            return {
                ...state,
                recoursExternesErrors: action.payload,
            };
        case 'RECOURS_EXTERNES_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'RECOURS_EXTERNES_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'RECOURS_EXTERNES_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'RECOURS_EXTERNES_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'RECOURS_EXTERNES_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'RECOURS_EXTERNES_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'RECOURS_EXTERNES_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'RECOURS_EXTERNES_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default RecoursExternesReducer;