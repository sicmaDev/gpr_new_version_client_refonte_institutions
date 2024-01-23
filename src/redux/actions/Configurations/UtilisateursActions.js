export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const userErrors = (errors) =>{
    return {
        type: 'USER_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'USER_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const codeChanged = (code) =>{
    return {
        type: 'USER_CODE_CHANGED',
        payload: code,
        info: 'This action is used to ...'
    }
};
export const nameChanged = (name) =>{
    return {
        type: 'USER_NAME_CHANGED',
        payload: name,
        info: 'This action is used to ...'
    }
};

export const emailChanged = (email) =>{
    return {
        type: 'USER_EMAIL_CHANGED',
        payload: email,
        info: 'This action is used to ...'
    }
};
export const phoneChanged = (phone) =>{
    return {
        type: 'USER_PHONE_CHANGED',
        payload: phone,
        info: 'This action is used to ...'
    }
};
export const posteChanged = (poste) =>{
    return {
        type: 'USER_POSTE_CHANGED',
        payload: poste,
        info: 'This action is used to ...'
    }
};
export const posteLibelleChanged = (posteLibelle) =>{
    return {
        type: 'USER_POSTE_LIBELLE_CHANGED',
        payload: posteLibelle,
        info: 'This action is used to ...'
    }
};
export const unitChanged = (unit) =>{
    return {
        type: 'USER_UNIT_CHANGED',
        payload: unit,
        info: 'This action is used to ...'
    }
};
export const unitLibelleChanged = (unitLibelle) =>{
    return {
        type: 'USER_UNIT_LIBELLE_CHANGED',
        payload: unitLibelle,
        info: 'This action is used to ...'
    }
};
export const additionalRoleChanged = (additionalRole) =>{
    return {
        type: 'USER_ADDITIONAL_ROLE_CHANGED',
        payload: additionalRole,
        info: 'This action is used to ...'
    }
};

export const passwordChanged = (pass) =>{
    return {
        type: 'USER_PASS_CHANGED',
        payload: pass,
        info: 'This action is used to ...'
    }
};
export const passwordAgainChanged = (pass) =>{
    return {
        type: 'USER_PASS_AGAIN_CHANGED',
        payload: pass,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'USER_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'USER_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};


export const etatChanged = (etat) =>{
    return {
        type: 'USER_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'USER_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'USER_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};