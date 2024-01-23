export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const produitErrors = (errors) =>{
    return {
        type: 'PRODUIT_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'PRODUIT_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'PRODUIT_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'PRODUIT_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'PRODUIT_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'PRODUIT_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) =>{
    return {
        type: 'PRODUIT_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'PRODUIT_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'PRODUIT_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};