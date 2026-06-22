import axios from "axios";
import { KTApp } from "../../Utils/blockui";

import { HOST } from "../../Utils/globals";
import { notify } from "../../Utils/alert";
import { loadItemFromSessionStorage } from "../../Utils/utils";

const EXPORT_REPORT_API = HOST + "api/v1/config/setting/export"

export const exportConfigs = async (type, filename, onSuccess) => {
    KTApp.blockPage({
        overlayColor: '#000000',
        type: 'v2',
        state: 'danger',
        message: 'En cours...'
    });

    axios.get(`${EXPORT_REPORT_API}/${type}`, {
        headers: {
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        }
    })
        .then(function ({data}) {
            notify("Bravo - Téléchargement du fichier effectué", "success");
            const url = window.URL.createObjectURL(new Blob([JSON.stringify(data.content)],{type:"text/plain"}));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            if (onSuccess) onSuccess();
        })
        .catch(function (error) {
            notify("Erreur,une erreure s'est produite", "error")
        }).finally(()=>{
            KTApp.unblockPage();
        });
}