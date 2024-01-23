const initialState = {
    isLoading: false,
    claim_handle_errors: {},
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
    objetLevel: "",
    product: "",
    unit: "",
    etat: false,
    etat2: false,
    etat3: false,
    etat4: false,
    crew: "",
    content: "",
    solution: "",
    solutionId: "",
    comment: "",
    new_solution: "",
    new_comment: "",
    status: "",
    motif: "",
    created_at: "",
    created_by: "",
    assigned_by: "",
    assignedAt: "",
    handled_at: "",
    handled_by: "",
    resolved_at: "",
    resolved_by: "",
    authorize:true,
    agents: [],
    items: [],
    selectedItem: {},
    selectedFiles: [],
    selectedItemFiles: [],
    selectedItemAudio: [],
    anonymat: "",
    session: [],
    solutionExistant: "",
};
const TraitementReclamationReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CLAIM_HANDLE_ERRORS':
            return {
                ...state,
                claim_handle_errors: action.payload,
            };
        case 'CLAIM_HANDLE_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'CLAIM_HANDLE_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CLAIM_HANDLE_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'CLAIM_HANDLE_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'CLAIM_HANDLE_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'CLAIM_HANDLE_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'CLAIM_HANDLE_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'CLAIM_HANDLE_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'CLAIM_HANDLE_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'CLAIM_HANDLE_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'CLAIM_HANDLE_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'CLAIM_HANDLE_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'CLAIM_HANDLE_UNDERSUBJECT_CHANGED':
            return {
                ...state,
                underSubject: action.payload,
            };
        case 'CLAIM_HANDLE_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'CLAIM_HANDLE_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'CLAIM_HANDLE_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'CLAIM_HANDLE_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'CLAIM_HANDLE_SOLUTION_ID_CHANGED':
            return {
                ...state,
                solutionId: action.payload,
            };
        case 'CLAIM_HANDLE_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'CLAIM_HANDLE_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
        case 'CLAIM_HANDLE_MOTIF_CHANGED':
            return {
                ...state,
                motif: action.payload,
            };
        case 'CLAIM_HANDLE_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'CLAIM_HANDLE_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        case 'CLAIM_HANDLE_ASSIGNED_BY_CHANGED':
            return {
                ...state,
                assigned_by: action.payload,
            };
        case 'CLAIM_HANDLE_ASSIGNED_AT_CHANGED':
            return {
                ...state,
                assignedAt: action.payload,
            };
        case 'CLAIM_HANDLE_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'CLAIM_HANDLE_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
        case 'CLAIM_HANDLE_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'CLAIM_HANDLE_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'CLAIM_HANDLE_RESET':
            return {
                state: undefined
            };
        case 'CLAIM_HANDLE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CLAIM_HANDLE_AGENTS_CHANGED':
            return {
                ...state,
                agents: action.payload,
            };
        case 'CLAIM_HANDLE_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'CLAIM_HANDLE_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'CLAIM_HANDLE_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
            case "CLAIM_HANDLE_SELECTED_ITEM_AUDIO_CHANGED":
                return {
                  ...state,
                  selectedItemAudio: action.payload,
                };
        case 'CLAIM_HANDLE_AUTHORIZE':
            return{
                ...state,
                authorize:action.payload
            }
        case 'CLAIM_HANDLE_CREW_CHANGED':
            return {
                ...state,
                crew: action.payload,
            };
        case 'CLAIM_HANDLE_OBJET_LEVEL_CHANGED':
            return {
                ...state,
                objetLevel: action.payload,
            };
        case 'CLAIM_HANDLE_NEW_SOLUTION_CHANGED':
            return {
                ...state,
                new_solution: action.payload,
            };
        case 'CLAIM_HANDLE_NEW_COMMENT_CHANGED':
            return {
                ...state,
                new_comment: action.payload,
            };
        case 'CLAIM_HANDLE_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'CLAIM_HANDLE_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'CLAIM_HANDLE_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        case 'CLAIM_HANDLE_ETAT4_CHANGED':
            return {
                ...state,
                etat4: action.payload,
            };
        case 'CLAIM_HANDLE_ANONYMAT_CHANGED':
            return {
                ...state,
                anonymat: action.payload,
            };
        case 'CLAIM_HANDLE_SESSION_CHANGED':
            return {
                ...state,
                session: action.payload,
            };
        case 'CLAIM_HANDLE_SOLUTION_EXISTANT_CHANGED':
            return {
                ...state,
                solutionExistant: action.payload,
            };
        default:
            return state
    }
}

export default TraitementReclamationReducer;