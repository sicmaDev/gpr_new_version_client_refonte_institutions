import axios from "axios";
import { HOST } from "../Utils/globals";
import { notify } from "../Utils/alert";

const CREATE_PUBLIC_REGISTER_API = HOST + "api/v1/config/user/publicRegister"

export const createUserPublic = (data) => {
    // console.log('createUserPublic', data);
    const config = {
        method: 'post',
        url: CREATE_PUBLIC_REGISTER_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        data
    };
    return axios(config);
};



