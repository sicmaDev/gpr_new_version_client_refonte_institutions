const initialState = {
    apiKey: "",
    apiSecret: "",
    gprbotErrors: {},
    etat: false,
    etat1: false,
    qrcode: "GPR BOT"
}

const BotReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'API_KEY_CHANGED':
            return {
                ...state,
                apiKey: action.payload
            }
    
        case 'API_SECRET_CHANGED' :
            return {
                ...state,
                apiSecret: action.payload
            }
        case 'GPR_BOT_ERRORS' :
            return {
                ...state,
                gprbotErrors: action.payload
            }
        case 'GPR_BOT_ETAT' :
            return {
                ...state,
                etat: action.payload
            }
        case 'GPR_BOT_ETAT1' :
            return {
                ...state,
                etat1: action.payload
            }
        case 'GPR_BOT_QRCODE_ETAT' :
            return {
                ...state,
                qrcode: action.payload
            }
        default: 
            return state;
    }

}

export default BotReducer;