const initialState = {
    isLoading: false,
    faqErrors: {},
    id: "",
    libelle: "",
    contenu: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const FaqReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'FAQ_ERRORS':
            return {
                ...state,
                faqErrors: action.payload,
            };
        case 'FAQ_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'FAQ_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'FAQ_CONTENU_CHANGED':
            return {
                ...state,
                contenu: action.payload,
            };
        case 'FAQ_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'FAQ_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'FAQ_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'FAQ_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'FAQ_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default FaqReducer;