const initialState = {
    isLoading: false,
    id: "",
    change_password_errors: {},
    current_pass: "",
    new_pass: "",
    new_pass_again: "",
    etat: false,
};

const ChangePasswordReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'CHANGE_PASSWORD_ERRORS':
            return {
                ...state,
                change_password_errors: action.payload,
            };
        case 'ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'CURRENT_PASS_CHANGED':
            return {
                ...state,
                current_pass: action.payload,
            };
        case 'NEW_PASS_CHANGED':
            return {
                ...state,
                new_pass: action.payload,
            };
        case 'NEW_PASS_AGAIN_CHANGED':
            return {
                ...state,
                new_pass_again: action.payload,
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

export default ChangePasswordReducer;