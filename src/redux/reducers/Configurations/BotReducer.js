const initialState = {
    apiKey: "",
    apiSecret: "",
    gprbotErrors: {},
    etat: false
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
        default: 
            return state;
    }

}

export default BotReducer;