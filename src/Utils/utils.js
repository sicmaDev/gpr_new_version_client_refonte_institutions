import pdfIcon from "../assets/images/icon/pdf-image.png";
import excelIcon from "../assets/images/icon/xls-image.png";
import wordIcon from "../assets/images/icon/doc-image.png";
import imageIcon from "../assets/images/icon/jpg-image.png";
import audioIcon from "../assets/images/icon/audio.png";
import videoIcon from "../assets/images/icon/video.png";
import unknownIcon from "../assets/images/icon/doc.png";
import { useHistory } from "react-router-dom";

export const saveItemToLocalStorage = (item, field) => {
    try {
        const serializedItem = JSON.stringify(item)
        localStorage.setItem(field, serializedItem)
    } catch (e) {
    }
}
export const loadItemFromLocalStorage = (field) => {
    try {
        const serializedItem = localStorage.getItem(field)
        if (serializedItem === null) return undefined
        return JSON.parse(serializedItem)
    } catch (e) {
        return undefined
    }
}
export const clearLocalstorage = () => {
    try {
        localStorage.clear()
    }
    catch (e) {
    }
}
export const saveItemToSessionStorage = (item, field) => {
    try {
        const serializedItem = JSON.stringify(item)
        sessionStorage.setItem(field, serializedItem)
    } catch (e) {
    }
}

export const loadItemFromSessionStorage = (field) => {
    try {
       
        const serializedItem = sessionStorage.getItem(field)
        // console.log("utilsuser",serializedItem)
        if (serializedItem === null) return undefined
        return JSON.parse(serializedItem)
    } catch (e) {
        return "undefined"
    }
}

export const  makeBaseAuth = (credentials) => {
    var tok = credentials.username + ':' + credentials.password;
    var hash = btoa(tok);
    return "Basic " + hash;
}

export const isValidPhone = (phoneValue) => {
    //let phoneno = /^\+?([0-9]{3})\)?[-. ]?([0-9]{8,11})$/;
    let phoneno = /^(\+|00)?([0-9]{3})\)?[-. ]?([0-9]{8,11})$/;
    return !!phoneValue.match(phoneno);
}
export const isValidMdp = (mdpValue) => {
    let cmp = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#!_&$()%*-])([a-zA-Z0-9@#!_&$()%*-]+){8}$/;
    return !!mdpValue.match(cmp);
}
export const cleanPhoneNumber = (phoneValue) => {
    if (phoneValue!=="") {
        return "00" + phoneValue.replace("+", "").replace("-", "").replace("00", "");
    } else {
        return phoneValue
    }
    
}

export const cleanPhoneNumber2 = (phoneValue) => {
    if (phoneValue!=="") {
        return phoneValue.replace("00", "+");
    } else {
        return phoneValue
    }
    
}
export const cleanPhoneNumber3 = (phoneValue) => {
    if (phoneValue!=="") {
        return phoneValue.replace("+", "");
    } else {
        return phoneValue
    }
    
}
export const today = (items)=>{
    return new Intl.DateTimeFormat("fr-FR", {year: "numeric", month: "2-digit", day: "2-digit"}).format(new Date(Date.now()));
}
export const groupBy = (array, key) => {
    // Vérifier si `array` est bien un tableau
    if (!Array.isArray(array)) {
        return {}; // retourner un objet vide si ce n'est pas un tableau
    }

    // Retourner le résultat final
    return array.reduce((result, currentValue) => {
        // Si un tableau est déjà présent pour la clé, on ajoute l'élément, sinon on crée un nouveau tableau
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result; // Accumuler le résultat à chaque itération
    }, {}); // L'objet vide est la valeur initiale du résultat
};
export const hexToRgb = (hex) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
export const isValidDate = (dateValue) => {
    try {
        let dateValueArray = dateValue.split("-")
        let usableDateValue = new Date(dateValueArray[1] + "/" + dateValueArray[0] + "/" + dateValueArray[2])//.toISOString().split("T")[0];
        let today = new Date();
        return usableDateValue <= today;
    } catch (e) {

    }
}

export const isEmpty = (obj) => {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

export const isSettingComplete = () => {
    let errors = []
    let ps;
    let postes;
    let langues;
    let objets;
    let recours;
    let utilisateurs;
    let supports;
    let produits;
    try{
        postes = JSON.parse(loadItemFromLocalStorage('app-postes'));
        ps = JSON.parse(loadItemFromLocalStorage('app-ps'));
        langues = JSON.parse(loadItemFromLocalStorage('app-langues'));
        objets = JSON.parse(loadItemFromLocalStorage('app-objets'));
        recours = JSON.parse(loadItemFromLocalStorage('app-recours'));
        utilisateurs = JSON.parse(loadItemFromLocalStorage('app-users'));
        supports = JSON.parse(loadItemFromLocalStorage('app-supports'));
        produits = JSON.parse(loadItemFromLocalStorage('app-produits'));
    }
    catch (e) {
        postes=[];
        ps=[];
        langues=[];
        objets=[];
        recours=[];
        utilisateurs=[];
        supports=[];
        produits=[];
    }
    if (langues.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Langues")
    }
    if (ps.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Points de service")
    }
    if (postes.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Postes")
    }
    if (supports.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Supports de collecte")
    }
    if (objets.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Objets")
    }
    if (produits.length===0) {
        errors.push("Veuillez finaliser le paramétrage des Produits et/ou Services")
    }
    return errors
   
}

export const cleanDate = (dateValue, locale = 'fr-FR') => {
    //console.log("datevalue",dateValue.getHours())
    try {
        let jour = (dateValue.getDate()) < 10 ? "0"+(dateValue.getDate()) : dateValue.getDate()
        let month = (dateValue.getMonth() + 1) < 10 ? "0"+(dateValue.getMonth() + 1) : dateValue.getMonth() + 1
        let hour = (dateValue.getHours() ) < 10 ? "0"+(dateValue.getHours()) : dateValue.getHours()
        let minutes = (dateValue.getMinutes() ) < 10 ? "0"+(dateValue.getMinutes()) : dateValue.getMinutes()
        return jour + "-" + month + "-" + dateValue.getFullYear() + " " + hour + ":" + minutes
    } catch (e) {

    }
}

export const handleDatePicker = (date, props) => {
    props.recordedAtDPChanged(date)
    props.recordedAtChanged(cleanDate(date))
}

export const guessExtension = (attachment) => {
    let icon = unknownIcon;
    if (attachment.name.split(".")[1] === "pdf") {
        icon = pdfIcon
    }
    if (attachment.name.split(".")[1] === "csv") {
        icon = excelIcon
    }
    if (attachment.name.split(".")[1]=== "xlsx" || attachment.name.split(".")[1] === "xls") {
        icon = excelIcon
    }
    if (attachment.name.split(".")[1] === "docx" || attachment.name.split(".")[1] === "doc" || attachment.name.split(".")[1] === "rtf" || attachment.name === "document") {
        icon = wordIcon
    }
    if (attachment.name.split(".")[1] === "jpg" || attachment.name.split(".")[1] === "png" || attachment.name.split(".")[1] === "jpeg") {
        icon = imageIcon
    }
    if (attachment.name === "image" || attachment.name === "sticker" || attachment.name.split(".")[1] === "jpeg") {
        icon = imageIcon
    }
    if (attachment.name.split(".")[1] === "mp3" || attachment.name.split(".")[1] === "ogg" || attachment.name.split(".")[1] === "wav") {
        icon = audioIcon
    }
    if (attachment.name === "audio" || attachment.name === "ptt") {
        icon = audioIcon
    }
    if (attachment.name.split(".")[1] === "mp4" || attachment.name === "video") {
        icon = videoIcon
    }
    return icon;
}

export const formatDate = (date) => {
    let createdAt = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
    return (createdAt)
}


export const convertToCsv = (objArray)=> {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line !== '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}
export const generateString  = (count)=>{
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < count) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;

}

export const selectableYears = (startYear)=>{
    let currentYear = new Date().getFullYear(), years = [];
    startYear = startYear || 1980;
    while ( startYear <= currentYear ) {
        years.push(startYear++);
    }
    return years.reverse();
}
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const normalizeStats = (value) => {

    //if value contains NaN
    if (value.toString().indexOf("NaN") !== -1) {
        return "-"
    } else {
        //else  if value ends with or contains %
        let endsWithPercent = value.toString().endsWith("%");
        let valueToNormalize = parseFloat(endsWithPercent ? value.toString().slice(0, -1) : value)
        let unit = endsWithPercent ? "%" : ""
        //normalize to 2 digits decimal maximum
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(valueToNormalize) + "" + unit
    }

}
export const base64ToImage = (base64, width, height) => {
    //console.log("base64 before conversion to image")
    //console.log(base64)
    let image = new Image()
    image.width = width
    image.height = height
    image.src = base64
    //console.log("image after conversion from base64")
    //console.log(image)
}

export const resizeImage = async (imageBase64, width, height) => {
    // return new Promise(resolve => {
    //     setTimeout(() => {
    //
    //         resolve('resolved');
    //console.log("imageBase64 = \n")
    //console.log(imageBase64)
    let imageFile = await base64ToImage(imageBase64, width, height)
    //console.log("imageFile = \n")
    //console.log(JSON.stringify(imageFile))

    let MAX_WIDTH = width
    let MAX_HEIGHT = height

    let imgWidth = imageFile.width
    let imgHeight = imageFile.height

    if (imgWidth > imgHeight) {
        if (imgWidth > MAX_WIDTH) {
            imgHeight = imgHeight * (MAX_WIDTH / imgWidth)
            imgWidth = MAX_WIDTH
        }
    } else {
        if (imgHeight > MAX_HEIGHT) {
            imgWidth = imgWidth * (MAX_HEIGHT / imgHeight)
            imgHeight = MAX_HEIGHT
        }
    }


    let canvas = document.createElement('canvas');
    canvas.width = imgWidth
    canvas.height = imgHeight
    let ctx = canvas.getContext("2d");


    ctx.drawImage(imageFile, 0, 0, width, height)
    //console.log("imageFile.type = "+imageFile.type)
    //console.log("canvas.toDataURL(imageFile.type) = ")
    //console.log(canvas.toDataURL(imageFile.type))
    return canvas.toDataURL("image/png")
    //     }, 2000);
    // });
}



