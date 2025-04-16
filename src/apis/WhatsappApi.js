import axios from "axios";
import { loadItemFromSessionStorage } from "../Utils/utils";
import { HOST } from "../Utils/globals";
import { notify } from "../Utils/alert";

const LIST_API = HOST + "api/v1/whatsapp/list"
const GET_ONE_API = HOST + "api/v1/whatsapp/messages/2"
const FILES_DOWNLOAD_API = HOST + "api/v1/media/download"

export const getList =  (props) => {

    const config = {
        method: 'get',
        url: LIST_API,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + loadItemFromSessionStorage('token')
        },
    };
    props.reset()
    props.setIsLoading(true)
    axios(config)
        .then(function ({ data }) {
            props.isOK("Liste des conversations recuperees")
            props.setInboxs(data?.content ?? [])

        })
        .catch(function (error) {
            props.isFail(error)
        });
}

export const downloadFilesApi = async (data) => {

    // let newId= data.replaceAll()
    const config = {
        method: 'post',
        url: FILES_DOWNLOAD_API,
        data:{path:data},
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
           
            const url = window.URL.createObjectURL(new Blob([response.data]));

           
            const link = document.createElement('a');
            link.href = url;
            let filename = data.split("\\")
            //console.log('data', filename)
            filename = filename[filename.length-1]
            link.setAttribute('download',filename); 
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
