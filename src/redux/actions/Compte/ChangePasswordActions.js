export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const changePasswordErrors = (errors) =>{
    return {
        type: 'CHANGE_PASSWORD_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const currentPasswordChanged = (pass) =>{
    return {
        type: 'CURRENT_PASS_CHANGED',
        payload: pass,
        info: 'This action is used to ...'
    }
};
export const newPasswordChanged = (pass) =>{
    return {
        type: 'NEW_PASS_CHANGED',
        payload: pass,
        info: 'This action is used to ...'
    }
};
export const newPasswordAgainChanged = (pass) =>{
    return {
        type: 'NEW_PASS_AGAIN_CHANGED',
        payload: pass,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) =>{
    return {
        type: 'ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};