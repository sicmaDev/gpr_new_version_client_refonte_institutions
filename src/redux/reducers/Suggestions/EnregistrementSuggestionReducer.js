const initialState = {
    isLoading: false,
    suggestions_record_errors: {},
    id: "",
    firstname: "",
    lastname: "",
    address: "",
    phone: "",
    gender: "",
    language: "",
    dossierimf: "",
    code: "",
    recorded_at: "",
    recorded_at_dp: "",
    collect: "",
    subject: "",
    product: "",
    unit: "",
    content: "",
    solution: [],
    comment: "",
    status: "",
    crew: "",
    etat: false,
    etat2: false,
    created_at: "",
    created_by: "",
    handled_at: "",
    handled_by: "",
    resolved_at: "",
    resolved_by: "",
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    showSelectPrintItem : false
};
const EnregistrementSuggestionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'SUGGESTION_RECORD_ERRORS':
            return {
                ...state,
                suggestions_record_errors: action.payload,
            };
        case 'SUGGESTION_RECORD_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'SUGGESTION_RECORD_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'SUGGESTION_RECORD_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'SUGGESTION_RECORD_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'SUGGESTION_RECORD_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'SUGGESTION_RECORD_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'SUGGESTION_RECORD_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'SUGGESTION_RECORD_LANGUAGE_LIBELLE_CHANGED':
            return {
                ...state,
                languageLibelle: action.payload,
            };
        case 'SUGGESTION_RECORD_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'SUGGESTION_RECORD_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'SUGGESTION_RECORD_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'SUGGESTION_RECORD_RECORDED_AT_DP_CHANGED':
            return {
                ...state,
                recorded_at_dp: action.payload,
            };
        case 'SUGGESTION_RECORD_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'SUGGESTION_RECORD_COLLECT_LIBELLE_CHANGED':
            return {
                ...state,
                collectLibelle: action.payload,
            };
        case 'SUGGESTION_RECORD_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'SUGGESTION_RECORD_SUBJECT_LIBELLE_CHANGED':
            return {
                ...state,
                subjectLibelle: action.payload,
            };
        case 'SUGGESTION_RECORD_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'SUGGESTION_RECORD_PRODUCT_LIBELLE_CHANGED':
            return {
                ...state,
                productLibelle: action.payload,
            };
        case 'SUGGESTION_RECORD_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'SUGGESTION_RECORD_UNIT_LIBELLE_CHANGED':
            return {
                ...state,
                unitLibelle: action.payload,
            };
        case 'SUGGESTION_RECORD_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'SUGGESTION_RECORD_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'SUGGESTION_RECORD_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'SUGGESTION_RECORD_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
       
        case 'SUGGESTION_RECORD_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'SUGGESTION_RECORD_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        
        case 'SUGGESTION_RECORD_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'SUGGESTION_RECORD_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
       
        case 'SUGGESTION_RECORD_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'SUGGESTION_RECORD_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'SUGGESTION_RECORD_RESET':
            return {
                state: undefined
            };
        case 'SUGGESTION_RECORD_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'SUGGESTION_RECORD_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'SUGGESTION_RECORD_SELECTED_FILES_CHANGED':
            return {
                ...state,
                selectedFiles: [...state.selectedFiles, action.payload],
            };
        case 'SUGGESTION_RECORD_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'SUGGESTION_RECORD_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
        case 'SUGGESTION_RECORD_SHOW_SELECT_PRINT_ITEMS':
            return{
                ...state,
                showSelectPrintItem:!state.showSelectPrintItem
            }
        case 'SUGGESTION_RECORD_CREW_CHANGED':
            return {
                ...state,
                crew: action.payload,
            };
        case 'SUGGESTION_RECORD_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'SUGGESTION_RECORD_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        default:
            return state
    }
}

export default EnregistrementSuggestionReducer;