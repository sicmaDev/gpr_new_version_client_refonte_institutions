const initialState = {
    host: "",
    port: "",
    user: "",
    password: "",
    loading: false,
    etat: false,

}
const EmailReducer = (state = initialState, action) => {

    switch (action.type) {
        case "MAIL_HOST_CHANGED":
            return {
                ...state,
                host: action.payload
            }
        case "MAIL_PORT_CHANGED":
            return {
                ...state,
                port: action.payload
            }
        case "MAIL_USER_CHANGED":
            return {
                ...state,
                user: action.payload
            }
        case "MAIL_PASSWORD_CHANGED":
            return {
                ...state,
                password: action.payload
            }
        case "MAIL_LOADING_CHANGED":
            return {
                ...state,
                loading: !state.loading
            }
        case "MAIL_ETAT_CHANGED":
            return {
                ...state,
                etat: !state.etat
            }
        default:
            return state;

    }

}

export default EmailReducer;