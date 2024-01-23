export const globalChanged = (global) =>{
    return {
        type: 'REPORT_BCEAO_GLOBAL',
        payload: global,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const openChanged = (open) =>{
    return {
        type: 'REPORT_BCEAO_OPEN',
        payload: open,
        info: 'This action is used to wait while loading data into the platform'
    }
};
