import axios from "axios";
import { HOST } from "../Utils/globals";
import { loadItemFromSessionStorage } from "../Utils/utils";

const SMS_LOG_API = HOST + "api/v1/sms-log";

const authConfig = (params = {}) => ({
    params,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + loadItemFromSessionStorage("token"),
    },
});

export const listSmsLogs = (params = {}) => axios.get(SMS_LOG_API, authConfig(params));

export const getSmsLog = (id) => axios.get(`${SMS_LOG_API}/${id}`, authConfig());
