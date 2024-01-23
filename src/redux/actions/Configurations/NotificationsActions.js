export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const notificationErrors = (errors) =>{
    return {
        type: 'NOTIFICATION_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'NOTIFICATION_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const emailsChanged = (emails) =>{
    return {
        type: 'NOTIFICATION_EMAILS_CHANGED',
        payload: emails,
        info: 'This action is used to ...'
    }
};
export const emailsLibelleChanged = (emailsLibelle) =>{
    return {
        type: 'NOTIFICATION_LIBELLE_EMAILS_CHANGED',
        payload: emailsLibelle,
        info: 'This action is used to ...'
    }
};
export const roleChanged = (role) =>{
    return {
        type: 'NOTIFICATION_ROLE_CHANGED',
        payload: role,
        info: 'This action is used to ...'
    }
};
export const roleLibelleChanged = (roleLibelle) =>{
    return {
        type: 'NOTIFICATION_ROLE_LIBELLE_CHANGED',
        payload: roleLibelle,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'NOTIFICATION_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const items2Changed = (items2) =>{
    return {
        type: 'NOTIFICATION_ITEMS2_CHANGED',
        payload: items2,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) =>{
    return {
        type: 'NOTIFICATION_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'NOTIFICATION_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'NOTIFICATION_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};
