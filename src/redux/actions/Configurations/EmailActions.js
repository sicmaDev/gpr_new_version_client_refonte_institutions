export const portChanged = (port) => {
    return {
        type: 'MAIL_PORT_CHANGED',
        payload: port
    }
}
export const hostChanged = (host) => {
    return {
        type: 'MAIL_HOST_CHANGED',
        payload: host
    }
}
export const userChanged = (user) => {
    return {
        type: "MAIL_USER_CHANGED",
        payload: user
    }
}
export const passwordChanged = (password) => {
    return {
        type: "MAIL_PASSWORD_CHANGED",
        payload: password
    }
}
export const loadingChanged = () => {
    return {
        type: "MAIL_LOADING_CHANGED"
    }
}

export const etatChanged = () => {
    return {
        type: "MAIL_ETAT_CHANGED"
    }
}