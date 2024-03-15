const initialState = {
    isLoading: false,
    institution_errors: {},
    id: "",
    denomination: "",
    reference: "",
    address: "",
    email: "",
    phone: "",
    pays: "",
    paysCode: "",
    logo: null,
    etat: false,
};

const InstitutionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'INSTITUTION_ERRORS':
            return {
                ...state,
                institution_errors: action.payload,
            };
        case 'INSTITUTION_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'DENOMINATION_CHANGED':
            return {
                ...state,
                denomination: action.payload,
            };
        case 'REFERENCE_CHANGED':
            return {
                ...state,
                reference: action.payload,
            };
        case 'ADDRESS_CHANGED':
            return {
                ...state,
                address: action.payload,
            };
        case 'INSTITUTION_EMAIL_CHANGED':
            return {
                ...state,
                email: action.payload,
            };
        case 'INSTITUTION_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'INSTITUTION_PAYS_CHANGED':
            return {
                ...state,
                pays: action.payload,
            };
        case 'INSTITUTION_PAYS_CODE_CHANGED':
            return {
                ...state,
                paysCode: action.payload,
            };
        case 'LOGO_CHANGED':
            return {
                ...state,
                logo: action.payload,
            };
        case 'INSTITUTION_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        default:
            return state
    }
}

export default InstitutionReducer;