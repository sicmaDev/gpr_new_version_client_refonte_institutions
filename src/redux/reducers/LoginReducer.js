const initialState = {
    isLoading: false,
    login_errors: {},
    email: "",
    pass: "",
    etat:false,
};

const LoginReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'LOGIN_ERRORS':
            return {
                ...state,
                login_errors: action.payload,
            };
        case 'EMAIL_CHANGED':
            return {
                ...state,
                email: action.payload,
            };
        case 'PASS_CHANGED':
            return {
                ...state,
                pass: action.payload,
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

export default LoginReducer;