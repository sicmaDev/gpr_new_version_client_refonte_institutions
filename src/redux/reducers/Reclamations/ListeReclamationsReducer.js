const initialState = {
    isLoading: false,
    claim_list_errors: {},
    id: "",
    firstname: "",
    lastname: "",
    address: "",
    phone: "",
    gender: "",
    language: "",
    dossierimf: "",
    code: "",
    codeClient: "azerrty",
    recorded_at: "",
    collect: "",
    subject: "",
    underSubject: "",
    product: "",
    unit: "",
    content: "",
    solution: [],
    comment: "",
    status: "",
    motif: "",
    crew: "",
    session: "",
    created_at: "",
    created_at_online: "",
    created_by: "",
    assigned_at: "",
    assigned_by: "",
    handled_at: "",
    handled_by: "",
    approved_at: "",
    approved_by: "",
    appraised_at: "",
    appraised_by: "",
    appraisal: "",
    resolved_at: "",
    resolved_by: "",
    external_remedies: "",
    agents: [],
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    selectedItemAudio: [],
    showSelectPrintItem: false
};
const ListeReclamationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CLAIM_LIST_ERRORS':
            return {
                ...state,
                claim_list_errors: action.payload,
            };
        case 'CLAIM_LIST_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'CLAIM_LIST_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CLAIM_LIST_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'CLAIM_LIST_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'CLAIM_LIST_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'CLAIM_LIST_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'CLAIM_LIST_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'CLAIM_LIST_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'CLAIM_LIST_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'CLAIM_LIST_CODE_CLIENT_CHANGED':
            return {
                ...state,
                codeClient: action.payload,
            };
        case 'CLAIM_LIST_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'CLAIM_LIST_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'CLAIM_LIST_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'CLAIM_LIST_UNDERSUBJECT_CHANGED':
            return {
                ...state,
                underSubject: action.payload,
            };
        case 'CLAIM_LIST_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'CLAIM_LIST_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'CLAIM_LIST_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'CLAIM_LIST_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'CLAIM_LIST_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'CLAIM_LIST_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
        case 'CLAIM_LIST_MOTIF_CHANGED':
            return {
                ...state,
                motif: action.payload,
            };
        case 'CLAIM_LIST_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'CLAIM_LIST_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        case 'CLAIM_LIST_CREATED_AT_ONLINE_CHANGED':
            return {
                ...state,
                created_at_online: action.payload,
            };
        case 'CLAIM_LIST_ASSIGNED_BY_CHANGED':
            return {
                ...state,
                assigned_by: action.payload,
            };
        case 'CLAIM_LIST_ASSIGNED_AT_CHANGED':
            return {
                ...state,
                assigned_at: action.payload,
            };
        case 'CLAIM_LIST_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'CLAIM_LIST_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
        case 'CLAIM_LIST_APPROVED_BY_CHANGED':
            return {
                ...state,
                approved_by: action.payload,
            };
        case 'CLAIM_LIST_APPROVED_AT_CHANGED':
            return {
                ...state,
                approved_at: action.payload,
            };
        case 'CLAIM_LIST_APPRAISED_BY_CHANGED':
            return {
                ...state,
                appraised_by: action.payload,
            };
        case 'CLAIM_LIST_APPRAISED_AT_CHANGED':
            return {
                ...state,
                appraised_at: action.payload,
            };
        case 'CLAIM_LIST_APPRAISAL_CHANGED':
            return {
                ...state,
                appraisal: action.payload,
            };
        case 'CLAIM_LIST_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'CLAIM_LIST_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'CLAIM_LIST_RESET':
            return {
                state: undefined
            };
        case 'CLAIM_LIST_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CLAIM_LIST_AGENTS_CHANGED':
            return {
                ...state,
                agents: action.payload,
            };
        case 'CLAIM_LIST_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'CLAIM_LIST_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'CLAIM_LIST_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
        case "CLAIM_LIST_SELECTED_ITEM_AUDIO_CHANGED":
            return {
                ...state,
                selectedItemAudio: action.payload,
            };
        case 'CLAIM_LIST_EXTERNAL_REMEDIES_CHANGED':
            return {
                ...state,
                external_remedies: action.payload,
            };
        case 'CLAIM_LIST_SHOW_SELECT_PRINT_ITEMS':
            return {
                ...state,
                showSelectPrintItem: !state.showSelectPrintItem
            }
        case 'CLAIM_LIST_CREW_CHANGED':
            return {
                ...state,
                crew: action.payload,
            };
        case 'CLAIM_HANDLE_CONVERTED_AT_CHANGED':
            return {
                ...state,
                converted_at: action.payload,
            };
        case 'CLAIM_HANDLE_CONVERTED_BY_CHANGED':
            return {
                ...state,
                converted_by: action.payload,
            };
        case 'CLAIM_LIST_SESSION_CHANGED':
            return {
                ...state,
                session: action.payload,
            };
        case 'CLAIM_LIST_EXTRAS_CHANGED':
            return {
                ...state,
                extras: action.payload,
            };
        default:
            return state
    }
}

export default ListeReclamationsReducer;