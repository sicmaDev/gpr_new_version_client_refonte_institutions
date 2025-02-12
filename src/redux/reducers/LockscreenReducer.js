const initialState = {
    isLocked:false,
    user:null,
    lastActivity:Date.now()
};

const LockscreenReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOCKED':
            return {
                ...state,
                isLocked: true
            };
        case 'UNLOCKED':
            return {
                ...state,
                isLocked: false
            };
        case 'SET_LAST_ACTIVITY':
            return {
                ...state,
                lastActivity: action.payload,
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
            };
        case 'SET_UNLOCKED':
            return {
                isLocked:false,
                user:null,
                lastActivity:Date.now()
            };
       
        case 'SET_LOCKED':
            return {
                ...state,
                isLocked:true,
                user:action.payload,
            };
       
        default:
            return state
    }
}

export default  LockscreenReducer;