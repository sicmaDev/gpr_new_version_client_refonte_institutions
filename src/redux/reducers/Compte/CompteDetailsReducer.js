const initialState = {
    isLoading: false,
    compte_details_errors: {},
    id: "",
    firstname: "",
    etat: false,
    email: "",
    phone: "",
};

const CompteDetailsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'COMPTE_DETAILS_ERRORS':
            return {
                ...state,
                compte_details_errors: action.payload,
            };
        case 'ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'POSTE_CHANGED':
            return {
                ...state,
                poste: action.payload,
            };
        case 'FIRSTNAME_CHANGED':
            return {
                ...state,
                firstname: action.payload,
            };
        case 'LASTNAME_CHANGED':
            return {
                ...state,
                lastname: action.payload,
            };
        case 'COMPTE_EMAIL_CHANGED':
            return {
                ...state,
                email: action.payload,
            };
        case 'COMPTE_PHONE_CHANGED':
            return {
                ...state,
                phone: action.payload,
            };
        case 'ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        default:
            return state
    }
}

export default CompteDetailsReducer;