export const loading = () =>{
    return {
        type: 'LOADING',
        info: 'This action is used to wait while loading data into the platform'
    }
};
export const install = () =>{
    return {
        type: 'INSTALLED',
        info: 'This action is used to install app initial settings'
    }
};
export const authenticate = () =>{
    return {
        type: 'AUTHENTICATED',
        info: 'This action is used to authenticate user'
    }
};
export const pageChanged = (page) =>{
  
    return {
        type: 'PAGE',
        payload: page,
        info: 'This action is used to user interface'
    }
};
export const actifChanged = (actif) =>{
  
    return {
        type: 'ACTIF',
        payload: actif,
        info: 'This action is used to user interface'
    }
};
