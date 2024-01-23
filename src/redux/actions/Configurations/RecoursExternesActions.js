export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const recoursExternesErrors = (errors) =>{
    return {
        type: 'RECOURS_EXTERNES_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'RECOURS_EXTERNES_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'RECOURS_EXTERNES_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'RECOURS_EXTERNES_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'RECOURS_EXTERNES_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'RECOURS_EXTERNES_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};


export const etatChanged = (etat) =>{
    return {
        type: 'RECOURS_EXTERNES_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'RECOURS_EXTERNES_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'RECOURS_EXTERNES_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};