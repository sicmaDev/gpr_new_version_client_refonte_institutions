export const reset = () =>{
    return {
        
        type: 'SET_RESET',
        info: 'This action is locked the platform'
    }
};
export const setInboxs = (inboxs) =>{
    return {
        
        type: 'SET_INBOXS',
        payload:inboxs,
        info: 'This action is locked the platform'
    }
};
export const setCurrentInbox = (currentInbox) =>{
    return {
        
        type: 'SET_CURRENT_INBOX',
        payload:currentInbox,
        info: 'This action is locked the platform'
    }
};
export const resetSelectMessage = () =>{
    return {
        type: 'RESET_SELECT_MESSAGE',
        info: 'This action is locked the platform'
    }
};
export const addSelectMessage = (message) =>{
    return { 
        type: 'ADD_SELECT_MESSAGE',
        payload:message,
        info: 'This action is locked the platform'
    }
};

export const removeSelectMessage = (message) =>{
    return { 
        type: 'REMOVE_SELECT_MESSAGE',
        payload:message ?? 0 ,
        info: 'This action is locked the platform'
    }
};


export const setShowAside = (action) =>{
    return {
        type: 'SET_SHOW_ASIDE',
        payload:action,
        info: 'This action is locked the platform'
    }
};
export const toggleShowAside = () =>{
    return {
        type: 'SET_TOGGLE_SHOW_ASIDE',
        info: 'This action is locked the platform'
    }
};
export const setIsLoading = (action) =>{
    return {
        type: 'SET_IS_LOADING',
        payload:action,
        info: 'This action is locked the platform'
    }
};
export const toggleIsLoading = () =>{
    return {
        type: 'SET_TOGGLE_IS_LOADING',
        info: 'This action is locked the platform'
    }
};
export const setStartConvert = (convert) =>{
   
    return {
        type: 'SET_START_CONVERT',
        payload:convert,
        info: 'This action is locked the platform'
    }
};
export const newConvert = () =>{
    return {
        type: 'START_CONVERT',
        info: 'This action is locked the platform'
    }
};
export const resetConvert = () =>{
    return {
        type: 'END_CONVERT',
        info: 'This action is locked the platform'
    }
};
export const setMessageIsLoading = (action) =>{
    return {
        type: 'SET_MESSAGES_IS_LOADING',
        payload:action,
        info: 'This action is locked the platform'
    }
};
export const toggleMessageIsLoading = () =>{
    return {
        type: 'SET_TOGGLE_MESSAGES_IS_LOADING',
        info: 'This action is locked the platform'
    }
};
export const isOK = (message) =>{
    return {
        type: 'IS_SUCCESS',
        payload:message,
        info: 'This action is locked the platform'
    }
};
export const isFail = (message) =>{
    return {
        type: 'IS_ERROR',
        payload:message,
        info: 'This action is locked the platform'
    }
};
export const setMessage = (message) =>{
    return {
        type: 'SET_MESSAGE',
        payload:message,
        info: 'This action is locked the platform'
    }
};
export const setShowMessage = (showMessage) =>{
    return {
        type: 'SET_SHOW_MESSAGE',
        payload:showMessage,
        info: 'This action is locked the platform'
    }
};



