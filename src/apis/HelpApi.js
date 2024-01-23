import axios from "axios";
import { loadItemFromSessionStorage} from "../Utils/utils";
import { HOST } from "../Utils/globals";
import { notify } from "../Utils/alert";

const HELP_API = HOST + "api/v1/help"
//download
const FILES_DOWNLOAD_API = HOST + "api/v1/doc/get/%id"

export const HelpApi = async (props) => {
    let mode =loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;

    if (mode === 1) {
        const config = {
            method: 'get',
            url: HELP_API,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + loadItemFromSessionStorage('token')
            },
        };
        await axios(config)
            .then(function (response) {
                // console.log("responsehelp",response.data.content)
                props.helpChanged(response.data.content);
            })
            .catch(function (error) {
                // console.log("erreurhelp",error)
            });
    } else {
        props.helpChanged(loadItemFromSessionStorage("help") !== undefined ? JSON.parse(loadItemFromSessionStorage("help")) : {})
    }

   
}


export const downloadFillesApi = async (data, filename) => {

    const config = {
        method: 'get',
        url: FILES_DOWNLOAD_API.replace("%id", data),
        responseType: 'blob',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token'),
            
        },
    
    };
    await axios(config)
        .then(function (response) {

            notify("Bravo - Téléchargement du fichier effectué", "success");
            // console.log("response data content",response.data)
            // Créez un objet URL à partir de la réponse
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Créez un lien invisible et déclenchez le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Remplacez 'nom_du_fichier.ext' par le nom du fichier
            document.body.appendChild(link);
            link.click();

            // Libérez l'URL de l'objet lorsque le téléchargement est terminé
            window.URL.revokeObjectURL(url);
        })
        .catch(function (error) {
            notify("Erreur - Veuillez réessayer!", "error");
            // console.log("erreur",error)
        });
}
