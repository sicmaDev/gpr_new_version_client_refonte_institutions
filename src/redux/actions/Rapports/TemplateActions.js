export const isLoadingChanged = (isLoading) =>{

    return {
        type: 'RAPPORTS_TEMPLATE_IS_LOADING',
        payload: isLoading,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const stateChanged = (data) =>{
 
    return {
        type: 'RAPPORTS_TEMPLATE_SET_STATE',
        payload: data,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const showLoadingChange = () =>{

    return {
        type: 'RAPPORTS_TEMPLATE_SHOW_LOADING',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const hideLoadingChange = () =>{

    return {
        type: 'RAPPORTS_TEMPLATE_HIDE_LOADING',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const showMessageChange = () =>{

    return {
        type: 'RAPPORTS_TEMPLATE_SHOW_MESSAGE',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const hideMessageChange = () =>{

    return {
        type: 'RAPPORTS_TEMPLATE_HIDE_MESSAGE',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const isSuccessChanged = () =>{
    return {
        type: 'RAPPORTS_TEMPLATE_IS_SUCCESS',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const isErrorChanged = () =>{
    return {
        type: 'RAPPORTS_TEMPLATE_IS_ERROR',
        payload: null,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const messageChanged = (message) =>{
    return {
        type: 'RAPPORTS_TEMPLATE_SET_MESSAGE',
        payload: message,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'RAPPORTS_TEMPLATE_SET_ITEMS',
        payload: items,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const currentChanged = (current) =>{
    return {
        type: 'RAPPORTS_TEMPLATE_SET_CURRENT',
        payload: current,
        info: 'This action is used to wait while loading data into the platform'
    }
};

export default {stateChanged,currentChanged}
