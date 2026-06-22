import axios from "axios";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";

const LOG_LIST_API = HOST + "api/v1/config/log/all"
const LOG_EXPORTS_API = HOST + "api/v1/config/log/exports"

export const logs = async (data, props) => {

    const config = {
        method: 'get',
        url: LOG_LIST_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data: data
    };

    return axios(config)
}

export const exportLogs = async () => {
    return axios({
        method: 'get',
        url: LOG_EXPORTS_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    });
}