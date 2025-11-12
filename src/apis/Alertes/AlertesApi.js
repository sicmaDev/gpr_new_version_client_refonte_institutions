import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

const ALERT_CLAIM_API = HOST + "api/v1/alert/claim"
const ALERT_DENUN_API = HOST + "api/v1/alert/denun"


export const alertReclamationApi = async (props) => {

    const config = {
        method: 'get',
        url: ALERT_CLAIM_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("responsealert",response.data.content)
            props.itemsChanged(response.data.content)
        })
        .catch(function (error) {
            // console.log("erreuralert",error)
        });
}

export const alertDenonciationApi = async (props) => {

    const config = {
        method: 'get',
        url: ALERT_DENUN_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            console.log("responsealertdenun",response.data.content)
            props.itemsChanged(response.data.content)
        })
        .catch(function (error) {
            // console.log("erreuralert",error)
        });
}
