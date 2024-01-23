export const dashboardChanged = (dashboard) =>{
    return {
        type: 'DASHBOARD',
        payload: dashboard,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const etat1Changed = (etat1) =>{
    return {
        type: 'ETAT1_CHANGED',
        payload: etat1,
        info: 'This action is used to wait while loading data into the platform'
    }
};
