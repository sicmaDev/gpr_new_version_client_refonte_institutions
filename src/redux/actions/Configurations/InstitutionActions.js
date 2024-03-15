export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const institutionErrors = (errors) =>{
    return {
        type: 'INSTITUTION_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'INSTITUTION_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const denominationChanged = (denomination) =>{
    return {
        type: 'DENOMINATION_CHANGED',
        payload: denomination,
        info: 'This action is used to ...'
    }
};
export const referenceChanged = (reference) =>{
    return {
        type: 'REFERENCE_CHANGED',
        payload: reference,
        info: 'This action is used to ...'
    }
};
export const addressChanged = (address) =>{
    return {
        type: 'ADDRESS_CHANGED',
        payload: address,
        info: 'This action is used to ...'
    }
};
export const emailChanged = (email) =>{
    return {
        type: 'INSTITUTION_EMAIL_CHANGED',
        payload: email,
        info: 'This action is used to ...'
    }
};
export const phoneChanged = (phone) =>{
    return {
        type: 'INSTITUTION_PHONE_CHANGED',
        payload: phone,
        info: 'This action is used to ...'
    }
};
export const paysChanged = (pays) =>{
    return {
        type: 'INSTITUTION_PAYS_CHANGED',
        payload: pays,
        info: 'This action is used to ...'
    }
};
export const paysCodeChanged = (paysCode) =>{
    return {
        type: 'INSTITUTION_PAYS_CODE_CHANGED',
        payload: paysCode,
        info: 'This action is used to ...'
    }
};
export const logoChanged = (logo) =>{
    return {
        type: 'LOGO_CHANGED',
        payload: logo,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) =>{
    return {
        type: 'INSTITUTION_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};