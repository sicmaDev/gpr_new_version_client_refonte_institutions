export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const posteErrors = (errors) =>{
    return {
        type: 'POSTE_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'POSTE_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'POSTE_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};
export const descriptionChanged = (description) =>{
    return {
        type: 'POSTE_DESCRIPTION_CHANGED',
        payload: description,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'POSTE_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const habilitationsChanged = (habilitations) =>{
    
    return {
        
        type: 'POSTE_HABILITATIONS_CHANGED',
        payload: habilitations,
        info: 'This action is used to ...'
    }
};
export const cardChanged = (card) =>{
    return {
        type: 'POSTE_CARD_CHANGED',
        payload: card,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'POSTE_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'POSTE_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'POSTE_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'POSTE_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};