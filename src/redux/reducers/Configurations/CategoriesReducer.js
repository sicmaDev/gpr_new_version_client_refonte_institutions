const initialState = {
    isLoading: false,
    categorie_errors: {},
    id: "",
    libelle: "",
    description: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const CategoriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CATEGORIE_ERRORS':
            return {
                ...state,
                categorie_errors: action.payload,
            };
        case 'CATEGORIE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CATEGORIE_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'CATEGORIE_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'CATEGORIE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CATEGORIE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'CATEGORIE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'CATEGORIE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'CATEGORIE_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default CategoriesReducer;