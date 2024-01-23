const initialState = {
    isLoading: false,
    suggestions_list_errors: {},
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
    showSelectPrintItem : false
};
const ListeSuggestionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'SUGGESTION_LIST_ERRORS':
            return {
                ...state,
                suggestions_list_errors: action.payload,
            };
        case 'SUGGESTION_LIST_FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'SUGGESTION_LIST_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'SUGGESTION_LIST_LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'SUGGESTION_LIST_ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'SUGGESTION_LIST_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'SUGGESTION_LIST_GENDER_CHANGED':
            return {
                ...state,
                gender: action.payload,
            };
        case 'SUGGESTION_LIST_LANGUAGE_CHANGED':
            return {
                ...state,
                language: action.payload,
            };
        case 'SUGGESTION_LIST_DOSSIERIMF_CHANGED':
            return {
                ...state,
                dossierimf: action.payload,
            };
        case 'SUGGESTION_LIST_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'SUGGESTION_LIST_RECORDED_AT_CHANGED':
            return {
                ...state,
                recorded_at: action.payload,
            };
        case 'SUGGESTION_LIST_COLLECT_CHANGED':
            return {
                ...state,
                collect: action.payload,
            };
        case 'SUGGESTION_LIST_SUBJECT_CHANGED':
            return {
                ...state,
                subject: action.payload,
            };
        case 'SUGGESTION_LIST_PRODUCT_CHANGED':
            return {
                ...state,
                product: action.payload,
            };
        case 'SUGGESTION_LIST_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'SUGGESTION_LIST_CONTENT_CHANGED':
            return {
                ...state,
                content: action.payload,
            };
        case 'SUGGESTION_LIST_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'SUGGESTION_LIST_COMMENT_CHANGED':
            return {
                ...state,
                comment: action.payload,
            };
        case 'SUGGESTION_LIST_STATUS_CHANGED':
            return {
                ...state,
                status: action.payload,
            };
       
        case 'SUGGESTION_LIST_CREATED_BY_CHANGED':
            return {
                ...state,
                created_by: action.payload,
            };
        case 'SUGGESTION_LIST_CREATED_AT_CHANGED':
            return {
                ...state,
                created_at: action.payload,
            };
        
        case 'SUGGESTION_LIST_HANDLED_BY_CHANGED':
            return {
                ...state,
                handled_by: action.payload,
            };
        case 'SUGGESTION_LIST_HANDLED_AT_CHANGED':
            return {
                ...state,
                handled_at: action.payload,
            };
       
        case 'SUGGESTION_LIST_RESOLVED_BY_CHANGED':
            return {
                ...state,
                resolved_by: action.payload,
            };
        case 'SUGGESTION_LIST_RESOLVED_AT_CHANGED':
            return {
                ...state,
                resolved_at: action.payload,
            };
        case 'SUGGESTION_LIST_RESET':
            return {
                state: undefined
            };
        case 'SUGGESTION_LIST_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'SUGGESTION_LIST_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'SUGGESTION_LIST_SELECTED_FILES_RESET':
            return {
                ...state,
                selectedFiles: action.payload,
            };
        case 'SUGGESTION_LIST_SELECTED_ITEM_FILES_CHANGED':
            return {
                ...state,
                selectedItemFiles: action.payload,
            };
        case 'SUGGESTION_LIST_SHOW_SELECT_PRINT_ITEMS':
            return{
                ...state,
                showSelectPrintItem:!state.showSelectPrintItem
            }
        case 'SUGGESTION_LIST_CREW_CHANGED':
            return {
                ...state,
                crew: action.payload,
            };
        default:
            return state
    }
}

export default ListeSuggestionsReducer;