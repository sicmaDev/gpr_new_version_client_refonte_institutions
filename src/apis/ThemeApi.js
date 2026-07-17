import axios from 'axios';
import { HOST } from '../Utils/globals';
import { loadItemFromLocalStorage } from '../Utils/utils';

const UPDATE_THEME_API = HOST + 'api/v1/auth/update/theme';

export const updateTheme = (data) => {
    const token = loadItemFromLocalStorage('token');
    const config = {
        method: 'put',
        url: UPDATE_THEME_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        data,
    };
    return axios(config);
};
