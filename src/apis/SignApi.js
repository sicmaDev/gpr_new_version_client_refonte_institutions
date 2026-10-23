import axios from "axios";
import { HOST } from "../Utils/globals";
import { notify } from "../Utils/alert";

const PUBLIC_POSTE_LIST_API = HOST + "api/v1/public/poste/list"
const PUBLIC_SERVICE_POINT_LIST_API = HOST + "api/v1/public/service_point/list"

const CREATE_PUBLIC_REGISTER_API = HOST + "api/v1/config/user/publicRegister"

// Listes utilisées par le formulaire d'inscription publique (SignUser.js).
// Contrairement aux écrans internes, on ne peut pas se fier au localStorage
// (app-postes/app-ps) : un visiteur qui n'a jamais eu de session ne les a
// jamais eus. Ces deux endpoints sont volontairement publics et renvoient un
// DTO allégé (pas d'habilitations).
export const getPublicPostes = () =>
    axios({
        method: 'get',
        url: PUBLIC_POSTE_LIST_API,
        headers: { 'Accept': 'application/json' },
    }).then((res) => res.data ?? []).catch(() => []);

export const getPublicServicePoints = () =>
    axios({
        method: 'get',
        url: PUBLIC_SERVICE_POINT_LIST_API,
        headers: { 'Accept': 'application/json' },
    }).then((res) => res.data ?? []).catch(() => []);

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



