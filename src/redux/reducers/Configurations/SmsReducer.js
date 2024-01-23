const initialState = {
    url: "",
    loading: false,
    etat: false,
    libelleId: "",
    valueId: "",
    libellePwd: "",
    valuePwd: "",
    libelleSender: "",
    valueSender: "",
    libelleReceiver: "",
    libelleMessage: ""
}
const SmsReducer = (state = initialState, action) => {

    switch (action.type) {
        case "URL_CHANGED":
            return {
                ...state,
                url: action.payload
            }
        case "LIBELLE_ID_CHANGED":
            return {
                ...state,
                libelleId: action.payload
            }
        case "VALUE_ID_CHANGED":
            return {
                ...state,
                valueId: action.payload
            }
        case "LIBELLE_PWD_CHANGED":
            return {
                ...state,
                libellePwd: action.payload
            }
        case "VALUE_PWD_CHANGED":
            return {
                ...state,
                valuePwd: action.payload
            }
        case "LIBELLE_SENDER_CHANGED":
            return {
                ...state,
                libelleSender: action.payload
            }
        case "VALUE_SENDER_CHANGED":
            return {
                ...state,
                valueSender: action.payload
            }
        case "LIBELLE_RECEIVER_CHANGED":
            return {
                ...state,
                libelleReceiver: action.payload
            }
        case "LIBELLE_MESSAGE_CHANGED":
            return {
                ...state,
                libelleMessage: action.payload
            }
        case "SMS_LOADING_CHANGED":
            return {
                ...state,
                loading: !state.loading
            }
        case "SMS_ETAT_CHANGED":
            return {
                ...state,
                etat: !state.etat
            }
        case "SMS_ERRORS":
            return {
                ...state,
                errors: action.payload
            }
        default:
            return state;

    }

}

export default SmsReducer;