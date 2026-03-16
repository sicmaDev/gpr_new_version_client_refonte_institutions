export const loading = () => {
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const suggestionRecordErrors = (errors) => {
    return {
        type: 'SUGGESTION_RECORD_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) => {
    return {
        type: 'SUGGESTION_RECORD_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const firstnameChanged = (firstname) => {
    return {
        type: 'SUGGESTION_RECORD_FIRSTNAME_CHANGED',
        payload: firstname,
        info: 'This action is used to ...'
    }
};
export const lastnameChanged = (lastname) => {
    return {
        type: 'SUGGESTION_RECORD_LASTNAME_CHANGED',
        payload: lastname,
        info: 'This action is used to ...'
    }
};
export const addressChanged = (address) => {
    return {
        type: 'SUGGESTION_RECORD_ADDRESS_CHANGED',
        payload: address,
        info: 'This action is used to ...'
    }
};
export const emailChanged = (email) => {
    return {
        type: 'SUGGESTION_RECORD_EMAIL_CHANGED',
        payload: email,
        info: 'This action is used to ...'
    }
};
export const phoneChanged = (phone) => {
    return {
        type: 'SUGGESTION_RECORD_PHONE_CHANGED',
        payload: phone,
        info: 'This action is used to ...'
    }
};
export const genderChanged = (gender) => {
    return {
        type: 'SUGGESTION_RECORD_GENDER_CHANGED',
        payload: gender,
        info: 'This action is used to ...'
    }
};
export const languageChanged = (language) => {
    return {
        type: 'SUGGESTION_RECORD_LANGUAGE_CHANGED',
        payload: language,
        info: 'This action is used to ...'
    }
};
export const languageLibelleChanged = (languageLibelle) => {
    return {
        type: 'SUGGESTION_RECORD_LANGUAGE_LIBELLE_CHANGED',
        payload: languageLibelle,
        info: 'This action is used to ...'
    }
};
export const dossierimfChanged = (dossierimf) => {
    return {
        type: 'SUGGESTION_RECORD_DOSSIERIMF_CHANGED',
        payload: dossierimf,
        info: 'This action is used to ...'
    }
};
export const codeChanged = (code) => {
    return {
        type: 'SUGGESTION_RECORD_CODE_CHANGED',
        payload: code,
        info: 'This action is used to ...'
    }
};
export const recordedAtChanged = (recordedAt) => {
    return {
        type: 'SUGGESTION_RECORD_RECORDED_AT_CHANGED',
        payload: recordedAt,
        info: 'This action is used to ...'
    }
};
export const collectChanged = (collect) => {
    return {
        type: 'SUGGESTION_RECORD_COLLECT_CHANGED',
        payload: collect,
        info: 'This action is used to ...'
    }
};
export const collectLibelleChanged = (collectLibelle) => {
    return {
        type: 'SUGGESTION_RECORD_COLLECT_LIBELLE_CHANGED',
        payload: collectLibelle,
        info: 'This action is used to ...'
    }
};
export const subjectChanged = (subject) => {
    return {
        type: 'SUGGESTION_RECORD_SUBJECT_CHANGED',
        payload: subject,
        info: 'This action is used to ...'
    }
};
export const subjectLibelleChanged = (subjectLibelle) => {
    return {
        type: 'SUGGESTION_RECORD_SUBJECT_LIBELLE_CHANGED',
        payload: subjectLibelle,
        info: 'This action is used to ...'
    }
};
export const productChanged = (product) => {
    return {
        type: 'SUGGESTION_RECORD_PRODUCT_CHANGED',
        payload: product,
        info: 'This action is used to ...'
    }
};
export const productLibelleChanged = (productLibelle) => {
    return {
        type: 'SUGGESTION_RECORD_PRODUCT_LIBELLE_CHANGED',
        payload: productLibelle,
        info: 'This action is used to ...'
    }
};
export const unitChanged = (unit) => {
    return {
        type: 'SUGGESTION_RECORD_UNIT_CHANGED',
        payload: unit,
        info: 'This action is used to ...'
    }
};
export const unitLibelleChanged = (unitLibelle) => {
    return {
        type: 'SUGGESTION_RECORD_UNIT_LIBELLE_CHANGED',
        payload: unitLibelle,
        info: 'This action is used to ...'
    }
};
export const contentChanged = (content) => {
    return {
        type: 'SUGGESTION_RECORD_CONTENT_CHANGED',
        payload: content,
        info: 'This action is used to ...'
    }
};
export const reset = () => {
    return {
        type: 'SUGGESTION_RECORD_RESET',
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) =>{
    return {
        type: 'SUGGESTION_RECORD_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) =>{
    return {
        type: 'SUGGESTION_RECORD_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};
export const solutionChanged = (solution) =>{
    return {
        type: 'SUGGESTION_RECORD_SOLUTION_CHANGED',
        payload: solution,
        info: 'This action is used to ...'
    }
};
export const statusChanged = (status) =>{
    return {
        type: 'SUGGESTION_RECORD_STATUS_CHANGED',
        payload: status,
        info: 'This action is used to ...'
    }
};
export const createdAtChanged = (createdAt) => {
    return {
        type: 'SUGGESTION_RECORD_CREATED_AT_CHANGED',
        payload: createdAt,
        info: 'This action is used to ...'
    }
};
export const createdByChanged = (createdBy) => {
    return {
        type: 'SUGGESTION_RECORD_CREATED_BY_CHANGED',
        payload: createdBy,
        info: 'This action is used to ...'
    }
};
export const handledAtChanged = (handledAt) => {
    return {
        type: 'SUGGESTION_RECORD_HANDLED_AT_CHANGED',
        payload: handledAt,
        info: 'This action is used to ...'
    }
};
export const handledByChanged = (handledBy) => {
    return {
        type: 'SUGGESTION_RECORD_HANDLED_BY_CHANGED',
        payload: handledBy,
        info: 'This action is used to ...'
    }
};
export const resolvedAtChanged = (resolvedAt) => {
    return {
        type: 'SUGGESTION_RECORD_RESOLVED_AT_CHANGED',
        payload: resolvedAt,
        info: 'This action is used to ...'
    }
};
export const resolvedByChanged = (resolvedBy) => {
    return {
        type: 'SUGGESTION_RECORD_RESOLVED_BY_CHANGED',
        payload: resolvedBy,
        info: 'This action is used to ...'
    }
};
export const recordedAtDPChanged = (recordedAtDP) => {
    return {
        type: 'SUGGESTION_RECORD_RECORDED_AT_DP_CHANGED',
        payload: recordedAtDP,
        info: 'This action is used to ...'
    }
};
export const selectedFilesChanged = (selectedFiles) =>{
    return {
        type: 'SUGGESTION_RECORD_SELECTED_FILES_CHANGED',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemAudioChanged = (selectedItemAudio) =>{
    // console.log('SUGGESTION_RECORD_SELECTED_ITEM_AUDIO_CHANGED', selectedItemAudio)
    return {
        type: 'SUGGESTION_RECORD_SELECTED_ITEM_AUDIO_CHANGED',
        payload: selectedItemAudio,
        info: 'This action is used to ...'
    }
};
export const selectedFilesReset = (selectedFiles) =>{
    return {
        type: 'SUGGESTION_RECORD_SELECTED_FILES_RESET',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemFilesChanged = (selectedItemFiles) =>{
    return {
        type: 'SUGGESTION_RECORD_SELECTED_ITEM_FILES_CHANGED',
        payload: selectedItemFiles,
        info: 'This action is used to ...'
    }
};
export const showSelectPrintItemChanged = (show) =>{
    return{
        type:'SUGGESTION_RECORD_SHOW_SELECT_PRINT_ITEMS',
     
        info:'This action is used to select item where users would export'
    }
}
export const crewChanged = (crew) => {
    return {
        type: 'SUGGESTION_RECORD_CREW_CHANGED',
        payload:crew,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) => {
    return {
        type: 'SUGGESTION_RECORD_ETAT_CHANGED',
        payload:etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) => {
    return {
        type: 'SUGGESTION_RECORD_ETAT2_CHANGED',
        payload:etat2,
        info: 'This action is used to ...'
    }
};