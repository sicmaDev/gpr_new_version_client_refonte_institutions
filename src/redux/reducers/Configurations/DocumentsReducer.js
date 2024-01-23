const initialState = {
    isLoading: false,
    documentsErrors: {},
    id: "",
    libelle: "",
    description: "",
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    etat: false,
    etat2: false,
    etat3: false,
};

const DocumentsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'DOCUMENTS_ERRORS':
            return {
                ...state,
                documentsErrors: action.payload,
            };
        case 'DOCUMENTS_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'DOCUMENTS_LIBELLE_CHANGED':
            return {
                ...state,
                libelle: action.payload,
            };
        case 'DOCUMENTS_SELECTED_FILES_CHANGED':
            return {
                ...state,
                selectedFiles: [...state.selectedFiles, action.payload],
            };
        case 'DOCUMENTS_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
       
        case 'DOCUMENTS_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
        case 'DOCUMENTS_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'DOCUMENTS_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'DOCUMENTS_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'DOCUMENTS_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'DOCUMENTS_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default DocumentsReducer;