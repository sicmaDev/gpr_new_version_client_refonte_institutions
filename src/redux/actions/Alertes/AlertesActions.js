export const loading = () => {
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};

export const itemsChanged = (items) =>{
    return {
        type: 'ALERT_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};