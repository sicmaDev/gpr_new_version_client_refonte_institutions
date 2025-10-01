const initialState = {
    isLoading: false,
    claim_appraise_errors: {},
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
    solutionId: "",
    comment: "",
    commenta: "",
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
    etat: false,
    etat2: false,
    resolved_at: "",
    resolved_by: "",
    authorize:true,
    agents: [],
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    selectedItemAudio: [],
};
const MesurerReclamationReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CLAIM_APPRAISE_ERRORS':
            return {
                ...state,
                claim_appraise_errors: action.payload,
            };
        case 'CLAIM_APPRAISE_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'CLAIM_APPRAISE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CLAIM_APPRAISE_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'CLAIM_APPRAISE_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'CLAIM_APPRAISE_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'CLAIM_APPRAISE_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'CLAIM_APPRAISE_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'CLAIM_APPRAISE_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'CLAIM_APPRAISE_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'CLAIM_APPRAISE_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'CLAIM_APPRAISE_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'CLAIM_APPRAISE_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'CLAIM_APPRAISE_UNDERSUBJECT_CHANGED':
            return {
                ...state,
                underSubject: action.payload,
            };
        case 'CLAIM_APPRAISE_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'CLAIM_APPRAISE_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'CLAIM_APPRAISE_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'CLAIM_APPRAISE_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'CLAIM_APPRAISE_SOLUTION_ID_CHANGED':
            return {
                ...state,
                solutionId: action.payload,
            };
        case 'CLAIM_APPRAISE_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'CLAIM_APPRAISE_COMMENTA_CHANGED':
            return {
                ...state,
                commenta: action.payload,
            };
        case 'CLAIM_APPRAISE_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
        case 'CLAIM_APPRAISE_MOTIF_CHANGED':
            return {
                ...state,
                motif: action.payload,
            };
        case 'CLAIM_APPRAISE_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'CLAIM_APPRAISE_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        case 'CLAIM_APPRAISE_ASSIGNED_BY_CHANGED':
            return {
                ...state,
                assigned_by: action.payload,
            };
        case 'CLAIM_APPRAISE_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'CLAIM_APPRAISE_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
        case 'CLAIM_APPRAISE_APPRAISED_BY_CHANGED':
            return {
                ...state,
                appraised_by: action.payload,
            };
        case 'CLAIM_APPRAISE_APPRAISED_AT_CHANGED':
            return {
                ...state,
                appraised_at: action.payload,
            };
        case 'CLAIM_APPRAISE_APPRAISAL_CHANGED':
            return {
                ...state,
                appraisal: action.payload,
            };
        case 'CLAIM_APPRAISE_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'CLAIM_APPRAISE_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'CLAIM_APPRAISE_RESET':
            return {
                state: undefined
            };
        case 'CLAIM_APPRAISE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CLAIM_APPRAISE_AGENTS_CHANGED':
            return {
                ...state,
                agents: action.payload,
            };
        case 'CLAIM_APPRAISE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'CLAIM_APPRAISE_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'CLAIM_APPRAISE_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
            case "CLAIM_APPRAISE_SELECTED_ITEM_AUDIO_CHANGED":
                return {
                  ...state,
                  selectedItemAudio: action.payload,
                };
        case 'CLAIM_APPRAISE_AUTHORIZE':
            return {
                ...state,
                authorize: action.payload,
            };
        case 'CLAIM_APPRAISE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'CLAIM_APPRAISE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'CLAIM_APPRAISE_EXTRAS_CHANGED':
            return {
                ...state,
                extras: action.payload,
            };
        default:
            return state
    }
}

export default MesurerReclamationReducer;