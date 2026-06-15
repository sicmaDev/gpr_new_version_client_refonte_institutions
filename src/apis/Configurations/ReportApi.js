import axios from "axios";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";

const SYSTEM_PERFORMANCE_API = HOST + "api/v1/report/system-performance"

export const systemPerformance = async () => {

    const config = {
        method: 'get',
        url: SYSTEM_PERFORMANCE_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };

    return axios(config)

}
