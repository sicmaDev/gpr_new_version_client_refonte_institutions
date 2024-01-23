const initialState = {
    isLoading: false,
    notification_errors: {},
    id: "",
    emails: "",
    emailsLibelle: "",
    role:"",
    roleLibelle:"",
    items: [],
    items2: [],
    etat: false,
    etat2: false,
    etat3: false,
};

const NotificationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'NOTIFICATION_ERRORS':
            return {
                ...state,
                notification_errors: action.payload,
            };
        case 'NOTIFICATION_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'NOTIFICATION_EMAILS_CHANGED':
            return {
                ...state,
                emails: action.payload,
            };
        case 'NOTIFICATION_LIBELLE_EMAILS_CHANGED':
            return {
                ...state,
                emailsLibelle: action.payload,
            };
        case 'NOTIFICATION_ROLE_CHANGED':
            return {
                ...state,
                role: action.payload,
            };
        case 'NOTIFICATION_ROLE_LIBELLE_CHANGED':
            return {
                ...state,
                roleLibelle: action.payload,
            };
        case 'NOTIFICATION_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'NOTIFICATION_ITEMS2_CHANGED':
            return {
                ...state,
                items2: action.payload,
            };
        case 'NOTIFICATION_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'NOTIFICATION_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'NOTIFICATION_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
          
        default:
            return state
    }
}

export default NotificationsReducer;