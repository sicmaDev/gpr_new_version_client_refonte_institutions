import React, { useEffect } from "react";
import { compteDetailsErrors, emailChanged, etatChanged, firstnameChanged, idChanged, jobtitleChanged, lastnameChanged, phoneChanged, posteChanged } from "../../redux/actions/Compte/CompteDetailsActions";
import { loadItemFromLocalStorage, loadItemFromSessionStorage } from "../../Utils/utils";
import { connect } from "react-redux";
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import { modalify } from "../../Utils/modal";
import { CompteInfosApi } from "../../apis/Compte/CompteApi";
import { Card, CardContent, Typography } from "@mui/material";
import { useState } from "react";



const CompteDetails = (props) => {
    let mode = loadItemFromSessionStorage("app-mode") !== undefined ? JSON.parse(loadItemFromSessionStorage("app-mode")) : undefined;
    let user = loadItemFromSessionStorage("app-user") !== undefined ? (JSON.parse(loadItemFromSessionStorage("app-user"))) : undefined;
    let hbt = (user.posteDto.habilitations).split(',');
    let addR = (user.additionalRole);


    const [h1, setH1] = useState("");
    const [h2, setH2] = useState("");
    const [h3, setH3] = useState("");
    const [h4, setH4] = useState("");
    const [h5, setH5] = useState("");
    const [h6, setH6] = useState("");
    const [h7, setH7] = useState("");
    const [h8, setH8] = useState("");
    const [h9, setH9] = useState("");
    const [h10, setH10] = useState("");
    const [h11, setH11] = useState("");
    const [h12, setH12] = useState("");
    const [h13, setH13] = useState("");
    const [h14, setH14] = useState("");

    useEffect(() => {
        const sessionUser = JSON.parse(loadItemFromSessionStorage('app-user'))
        props.posteChanged(sessionUser.posteDto.libelle)
        props.idChanged(sessionUser.id)
        props.emailChanged(sessionUser.email)
        props.phoneChanged(sessionUser.tel)
        props.firstnameChanged(sessionUser.firstAndLastName)

        hbt.includes("H1") ? setH1(<Typography ><span style={{ fontWeight: "bold", color: "#00B8D9" }}>H1</span> : Enregistrer une réclamation, suggestion, dénonciation </Typography>) : setH1("")
        hbt.includes("H2") ? setH2(<Typography ><span style={{ fontWeight: "bold", color: "#0052CC" }}>H2</span> : Traitement d'une réclamation, dénonciation à risque mineur </Typography>) : setH2("")
        hbt.includes("H3") ? setH3(<Typography ><span style={{ fontWeight: "bold", color: "#5243AA" }}>H3</span> : Traitement d'une réclamation, dénonciation à risque moyen </Typography>) : setH3("")
        hbt.includes("H4") ? setH4(<Typography ><span style={{ fontWeight: "bold", color: "#FF5630" }}>H4</span> : Traitement d'une réclamation, dénonciation à risque élevé </Typography>) : setH4("")
        hbt.includes("H5") ? setH5(<Typography ><span style={{ fontWeight: "bold", color: "#FF8B00" }}>H5</span> : Mesurer la satisfaction d'une réclamation</Typography>) : setH5("")
        hbt.includes("H6") ? setH6(<Typography ><span style={{ fontWeight: "bold", color: "#FFC400" }}>H6</span> : Affecter le traitement d'une réclamation, dénonciation à un utilisateur </Typography>) : setH6("")
        hbt.includes("H7") ? setH7(<Typography ><span style={{ fontWeight: "bold", color: "#36B37E" }}>H7</span> :  Imprimer la liste des réclamations, suggestions, dénonciations</Typography>) : setH7("")
        hbt.includes("H8") ? setH8(<Typography ><span style={{ fontWeight: "bold", color: "#00875A" }}>H8</span> : Imprimer la liste des réclamations, suggestions, dénonciation avec le choix des critères</Typography>) : setH8("")
        hbt.includes("H9") ? setH9(<Typography ><span style={{ fontWeight: "bold", color: "#253858" }}>H9</span> : Exporter la liste des réclamations, suggestions, dénonciations</Typography>) : setH9("")
        hbt.includes("H10") ? setH10(<Typography ><span style={{ fontWeight: "bold", color: "#666666" }}>H10</span> : Exporter la liste des réclamations, suggestions, dénonciations avec le choix des critères </Typography>) : setH10("")
        hbt.includes("H11") ? setH11(<Typography ><span style={{ fontWeight: "bold", color: "#3333ff" }}>H11</span> : Générer des rapports et statistiques</Typography>) : setH11("")
        hbt.includes("H12") ? setH12(<Typography ><span style={{ fontWeight: "bold", color: "#99003d" }}>H12</span> : Configurer l'outil de gestion de plainte ou réclamation</Typography>) : setH12("")
        hbt.includes("H13") ? setH13(<Typography ><span style={{ fontWeight: "bold", color: "#00cc00" }}>H13</span> : Consulter les Alerte de retard de traitement </Typography>) : setH13("")
        hbt.includes("H14") ? setH14(<Typography ><span style={{ fontWeight: "bold", color: "#333300" }}>H14</span> : Consulter toutes les informations </Typography>) : setH14("")

    }, []);

    const handleModal = (e) => {
        e.preventDefault();
        modalify(
            "Confirmation",
            "Confirmez vous le changement de ses informations ? Vous devrez vous reconnectez après cela !",
            "confirm",
            handleSubmit
        );
    };



    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if ((props.firstname === "" || props.firstname === undefined || props.firstname === null)) {
            isValid = false;
            errors["firstname"] = "Champ incorrect";
        }
        if ((props.email === "" || props.email === undefined || props.email === null) || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)) {
            isValid = false;
            errors["email"] = "Champ incorrect";
        }
        if ((props.phone === "" || props.phone === undefined || props.phone === null) || props.phone.length < 8) {
            isValid = false;
            errors["phone"] = "Champ incorrect";
        }
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()

        let data = {}
        data["id"] = props.id;
        data["firstname"] = props.firstname;
        data["email"] = props.email;
        data["phone"] = props.phone;
        // console.log("datattta",data)
        if (handleValidation()) {
            props.etatChanged(true)
            CompteInfosApi(data, props, e)
        }
        else {
        }

        props.compteDetailsErrors(errors)
    }

    let btnOff;

    if (mode === 1) {
        btnOff =
            <>
                <div className="col s12 display-flex justify-content-end mt-3">
                    <LoadingButton
                        className="waves-effect waves-effect-b waves-light btn-small"
                        onClick={handleModal}
                        loading={props.etat}
                        loadingPosition="end"
                        endIcon={<SaveIcon />}
                        variant="contained"
                        sx={{ backgroundColor: "#1e2188", textTransform: "initial" }}
                    >
                        <span>Enregistrer</span>
                    </LoadingButton>
                </div>
            </>
    } else {
        btnOff =
            <>
                <div className="col s12 display-flex justify-content-end mt-3">
                    <div className="card-alert card red lighten-5" >
                        <div className="card-content red-text" style={{ textAlign: "center" }}>
                            <ul>
                                Vous ne pouvez pas changer les infos de votre compte en mode offline !
                            </ul>
                        </div>
                    </div>
                </div>
            </>

    }


    return (
        <>
            <div className="card-panel ">

                <form id="accountForm" >
                    <div className="row">

                        <div className="col l6 m12 s12 input-field">
                            <input id="poste" name="poste" type="text" readOnly
                                defaultValue={props.poste} placeholder={props.poste} />
                            <label htmlFor="poste" className={"active"}>Poste</label>
                        </div>

                        <div className="col l6 m12 s12 input-field">
                            <input id="firstname" name="firstname" type="text"
                                className="validate" defaultValue={props.firstname} placeholder={props.firstname} onChange={(e) => props.firstnameChanged(e.target.value)}
                                data-error=".errorTxt1" />
                            <label htmlFor="firstname" className={"active"}>Nom(s) et Prénom(s)</label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.firstname}</div>
                            </small>
                        </div>

                        <div className="col l6 m12 s12 input-field">
                            <input id="email" name="email" type="email" onChange={(e) => props.emailChanged(e.target.value)}
                                className=""
                                defaultValue={props.email} />
                            <label htmlFor="email" className={"active"}>Adresse électronique</label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.email}</div>
                            </small>
                        </div>

                        <div className="col l6 m12 s12 input-field">
                            <input id="phone" name="phone" type="tel" onChange={(e) => props.phoneChanged(e.target.value)}
                                defaultValue={props.phone}
                            />
                            <label htmlFor="phone" className={"active"}>Téléphone</label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.phone}</div>
                            </small>
                        </div>

                        {btnOff}


                    </div>
                </form>

            </div>

            <div className="card-panel " style={{ borderLeft: "7px solid #059db1" }}>
                <div className="row">
                    <div className="col l12 m12 s12 input-field">

                        <h5 style={{ fontWeight: "bold", textAlign: "center" }}>Habilitations</h5>

                        {h1}{h2}{h3}{h4}{h5}{h6}{h7}{h8}{h9}{h10}{h11}{h12}{h13}{h14}
                    </div>
                    <div className="mt-2" style={{ paddingTop: "60%" }}>
                        <div className="row pb-4 ml-2">
                            <div
                                className="col s11 mb-2"
                                style={{
                                    background: "#f5f9ff",
                                    borderLeft: "4px solid #1976d2",
                                    padding: "10px 5px",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <span style={{ fontWeight: "bold", marginRight: "12px" }}>Privilèges spécifiques : </span> {addR === "PILOTE" ? "Pilote Principal" : addR === "DE" ? "Directeur / Directrice (Executif, General,...)" : "Aucun"}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        isLoading: state.compte_details.isLoading,
        poste: state.compte_details.poste,
        id: state.compte_details.id,
        firstname: state.compte_details.firstname,
        email: state.compte_details.email,
        phone: state.compte_details.phone,
        etat: state.compte_details.etat,
        errors: state.compte_details.compte_details_errors,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        compteDetailsErrors: (err) => { dispatch(compteDetailsErrors(err)) },
        posteChanged: (poste) => {
            dispatch(posteChanged(poste))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        firstnameChanged: (firstname) => {
            dispatch(firstnameChanged(firstname))
        },
        emailChanged: (email) => {
            dispatch(emailChanged(email))
        },
        phoneChanged: (phone) => {
            dispatch(phoneChanged(phone))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat))
        },
    }
};
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CompteDetails)