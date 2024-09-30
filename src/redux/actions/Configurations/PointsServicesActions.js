export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const psErrors = (errors) =>{
    return {
        type: 'PS_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'PS_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const codeChanged = (code) =>{
    return {
        type: 'PS_CODE_CHANGED',
        payload: code,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'PS_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'PS_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const typeChanged = (type) =>{
    return {
        type: 'PS_TYPE_CHANGED',
        payload: type,
        info: 'This action is used to ...'
    }
};
export const unitChanged = (unit) =>{
    return {
        type: 'PS_UNIT_CHANGED',
        payload: unit,
        info: 'This action is used to ...'
    }
};
export const unitLibelleChanged = (unitLibelle) =>{
    return {
        type: 'PS_UNIT_LIBELLE_CHANGED',
        payload: unitLibelle,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'PS_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'PS_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'PS_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'PS_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'PS_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};