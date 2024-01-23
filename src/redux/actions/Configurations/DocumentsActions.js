export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const documentsErrors = (errors) =>{
    return {
        type: 'DOCUMENTS_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) =>{
    return {
        type: 'DOCUMENTS_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const libelleChanged = (libelle) =>{
    return {
        type: 'DOCUMENTS_LIBELLE_CHANGED',
        payload: libelle,
        info: 'This action is used to ...'
    }
};

export const itemsChanged = (items) =>{
    return {
        type: 'DOCUMENTS_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedFilesChanged = (selectedFiles) =>{
    return {
        type: 'DOCUMENTS_SELECTED_FILES_CHANGED',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedFilesReset = (selectedFiles) =>{
    return {
        type: 'DOCUMENTS_SELECTED_FILES_RESET',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemFilesChanged = (selectedItemFiles) =>{
    return {
        type: 'DOCUMENTS_SELECTED_ITEM_FILES_CHANGED',
        payload: selectedItemFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'DOCUMENTS_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};


export const etatChanged = (etat) =>{
    return {
        type: 'DOCUMENTS_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) =>{
    return {
        type: 'DOCUMENTS_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};
export const etat3Changed = (etat3) =>{
    return {
        type: 'DOCUMENTS_ETAT3_CHANGED',
        payload: etat3,
        info: 'This action is used to ...'
    }
};