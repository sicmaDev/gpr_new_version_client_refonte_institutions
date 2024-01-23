export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const objetErrors = (errors) =>{
    return {
        type: 'OBJET_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'OBJET_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'OBJET_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'OBJET_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const risqueLevelChanged = (risqueLevel) =>{
    return {
        type: 'OBJET_RISQUE_LEVEL_CHANGED',
        payload: risqueLevel,
        info: 'This action is used to ...'
    }
};
export const categorieChanged = (categorie) =>{
    return {
        type: 'OBJET_CATEGORIE_CHANGED',
        payload: categorie,
        info: 'This action is used to ...'
    }
};
export const categorieLibelleChanged = (categorieLibelle) =>{
    return {
        type: 'OBJET_CATEGORIE_LIBELLE_CHANGED',
        payload: categorieLibelle,
        info: 'This action is used to ...'
    }
};
export const processingTimeChanged = (processingTime) =>{
    return {
        type: 'OBJET_PROCESSING_TIME_CHANGED',
        payload: processingTime,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'OBJET_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'OBJET_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'OBJET_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'OBJET_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'OBJET_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};
