export const urlChange = (url) => {
    return {
        type: 'URL_CHANGED',
        payload: url
    }
}

export const libelleIdChanged = (libelleId) => {
    return {
        type: 'LIBELLE_ID_CHANGED',
        payload: libelleId
    }
};

export const valueIdChanged = (valueId) => {
    return {
        type: 'VALUE_ID_CHANGED',
        payload: valueId

    }
};

export const libellePwdChanged = (libellePwd) => {
    return {
        type: 'LIBELLE_PWD_CHANGED',
        payload: libellePwd

    }
};

export const valuePwdChanged = (valuePwd) => {
    return {
        type: 'VALUE_PWD_CHANGED',
        payload: valuePwd

    }
};

export const libelleSenderChanged = (libelleSender) => {
    return {
        type: 'LIBELLE_SENDER_CHANGED',
        payload: libelleSender

    }
};

export const valueSenderChanged = (valueSender) => {
    return {
        type: 'VALUE_SENDER_CHANGED',
        payload: valueSender

    }
};

export const libelleReceiverChanged = (libelleReceiver) => {
    return {
        type: 'LIBELLE_RECEIVER_CHANGED',
        payload: libelleReceiver

    }
};

export const libelleMessageChanged = (libelleMessage) => {
    return {
        type: 'LIBELLE_MESSAGE_CHANGED',
        payload: libelleMessage

    }
};

export const etatChanged = (etat) => {
    return {
        type: 'SMS_ETAT_CHANGED',
        payload: etat

    }
};

export const smsErrors = (errors) =>{
    return {
        type: 'SMS_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};
