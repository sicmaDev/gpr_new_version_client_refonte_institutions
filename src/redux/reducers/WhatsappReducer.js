// Persistance de la conversation WhatsApp en cours de conversion (numéro + messages
// sélectionnés) dans le sessionStorage — pour qu'un rafraîchissement de page (F5) entre le
// clic sur "Convertir" et l'arrivée sur le formulaire ne fasse pas perdre la sélection.
// Seuls currentInbox/selectMessage sont concernés : le reste (inboxs, messages, flags UI...)
// n'a pas besoin de survivre à un refresh.
const PERSIST_KEY = 'wgpr_currentConversion';

const loadPersistedConversion = () => {
    try {
        const raw = sessionStorage.getItem(PERSIST_KEY);
        if (!raw) return { currentInbox: null, selectMessage: [] };
        const parsed = JSON.parse(raw);
        return {
            currentInbox: parsed.currentInbox ?? null,
            selectMessage: parsed.selectMessage ?? [],
        };
    } catch {
        return { currentInbox: null, selectMessage: [] };
    }
};

const savePersistedConversion = (currentInbox, selectMessage) => {
    try {
        sessionStorage.setItem(PERSIST_KEY, JSON.stringify({ currentInbox, selectMessage }));
    } catch {
        // sessionStorage indisponible (navigation privée, quota...) - la persistance est un
        // confort, pas une garantie : on continue silencieusement sans elle.
    }
};

const clearPersistedConversion = () => {
    try { sessionStorage.removeItem(PERSIST_KEY); } catch { }
};

const initialState = {
    inboxs: [],
    ...loadPersistedConversion(),
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
            clearPersistedConversion();
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
            savePersistedConversion(action.payload, state.selectMessage);
            return {
                ...state,
                currentInbox: action.payload,
                messages: action.payload?.messages ?? [],
                messagesIsLoading: false,
            };
        case 'RESET_SELECT_MESSAGE':
            savePersistedConversion(state.currentInbox, []);
            return {
                ...state,
                selectMessage: []
            };
        case 'ADD_SELECT_MESSAGE': {

            const selectMessage = [...state.selectMessage, action.payload];
            savePersistedConversion(state.currentInbox, selectMessage);
            return {
                ...state,
                selectMessage
            };
        }
        case 'REMOVE_SELECT_MESSAGE': {
            const selectMessage = state.selectMessage.filter((data) => (data !== action.payload));
            savePersistedConversion(state.currentInbox, selectMessage);
            return {
                ...state,
                selectMessage
            };
        }
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
            savePersistedConversion(state.currentInbox, []);
            return {
                ...state,
                startConvert: action.payload,
                selectMessage: []

            };
        case 'START_CONVERT':
            savePersistedConversion(state.currentInbox, []);
            return {
                ...state,
                startConvert: true,
                selectMessage: []
            };
        case 'END_CONVERT':
            clearPersistedConversion();
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
