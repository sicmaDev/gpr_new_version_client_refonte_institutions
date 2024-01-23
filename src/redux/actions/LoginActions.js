export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const loginErrors = (errors) =>{
    return {
        type: 'LOGIN_ERRORS',
        payload: errors,
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const emailChanged = (email) =>{
    return {
        type: 'EMAIL_CHANGED',
        payload: email,
        info: 'This action is used to ...'
    }
};
export const passChanged = (pass) =>{
    return {
        type: 'PASS_CHANGED',
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