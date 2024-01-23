const initialState = {
    isLoading: false,
    produit_errors: {},
    id: "",
    libelle: "",
    description: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const ProduitsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'PRODUIT_ERRORS':
            return {
                ...state,
                produit_errors: action.payload,
            };
        case 'PRODUIT_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'PRODUIT_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'PRODUIT_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'PRODUIT_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'PRODUIT_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'PRODUIT_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'PRODUIT_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'PRODUIT_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default ProduitsReducer;