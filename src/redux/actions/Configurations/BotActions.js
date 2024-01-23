export const apiKeyChanged = (apikey) =>{
    return {
        type: 'API_KEY_CHANGED',
        payload: apikey
    }
}

export const apiSecretChanged = (apiSecret) =>{
    return {
        type: 'API_SECRET_CHANGED',
        payload: apiSecret
    }
}


export const gprbotErrors = (errors) =>{
    return {
        type: 'GPR_BOT_ERRORS',
        payload: errors,
        info: 'This action is used to '
    }
};

export const etatChanged = (etat) =>{
    return {
        type: 'GPR_BOT_ETAT',
        payload: etat,
        info: 'This action is used to '
    }
};
