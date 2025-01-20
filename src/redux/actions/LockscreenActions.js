export const locked = () =>{
    return {
        type: 'LOCKED',
        info: 'This action is locked the platform'
    }
};
export const unlocked = () =>{
    return {
        type: 'UNLOCKED',
        info: 'This action is locked the platform'
    }
};
export const setLocked = (user) =>{
    return {
        type: 'SET_LOCKED',
        payload:user,
        info: 'This action is locked the platform'
    }
};
export const setUnlocked = () =>{
    return {
        type: 'SET_UNLOCKED',
        info: 'This action is locked the platform'
    }
};
export const setLastActivity = (lastActivity) =>{
    return {
        type: 'SET_LAST_ACTIVITY',
        payload: lastActivity,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const setUser = (user) =>{
    return {
        type: 'SET_USER',
        payload: user,
        info: 'This action is used to ...'
    }
};
