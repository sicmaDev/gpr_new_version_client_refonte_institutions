import axios from "axios";
import { loadItemFromSessionStorage } from "../Utils/utils";
import { HOST } from "../Utils/globals";

const DASHBOARD_API = HOST + "api/v1/auth/dashboard"

export const DashboardApi = async (props) => {

    const config = {
        method: 'get',
        url: DASHBOARD_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    await axios(config)
        .then(function (response) {
            // console.log("responseDASH",response)
            props.etat1Changed(true)
            props.dashboardChanged(response.data.content);
            console.log("je suis ici ", response.data.content)
            // notify("Bravo - Rapport généré","success");
        })
        .catch(function (error) {
            // console.log("erreurDASH",error)
        });
}
