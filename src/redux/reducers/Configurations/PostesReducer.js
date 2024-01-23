const initialState = {
    isLoading: false,
    poste_errors: {},
    id: "",
    libelle: "",
    description: "",
    habilitations: "",
    card: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const PosteReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'POSTE_ERRORS':
            return {
                ...state,
                poste_errors: action.payload,
            };
        case 'POSTE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'POSTE_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'POSTE_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'POSTE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'POSTE_HABILITATIONS_CHANGED':
            return {
                ...state,
                habilitations: action.payload,
            };
        case 'POSTE_CARD_CHANGED':
            return {
                ...state,
                card: action.payload,
            };
        case 'POSTE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'POSTE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'POSTE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'POSTE_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default PosteReducer;