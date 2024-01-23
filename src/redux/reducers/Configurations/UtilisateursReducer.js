const initialState = {
    isLoading: false,
    user_errors: {},
    id: "",
    name: "",
    poste: "",
    posteLibelle: "",
    unit: "",
    unitLibelle: "",
    email: "",
    phone: "",
    additionalRole: "",
    pass: "",
    pass_again: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const UtilisateursReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'USER_ERRORS':
            return {
                ...state,
                user_errors: action.payload,
            };
        case 'USER_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'USER_CODE_CHANGED':
            return {
                ...state,
                code: action.payload,
            };
        case 'USER_NAME_CHANGED':
            return {
                ...state,
                name: action.payload,
            };
      
        case 'USER_EMAIL_CHANGED':
            return {
                ...state,
                email: action.payload,
            };
        case 'USER_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'USER_POSTE_CHANGED':
            return {
                ...state,
                poste: action.payload,
            };
        case 'USER_POSTE_LIBELLE_CHANGED':
            return {
                ...state,
                posteLibelle: action.payload,
            };
        case 'USER_UNIT_CHANGED':
            return {
                ...state,
                unit: action.payload,
            };
        case 'USER_UNIT_LIBELLE_CHANGED':
            return {
                ...state,
                unitLibelle: action.payload,
            };
        case 'USER_ADDITIONAL_ROLE_CHANGED':
            return {
                ...state,
                additionalRole: action.payload,
            };
        
        case 'USER_PASS_CHANGED':
            return {
                ...state,
                pass: action.payload,
            };
        case 'USER_PASS_AGAIN_CHANGED':
            return {
                ...state,
                pass_again: action.payload,
            };
        case 'USER_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'USER_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'USER_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'USER_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'USER_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default UtilisateursReducer;