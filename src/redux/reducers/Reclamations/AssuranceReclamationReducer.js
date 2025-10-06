const initialState = {
    isLoading: false,
    claim_assurance_errors: {},
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
    collect: "",
    subject: "",
    underSubject: "",
    product: "",
    unit: "",
    content: "",
    solution: "",
    comment: "",
    new_solution: "",
    new_comment: "",
    status: "",
    motif: "",
    created_at: "",
    created_by: "",
    assigned_by: "",
    handled_at: "",
    handled_by: "",
    appraised_at: "",
    appraised_by: "",
    appraisal: "",
    resolved_at: "",
    resolved_by: "",
    etat: false,
    etat2: false,
    etat3: false,
    external_remedies: "",
    authorize:true,
    agents: [],
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    selectedItemAudio: [],
};
const AssuranceReclamationReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CLAIM_ASSURANCE_ERRORS':
            return {
                ...state,
                claim_assurance_errors: action.payload,
            };
        case 'CLAIM_ASSURANCE_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'CLAIM_ASSURANCE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CLAIM_ASSURANCE_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'CLAIM_ASSURANCE_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'CLAIM_ASSURANCE_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'CLAIM_ASSURANCE_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'CLAIM_ASSURANCE_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'CLAIM_ASSURANCE_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'CLAIM_ASSURANCE_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'CLAIM_ASSURANCE_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'CLAIM_ASSURANCE_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'CLAIM_ASSURANCE_UNDERSUBJECT_CHANGED':
            return {
                ...state,
                underSubject: action.payload,
            };
        case 'CLAIM_ASSURANCE_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'CLAIM_ASSURANCE_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'CLAIM_ASSURANCE_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'CLAIM_ASSURANCE_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'CLAIM_ASSURANCE_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'CLAIM_ASSURANCE_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'CLAIM_ASSURANCE_NEW_SOLUTION_CHANGED':
            return {
                ...state,
                new_solution: action.payload,
            };
        case 'CLAIM_ASSURANCE_NEW_COMMENT_CHANGED':
            return {
                ...state,
                new_comment: action.payload,
            };
        case 'CLAIM_ASSURANCE_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
        case 'CLAIM_ASSURANCE_MOTIF_CHANGED':
            return {
                ...state,
                motif: action.payload,
            };
        case 'CLAIM_ASSURANCE_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'CLAIM_ASSURANCE_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        case 'CLAIM_ASSURANCE_ASSIGNED_BY_CHANGED':
            return {
                ...state,
                assigned_by: action.payload,
            };
        case 'CLAIM_ASSURANCE_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'CLAIM_ASSURANCE_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
        case 'CLAIM_ASSURANCE_APPRAISED_BY_CHANGED':
            return {
                ...state,
                appraised_by: action.payload,
            };
        case 'CLAIM_ASSURANCE_APPRAISED_AT_CHANGED':
            return {
                ...state,
                appraised_at: action.payload,
            };
        case 'CLAIM_ASSURANCE_APPRAISAL_CHANGED':
            return {
                ...state,
                appraisal: action.payload,
            };
        case 'CLAIM_ASSURANCE_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'CLAIM_ASSURANCE_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'CLAIM_ASSURANCE_RESET':
            return {
                state: undefined
            };
        case 'CLAIM_ASSURANCE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CLAIM_ASSURANCE_AGENTS_CHANGED':
            return {
                ...state,
                agents: action.payload,
            };
        case 'CLAIM_ASSURANCE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'CLAIM_ASSURANCE_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'CLAIM_ASSURANCE_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
        case "CLAIM_ASSURANCE_SELECTED_ITEM_AUDIO_CHANGED":
            return {
                ...state,
                selectedItemAudio: action.payload,
            };
        case 'CLAIM_ASSURANCE_AUTHORIZE':
            return {
                ...state,
                authorize: action.payload,
            };
        case 'CLAIM_ASSURANCE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'CLAIM_ASSURANCE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'CLAIM_ASSURANCE_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        case 'CLAIM_LIST_EXTERNAL_REMEDIES_CHANGED':
            return {
                ...state,
                external_remedies: action.payload,
            };
        case 'CLAIM_ASSURANCE_EXTRAS_CHANGED':
            return {
                ...state,
                extras: action.payload,
            };
        case 'CLAIM_ASSURANCE_CODE_CLIENT_CHANGED':
            return {
                ...state,
                codeClient: action.payload,
            };
        default:
            return state
    }
}

export default AssuranceReclamationReducer;