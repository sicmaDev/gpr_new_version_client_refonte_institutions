export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const compteDetailsErrors = (errors) =>{
    return {
        type: 'COMPTE_DETAILS_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const posteChanged = (poste) =>{
    return {
        type: 'POSTE_CHANGED',
        payload: poste,
        info: 'This action is used to ...'
    }
};
export const idChanged = (id) =>{
    return {
        type: 'ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const firstnameChanged = (firstname) =>{
    return {
        type: 'FIRSTNAME_CHANGED',
        payload: firstname,
        info: 'This action is used to ...'
    }
};
export const lastnameChanged = (lastname) =>{
    return {
        type: 'LASTNAME_CHANGED',
        payload: lastname,
        info: 'This action is used to ...'
    }
};
export const emailChanged = (email) =>{
    return {
        type: 'COMPTE_EMAIL_CHANGED',
        payload: email,
        info: 'This action is used to ...'
    }
};
export const phoneChanged = (phone) =>{
    return {
        type: 'COMPTE_PHONE_CHANGED',
        payload: phone,
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