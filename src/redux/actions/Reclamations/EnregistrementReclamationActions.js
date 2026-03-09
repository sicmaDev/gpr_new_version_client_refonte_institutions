export const loading = () => {
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const claimRecordErrors = (errors) => {
    return {
        type: 'CLAIM_RECORD_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
export const idChanged = (id) => {
    return {
        type: 'CLAIM_RECORD_ID_CHANGED',
        payload: id,
        info: 'This action is used to ...'
    }
};
export const firstnameChanged = (firstname) => {
    return {
        type: 'CLAIM_RECORD_FIRSTNAME_CHANGED',
        payload: firstname,
        info: 'This action is used to ...'
    }
};
export const lastnameChanged = (lastname) => {
    return {
        type: 'CLAIM_RECORD_LASTNAME_CHANGED',
        payload: lastname,
        info: 'This action is used to ...'
    }
};
export const addressChanged = (address) => {
    return {
        type: 'CLAIM_RECORD_ADDRESS_CHANGED',
        payload: address,
        info: 'This action is used to ...'
    }
};
export const phoneChanged = (phone) => {
    return {
        type: 'CLAIM_RECORD_PHONE_CHANGED',
        payload: phone,
        info: 'This action is used to ...'
    }
};
export const genderChanged = (gender) => {
    return {
        type: 'CLAIM_RECORD_GENDER_CHANGED',
        payload: gender,
        info: 'This action is used to ...'
    }
};
export const languageChanged = (language) => {
    return {
        type: 'CLAIM_RECORD_LANGUAGE_CHANGED',
        payload: language,
        info: 'This action is used to ...'
    }
};
export const languageLibelleChanged = (languageLibelle) => {
    return {
        type: 'CLAIM_RECORD_LANGUAGE_LIBELLE_CHANGED',
        payload: languageLibelle,
        info: 'This action is used to ...'
    }
};
export const dossierimfChanged = (dossierimf) => {
    return {
        type: 'CLAIM_RECORD_DOSSIERIMF_CHANGED',
        payload: dossierimf,
        info: 'This action is used to ...'
    }
};
export const crewChanged = (crew) => {
    return {
        type: 'CLAIM_RECORD_CREW_CHANGED',
        payload: crew,
        info: 'This action is used to ...'
    }
};
export const codeChanged = (code) => {
    return {
        type: 'CLAIM_RECORD_CODE_CHANGED',
        payload: code,
        info: 'This action is used to ...'
    }
};
export const recordedAtChanged = (recordedAt) => {
    return {
        type: 'CLAIM_RECORD_RECORDED_AT_CHANGED',
        payload: recordedAt,
        info: 'This action is used to ...'
    }
};
export const recordedAtDPChanged = (recordedAtDP) => {
    return {
        type: 'CLAIM_RECORD_RECORDED_AT_DP_CHANGED',
        payload: recordedAtDP,
        info: 'This action is used to ...'
    }
};
export const collectChanged = (collect) => {
    return {
        type: 'CLAIM_RECORD_COLLECT_CHANGED',
        payload: collect,
        info: 'This action is used to ...'
    }
};
export const collectLibelleChanged = (collectLibelle) => {
    return {
        type: 'CLAIM_RECORD_COLLECT_LIBELLE_CHANGED',
        payload: collectLibelle,
        info: 'This action is used to ...'
    }
};
export const subjectChanged = (subject) => {
    return {
        type: 'CLAIM_RECORD_SUBJECT_CHANGED',
        payload: subject,
        info: 'This action is used to ...'
    }
};
export const subjectLibelleChanged = (subjectLibelle) => {
    return {
        type: 'CLAIM_RECORD_SUBJECT_LIBELLE_CHANGED',
        payload: subjectLibelle,
        info: 'This action is used to ...'
    }
};
export const underSubjectChanged = (underSubject) => {
    return {
        type: 'CLAIM_RECORD_UNDERSUBJECT_CHANGED',
        payload: underSubject,
        info: 'This action is used to ...'
    }
};
export const underSubjectLibelleChanged = (underSubjectLibelle) => {
    return {
        type: 'CLAIM_RECORD_UNDERSUBJECT_LIBELLE_CHANGED',
        payload: underSubjectLibelle,
        info: 'This action is used to ...'
    }
};
export const productChanged = (product) => {
    return {
        type: 'CLAIM_RECORD_PRODUCT_CHANGED',
        payload: product,
        info: 'This action is used to ...'
    }
};
export const productLibelleChanged = (productLibelle) => {
    return {
        type: 'CLAIM_RECORD_PRODUCT_LIBELLE_CHANGED',
        payload: productLibelle,
        info: 'This action is used to ...'
    }
};
export const unitChanged = (unit) => {
    return {
        type: 'CLAIM_RECORD_UNIT_CHANGED',
        payload: unit,
        info: 'This action is used to ...'
    }
};
export const unitLibelleChanged = (unitLibelle) => {
    return {
        type: 'CLAIM_RECORD_UNIT_LIBELLE_CHANGED',
        payload: unitLibelle,
        info: 'This action is used to ...'
    }
};
export const contentChanged = (content) => {
    return {
        type: 'CLAIM_RECORD_CONTENT_CHANGED',
        payload: content,
        info: 'This action is used to ...'
    }
};
export const reset = () => {
    return {
        type: 'CLAI_RECORD_RESET',
        info: 'This action is used to ...'
    }
};
export const itemsChanged = (items) => {
    return {
        type: 'CLAIM_RECORD_ITEMS_CHANGED',
        payload: items,
        info: 'This action is used to ...'
    }
};
export const selectedFilesChanged = (selectedFiles) => {
    return {
        type: 'CLAIM_RECORD_SELECTED_FILES_CHANGED',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedFilesReset = (selectedFiles) => {
    return {
        type: 'CLAIM_RECORD_SELECTED_FILES_RESET',
        payload: selectedFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemChanged = (selectedItem) => {
    return {
        type: 'CLAIM_RECORD_SELECTED_ITEM_CHANGED',
        payload: selectedItem,
        info: 'This action is used to ...'
    }
};
export const selectedItemFilesChanged = (selectedItemFiles) => {
    return {
        type: 'CLAIM_RECORD_SELECTED_ITEM_FILES_CHANGED',
        payload: selectedItemFiles,
        info: 'This action is used to ...'
    }
};
export const selectedItemAudioChanged = (selectedItemAudio) => {
    return {
        type: 'CLAIM_RECORD_SELECTED_ITEM_AUDIO_CHANGED',
        payload: selectedItemAudio,
        info: 'This action is used to ...'
    }
};
export const etatChanged = (etat) => {
    return {
        type: 'CLAIM_RECORD_ETAT_CHANGED',
        payload: etat,
        info: 'This action is used to ...'
    }
};
export const etat2Changed = (etat2) => {
    return {
        type: 'CLAIM_RECORD_ETAT2_CHANGED',
        payload: etat2,
        info: 'This action is used to ...'
    }
};

export const setExistingClaims = (existingClaims) => {
    return {
        type: 'CLAIM_RECORD_EXISTING_CLAIMS_CHANGED',
        payload: existingClaims,
        info: 'This action is used to ...'
    }
};
export const setModalVisible = (modalVisible) => {
    return {
        type: 'CLAIM_RECORD_MODAL_VISIBLE_CHANGED',
        payload: modalVisible,
        info: 'This action is used to ...'
    }
};


