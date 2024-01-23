import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import {KTApp} from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

const REPORT_BCEAO_API = HOST + "api/v1/report/bceao"

export const reportBceaoApi = async (props,params) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'post',
        url: REPORT_BCEAO_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data : params
    };
    await axios(config)
        .then(function (response) {
            console.log("responseBCEAO",response.data)
            props.globalChanged(response.data);
          
            KTApp.unblockPage();
            notify("Bravo - Rapport généré","success");
        })
        .catch(function (error) {
            // console.log("erreurbceao",error)
        });
}
