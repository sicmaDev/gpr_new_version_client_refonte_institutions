export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const solutionErrors = (errors) =>{
    return {
        type: 'SOLUTION_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'SOLUTION_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const objetChanged = (objet) =>{
    return {
        type: 'SOLUTION_OBJET_CHANGED',
        payload: objet,
        info: 'This action is used to ...'
    }
};
export const objetLibelleChanged = (objetLibelle) =>{
    return {
        type: 'SOLUTION_OBJET_LIBELLE_CHANGED',
        payload: objetLibelle,
        info: 'This action is used to ...'
    }
};
export const solutionChanged = (solution) =>{
    return {
        type: 'SOLUTION_SOLUTION_CHANGED',
        payload: solution,
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'SOLUTION_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'SOLUTION_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'SOLUTION_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'SOLUTION_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'SOLUTION_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};