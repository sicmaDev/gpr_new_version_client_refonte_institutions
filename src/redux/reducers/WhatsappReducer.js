const initialState = {
    inboxs: [],
    currentInbox: null,
    selectMessage: [],
    showAside: false,
    isLoading: false,
    startConvert: false,
    messagesIsLoading: false,
    isSuccess: false,
    message: "",
    messages: [],
    showMessage: false,

};

const WhatsappReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_RESET':
            return {
                inboxs: [],
                currentInbox: null,
                selectMessage: [],
                showAside: false,
                isLoading: false,
                startConvert: false,
                messagesIsLoading: false,
                isSuccess: false,
                message: "",
                messages: [],
                showMessage: false,
            };
        case 'SET_INBOXS':
            return {
                ...state,
                inboxs: action.payload
            };
        case 'SET_CURRENT_INBOX':
            return {
                ...state,
                currentInbox: action.payload,
                messages: action.payload?.messages ?? [],
                messagesIsLoading: false,
            };
        case 'RESET_SELECT_MESSAGE':
            return {
                ...state,
                selectMessage: []
            };
        case 'ADD_SELECT_MESSAGE':

            return {
                ...state,
                selectMessage: [...state.selectMessage, action.payload]
            };
        case 'REMOVE_SELECT_MESSAGE':
            return {
                ...state,
                selectMessage: state.selectMessage.filter((data) => (data !== action.payload))
            };
        case 'SET_SHOW_ASIDE':
            return {
                ...state,
                showAside: action.payload
            };
        case 'SET_TOGGLE_SHOW_ASIDE':
            return {
                ...state,
                isLoading: !state.showAside
            };
        case 'SET_IS_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };
        case 'SET_TOGGLE_IS_LOADING':
            return {
                ...state,
                isLoading: !state.isLoading
            };
        case 'SET_START_CONVERT':
            return {
                ...state,
                startConvert: action.payload,
                selectMessage: []

            };
        case 'START_CONVERT':
            return {
                ...state,
                startConvert: true,
                selectMessage: []
            };
        case 'END_CONVERT':
            return {
                ...state,
                startConvert: false,
                selectMessage: []
            };

        case 'SET_MESSAGES_IS_LOADING':
            return {
                ...state,
                messagesIsLoading: action.payload
            };
        case 'SET_TOGGLE_MESSAGES_IS_LOADING':
            return {
                ...state,
                messagesIsLoading: !state.messagesIsLoading
            };
        case 'IS_SUCCESS':
            return {
                ...state,
                isSuccess: true,
                isLoading: false,
                message: action.payload,
                showMessage: true
            };
        case 'IS_ERROR':
            return {
                ...state,
                isSuccess: false,
                isLoading: false,
                message: action.payload,
                showMessage: true,
                inboxs: [],
            };
        case 'SET_MESSAGE':
            return {
                ...state,
                message: action.payload
            };
        case 'SET_SHOW_MESSAGE':
            return {
                ...state,
                showMessage: action.payload
            };


        default:
            return state
    }
}

export default WhatsappReducer;