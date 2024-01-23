export const helpChanged = (help) =>{
    return {
        type: 'HELP',
        payload: help,
        info: 'This action is used to wait while loading data into the platform'
    }
};
