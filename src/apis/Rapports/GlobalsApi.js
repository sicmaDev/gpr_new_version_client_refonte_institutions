import axios from "axios";
import { loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from "../../Utils/utils";
import {KTApp} from "../../Utils/blockui";
import { notify } from "../../Utils/alert";
import { HOST } from "../../Utils/globals";

const REPORT_GLOBAL_API = HOST + "api/v1/report/global"
const REPORT_GLOBAL_API_FILTRES = HOST + "api/v1/report/filtered"


export const reportApi = async (props) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'get',
        url: REPORT_GLOBAL_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("responsealertREPORT",response.data)
            if (response.data.status) {
                props.globalTrendChanged(response.data.global)
                props.claimReportChanged(response.data.claimReport)
                props.denunReportChanged(response.data.denunReport)
                props.sugReportChanged(response.data.suggestionReport)
                props.statChanged(response.data.statistic)
              
                KTApp.unblockPage();
                notify("Bravo - Rapport généré","success");
            } else {
                notify("Votre licence n'est pas active.", "error");
            }
           
            // console.log('report ans',response.data)
        })
        .catch(function (error) {
            // console.log("erreurREPORT",error)
        });
}

export const reportApiFiltres = async (props,body) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    const config = {
        method: 'post',
        url: REPORT_GLOBAL_API_FILTRES,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
        data : body
    };
    await axios(config)
        .then(function (response) {
            // console.log("responsealertREPORTfiltres",response.data)
            if (response.data.status) {
                props.globalTrendChanged(response.data.global)
                props.claimReportChanged(response.data.claimReport)
                props.denunReportChanged(response.data.denunReport)
                props.sugReportChanged(response.data.suggestionReport)
                props.statChanged(response.data.statistic)
               
              
                KTApp.unblockPage();
                notify("Bravo - Rapport généré","success");
            } else {
                notify("Votre licence n'est pas active.", "error");
            }
           
           
        })
        .catch(function (error) {
            // console.log("erreurREPORTfiltres",error)
        });
}
