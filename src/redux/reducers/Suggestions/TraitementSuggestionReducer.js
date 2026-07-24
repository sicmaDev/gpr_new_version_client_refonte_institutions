const initialState = {
    isLoading: false,
    suggestions_handle_errors: {},
    id: "",
    firstname: "",
    lastname: "",
    address: "",
    phone: "",
    gender: "",
    email: "",
    language: "",
    dossierimf: "",
    code: "",
    etat: false,
    etat2: false,
    recorded_at: "",
    collect: "",
    subject: "",
    product: "",
    unit: "",
    content: "",
    solution: [],
    comment: "",
    status: "",
    crew: "",
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
    selectedItemAudio: [],
    showSelectPrintItem: false,
    converted_by: "",
    converted_at: "",
};
const TraitementSuggestionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'SUGGESTION_HANDLE_ERRORS':
            return {
                ...state,
                suggestions_handle_errors: action.payload,
            };
        case 'SUGGESTION_HANDLE_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'SUGGESTION_HANDLE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'SUGGESTION_HANDLE_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'SUGGESTION_HANDLE_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'SUGGESTION_HANDLE_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'SUGGESTION_HANDLE_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'SUGGESTION_HANDLE_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'SUGGESTION_HANDLE_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'SUGGESTION_HANDLE_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'SUGGESTION_HANDLE_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'SUGGESTION_HANDLE_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'SUGGESTION_HANDLE_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'SUGGESTION_HANDLE_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'SUGGESTION_HANDLE_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'SUGGESTION_HANDLE_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'SUGGESTION_HANDLE_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'SUGGESTION_HANDLE_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'SUGGESTION_HANDLE_EMAIL_CHANGED':
            return {
                ...state,
                email: action.payload,
            };
        case 'SUGGESTION_HANDLE_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };

        case 'SUGGESTION_HANDLE_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'SUGGESTION_HANDLE_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };

        case 'SUGGESTION_HANDLE_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'SUGGESTION_HANDLE_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };

        case 'SUGGESTION_HANDLE_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'SUGGESTION_HANDLE_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'SUGGESTION_HANDLE_RESET':
            return {
                state: undefined
            };
        case 'SUGGESTION_HANDLE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'SUGGESTION_HANDLE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'SUGGESTION_HANDLE_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'SUGGESTION_HANDLE_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };

        case 'SUGGESTION_HANDLE_SELECTED_ITEM_AUDIO_CHANGED':
            return {
                ...state,
                selectedItemAudio: action.payload,
            };
        case 'SUGGESTION_HANDLE_SHOW_SELECT_PRINT_ITEMS':
            return {
                ...state,
                showSelectPrintItem: !state.showSelectPrintItem
            }
        case 'SUGGESTION_HANDLE_CREW_CHANGED':
            return {
                ...state,
                crew: action.payload,
            };
        case 'SUGGESTION_HANDLE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'SUGGESTION_HANDLE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'SUGGESTION_HANDLE_CONVERTED_AT_CHANGED':
            return {
                ...state,
                converted_at: action.payload,
            };
        case 'SUGGESTION_HANDLE_CONVERTED_BY_CHANGED':
            return {
                ...state,
                converted_by: action.payload,
            };
        case 'SUGGESTION_HANDLE_EXTRAS_CHANGED':
            return {
                ...state,
                extras: action.payload,
            };
        case 'SUGGESTION_HANDLE_CODE_CLIENT_CHANGED':
            return {
                ...state,
                codeClient: action.payload,
            };
        default:
            return state
    }
}

export default TraitementSuggestionReducer;