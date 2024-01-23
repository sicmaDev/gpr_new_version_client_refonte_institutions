const initialState = {
    isLoading: false,
    objet_errors: {},
    id: "",
    libelle: "",
    description: "",
    risqueLevel: "",
    categorie: "",
    categorieLibelle: "",
    processingTime: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const ObjetsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'OBJET_ERRORS':
            return {
                ...state,
                objet_errors: action.payload,
            };
        case 'OBJET_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'OBJET_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'OBJET_DESCRIPTION_CHANGED':
            return {
                ...state,
                description: action.payload,
            };
        case 'OBJET_RISQUE_LEVEL_CHANGED':
            return {
                ...state,
                risqueLevel: action.payload,
            };
        case 'OBJET_CATEGORIE_CHANGED':
            return {
                ...state,
                categorie: action.payload,
            };
        case 'OBJET_CATEGORIE_LIBELLE_CHANGED':
            return {
                ...state,
                categorieLibelle: action.payload,
            };
        case 'OBJET_PROCESSING_TIME_CHANGED':
            return {
                ...state,
                processingTime: action.payload,
            };
        case 'OBJET_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'OBJET_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'OBJET_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'OBJET_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'OBJET_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
          
        default:
            return state
    }
}

export default ObjetsReducer;