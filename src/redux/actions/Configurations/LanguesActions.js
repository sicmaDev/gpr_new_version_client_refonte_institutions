export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const langueErrors = (errors) =>{
    return {
        type: 'LANGUE_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'LANGUE_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'LANGUE_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'LANGUE_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'LANGUE_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'LANGUE_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'LANGUE_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'LANGUE_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'LANGUE_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};