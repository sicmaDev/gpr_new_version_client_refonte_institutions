import React, { useEffect, useState, useRef } from "react";
import ReactDatatable from '@ashvin27/react-datatable';
import Select, { StylesConfig } from 'react-select'
import chroma from 'chroma-js';
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip, IconButton } from "@mui/material";
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import {
    descriptionChanged, idChanged,
    itemsChanged, posteErrors,
    libelleChanged,
    selectedItemChanged,
    habilitationsChanged,
    cardChanged,
    etat2Changed,
    etatChanged,
    etat3Changed
} from "../../redux/actions/Configurations/PostesActions";
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { modalify } from "../../Utils/modal";
import { connect } from "react-redux";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/PostesApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import { colourOptions } from '../../assets/js/multiSelectData';
import { Card, CardContent, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { KTApp } from "../../Utils/blockui";
const colourStyles = {
    control: (styles) => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: isDisabled
                ? undefined
                : isSelected
                    ? data.color
                    : isFocused
                        ? color.alpha(0.1).css()
                        : undefined,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? chroma.contrast(color, 'white') > 2
                        ? 'white'
                        : 'black'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',

            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled
                    ? isSelected
                        ? data.color
                        : color.alpha(0.3).css()
                    : undefined,
            },
        };
    },
    multiValue: (styles, { data }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
        };
    },
    multiValueLabel: (styles, { data }) => ({
        ...styles,
        color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
        ...styles,
        color: data.color,
        ':hover': {
            backgroundColor: data.color,
            color: 'white',
        },
    }),
};



const Postes = (props) => {

    const [deleteIsLoading, setDeleteIsLoading] = useState(false);
    const [createIsLoading, setCreateIsLoading] = useState(false);
    const [updateIsLoading, setUpdateIsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [cadre, setCadre] = useState([]);
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

    const handleChange = (e) => {
        //console.log(props.habilitations)
        if (props.habilitations) {
            // console.log("eeeeeeeeeeee",e )
            // setCadre(e)
            props.habilitationsChanged(Array.isArray(e) ? e : [])
        } else {
            // console.log("eff",e )
            setCadre(Array.isArray(e) ? e.map(x => x.value) : []);
        }
        //setCadre(e)
    }

    const topRef = useRef(null);
    useAutoScroll(topRef, [props.selectedItem.id], "top");

    useEffect(() => {
        if (props.habilitations) {
            let tab = Array.isArray(props.habilitations) ? (props.habilitations).map(x => x.value) : ""
            // console.log("fhvbhevjjvh",tab)
            tab.includes("H1") ? setH1(<Typography ><span style={{ fontWeight: "bold", color: "#00B8D9" }}>H1</span> : Enregistrer une réclamation, suggestion, dénonciation </Typography>) : setH1("")
            tab.includes("H2") ? setH2(<Typography ><span style={{ fontWeight: "bold", color: "#0052CC" }}>H2</span> : Traitement d'une réclamation, dénonciation à risque mineur</Typography>) : setH2("")
            tab.includes("H3") ? setH3(<Typography ><span style={{ fontWeight: "bold", color: "#5243AA" }}>H3</span> : Traitement d'une réclamation, dénonciation à risque moyen</Typography>) : setH3("")
            tab.includes("H4") ? setH4(<Typography ><span style={{ fontWeight: "bold", color: "#FF5630" }}>H4</span> : Traitement d'une réclamation, dénonciation à risque élevé </Typography>) : setH4("")
            tab.includes("H5") ? setH5(<Typography ><span style={{ fontWeight: "bold", color: "#FF8B00" }}>H5</span> : Mesurer la satisfaction d'une réclamation</Typography>) : setH5("")
            tab.includes("H6") ? setH6(<Typography ><span style={{ fontWeight: "bold", color: "#FFC400" }}>H6</span> : Affecter le traitement d'une réclamation, dénonciation à un utilisateur </Typography>) : setH6("")
            tab.includes("H7") ? setH7(<Typography ><span style={{ fontWeight: "bold", color: "#36B37E" }}>H7</span> : Imprimer la liste des réclamations, suggestions, dénonciations </Typography>) : setH7("")
            tab.includes("H8") ? setH8(<Typography ><span style={{ fontWeight: "bold", color: "#00875A" }}>H8</span> : Imprimer la liste des réclamations, suggestions, dénonciation avec le choix des critères </Typography>) : setH8("")
            tab.includes("H9") ? setH9(<Typography ><span style={{ fontWeight: "bold", color: "#253858" }}>H9</span> : Exporter la liste des réclamations, suggestions, dénonciations</Typography>) : setH9("")
            tab.includes("H10") ? setH10(<Typography ><span style={{ fontWeight: "bold", color: "#666666" }}>H10</span> : Exporter la liste des réclamations, suggestions, dénonciations avec le choix des critères</Typography>) : setH10("")
            tab.includes("H11") ? setH11(<Typography ><span style={{ fontWeight: "bold", color: "#3333ff" }}>H11</span> : Générer des rapports et statistiques</Typography>) : setH11("")
            tab.includes("H12") ? setH12(<Typography ><span style={{ fontWeight: "bold", color: "#99003d" }}>H12</span> : Configurer l'outil de gestion de plainte ou réclamation</Typography>) : setH12("")
            tab.includes("H13") ? setH13(<Typography ><span style={{ fontWeight: "bold", color: "#00cc00" }}>H13</span> : Consulter les Alerte de retard de traitement </Typography>) : setH13("")
            tab.includes("H14") ? setH14(<Typography ><span style={{ fontWeight: "bold", color: "#333300" }}>H14</span> : Consulter toutes les informations </Typography>) : setH14("")
        } else {
            cadre.includes("H1") ? setH1(<Typography ><span style={{ fontWeight: "bold", color: "#00B8D9" }}>H1</span> : Enregistrer une réclamation, suggestion, dénonciation </Typography>) : setH1("")
            cadre.includes("H2") ? setH2(<Typography ><span style={{ fontWeight: "bold", color: "#0052CC" }}>H2</span> : Traitement d'une réclamation, dénonciation à risque mineur </Typography>) : setH2("")
            cadre.includes("H3") ? setH3(<Typography ><span style={{ fontWeight: "bold", color: "#5243AA" }}>H3</span> : Traitement d'une réclamation, dénonciation à risque moyen </Typography>) : setH3("")
            cadre.includes("H4") ? setH4(<Typography ><span style={{ fontWeight: "bold", color: "#FF5630" }}>H4</span> : Traitement d'une réclamation, dénonciation à risque élevé </Typography>) : setH4("")
            cadre.includes("H5") ? setH5(<Typography ><span style={{ fontWeight: "bold", color: "#FF8B00" }}>H5</span> : Mesurer la satisfaction d'une réclamation</Typography>) : setH5("")
            cadre.includes("H6") ? setH6(<Typography ><span style={{ fontWeight: "bold", color: "#FFC400" }}>H6</span> : Affecter le traitement d'une réclamation, dénonciation à un utilisateur </Typography>) : setH6("")
            cadre.includes("H7") ? setH7(<Typography ><span style={{ fontWeight: "bold", color: "#36B37E" }}>H7</span> :  Imprimer la liste des réclamations, suggestions, dénonciations</Typography>) : setH7("")
            cadre.includes("H8") ? setH8(<Typography ><span style={{ fontWeight: "bold", color: "#00875A" }}>H8</span> : Imprimer la liste des réclamations, suggestions, dénonciation avec le choix des critères</Typography>) : setH8("")
            cadre.includes("H9") ? setH9(<Typography ><span style={{ fontWeight: "bold", color: "#253858" }}>H9</span> : Exporter la liste des réclamations, suggestions, dénonciations</Typography>) : setH9("")
            cadre.includes("H10") ? setH10(<Typography ><span style={{ fontWeight: "bold", color: "#666666" }}>H10</span> : Exporter la liste des réclamations, suggestions, dénonciations avec le choix des critères </Typography>) : setH10("")
            cadre.includes("H11") ? setH11(<Typography ><span style={{ fontWeight: "bold", color: "#3333ff" }}>H11</span> : Générer des rapports et statistiques</Typography>) : setH11("")
            cadre.includes("H12") ? setH12(<Typography ><span style={{ fontWeight: "bold", color: "#99003d" }}>H12</span> : Configurer l'outil de gestion de plainte ou réclamation</Typography>) : setH12("")
            cadre.includes("H13") ? setH13(<Typography ><span style={{ fontWeight: "bold", color: "#00cc00" }}>H13</span> : Consulter les Alerte de retard de traitement </Typography>) : setH13("")
            cadre.includes("H14") ? setH14(<Typography ><span style={{ fontWeight: "bold", color: "#333300" }}>H14</span> : Consulter toutes les informations </Typography>) : setH14("")
        }
    }, [cadre, props.habilitations]);

    const habilitationDescriptions = {
        H1: "Enregistrer une réclamation, suggestion, dénonciation",
        H2: "Traitement d'une réclamation, dénonciation à risque mineur",
        H3: "Traitement d'une réclamation, dénonciation à risque moyen",
        H4: "Traitement d'une réclamation, dénonciation à risque élevé",
        H5: "Mesurer la satisfaction d'une réclamation",
        H6: "Affecter le traitement d'une réclamation, dénonciation à un utilisateur",
        H7: "Imprimer la liste des réclamations, suggestions, dénonciations",
        H8: "Imprimer la liste des réclamations, suggestions, dénonciation avec le choix des critères",
        H9: "Exporter la liste des réclamations, suggestions, dénonciations",
        H10: "Exporter la liste avec le choix des critères",
        H11: "Générer des rapports et statistiques",
        H12: "Configurer l'outil de gestion de plainte ou réclamation",
        H13: "Consulter les Alerte de retard de traitement",
        H14: "Consulter toutes les informations"
    };

    useEffect(() => {

        KTApp.blockPage({
            overlayColor: "#000000",
            type: "v2",
            state: "danger",
            message: "En cours de chargement...",
        });
        setIsLoading(true);

        setH1(<Typography > <span style={{ fontWeight: "bold", color: "#00B8D9" }}>H1</span>  : Enregistrement</Typography>)
        setH2(<Typography ><span style={{ fontWeight: "bold", color: "#0052CC" }}>H2</span> : Traitement mineure</Typography>)
        setCadre(["H1", "H2"])
        liste(props).then((r) => { }).finally(() => {
            setIsLoading(false);
            KTApp.unblockPage();
        });
        //UI Fixes

        window.$('.dropdown-trigger').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false, // Does not change width of dropdown to that of the activator
            click: true, // Activate on hover
            gutter: 0, // Spacing from edge
            coverTrigger: false, // Displays dropdown below the button
            alignment: 'left', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        }
        );

        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({ marginTop: "1%", boxShadow: "none" })
        window.$('ul.pagination').parent().css({ boxShadow: "none" })
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')
        window.$('.tooltipped').tooltip();

        //cleanup
        return clearComponentState();
    }, []);

    const getHabilitationColor = (hab) => {
        switch (hab) {
            case "H1": return "#00B8D9";
            case "H2": return "#0052CC";
            case "H3": return "#5243AA";
            case "H4": return "#FF5630";
            case "H5": return "#FF8B00";
            case "H6": return "#FFC400";
            case "H7": return "#36B37E";
            case "H8": return "#00875A";
            case "H9": return "#253858";
            case "H10": return "#666666";
            case "H11": return "#3333ff";
            case "H12": return "#99003d";
            case "H13": return "#00cc00";
            case "H14": return "#333300";
            default: return "#ff0000";
        }
    };
    let columns = [
        {
            key: "libelle",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
        },
        {
            key: "description",
            text: "Description",
            className: "description",
            align: "left",
            sortable: true
        },
        {
            key: "habilitations",
            text: "Habilitations",
            className: "habilitations",
            align: "left",
            sortable: true,
            cell: (sp) => {
                let habs = sp.habilitations ? sp.habilitations.split(",") : [];
                habs = habs
                    .map(h => h.trim())
                    .sort((a, b) => Number(a.replace("H", "")) - Number(b.replace("H", "")));
                return (
                    <Stack direction="row" spacing={0.25} flexWrap="wrap" sx={{ width: 'max-content' }}>
                        {habs.map((h, i) => (
                            <Chip
                                key={i}
                                label={h}
                                color="primary"
                                sx={{
                                    backgroundColor: getHabilitationColor(h), color: 'white',
                                    // borderColor: getHabilitationColor(h.trim()),
                                    // color: getHabilitationColor(h.trim()),
                                }}
                                // variant="outlined"
                                size="small"
                            />
                        ))}
                    </Stack>
                );
            },
        },
        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            sortable: true,
            cell: (sp) => {
                return (
                    <>
                        <div style={{ display: "flex", gap: "5px" }}>
                            <Tooltip title="Modifier">
                                <IconButton onClick={handleEditClick(sp)} color="primary"><EditIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <IconButton onClick={(e) => handleModal(e, sp)} color="error"><DeleteIcon /></IconButton>
                            </Tooltip>
                        </div>
                    </>
                )
            }
        },
    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Postes",
        button: {
            //excel: true,
            //pdf: true,
            //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records: "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon />,
                previous: <ChevronLeftIcon />,
                next: <ChevronRightIcon />,
                last: <LastPageIcon />
            }
        }
    }

    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if ((props.libelle === "" || props.libelle === undefined || props.libelle === null)) {
            isValid = false;
            errors["libelle"] = "Champ incorrect";
        }
        // if ((props.description === "" || props.description === undefined || props.description === null)) {
        //     isValid = false;
        //     errors["description"] = "Champ incorrect";
        // }
        return isValid
    }
    const handleSubmit = (e) => {

        // console.log("hab",cadre.toString())
        e.preventDefault()
        if (handleValidation()) {
            setCreateIsLoading(true)
            let item = {}
            item["libelle"] = props.libelle;
            item["description"] = props.description;
            item["habilitations"] = cadre.toString();

            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            }).finally(() => {
                setCreateIsLoading(false)
            })
            clearComponentState()
        } else {
        }
        props.posteErrors(errors)
    }

    function clearComponentState() {
        props.idChanged("")
        props.libelleChanged("")
        props.descriptionChanged("")
        props.habilitationsChanged("")
        props.selectedItemChanged({})
    }


    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            setUpdateIsLoading(true)
            //Create updated version of selected item

            let tab = Array.isArray(props.habilitations) ? (props.habilitations).map(x => x.value) : ""

            let item = {}
            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["description"] = props.description;
            item["habilitations"] = tab.toString();

            // console.log("edit", tab.toString())
            props.etat2Changed(true)
            modification(item, props).then(() => {
                handleCancel(e)
            }).finally(() => {
                setUpdateIsLoading(false)
            })
            clearComponentState()
        }
        else {
        }
        props.posteErrors(errors)
    }
    const handleModal = (e, sp) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", (e) => handleDelete(e, sp))
    }
    const handleEditModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la modification de cet élément?", "confirm", handleEdit)
    }
    const handleDelete = (e, sp) => {
        e.preventDefault()

        props.etat3Changed(true)
        setDeleteIsLoading(true)
        suppression(props, sp).then(() => {
            handleCancel(e)
        }).finally(() => {
            setDeleteIsLoading(false)
        })
        clearComponentState()
        props.posteErrors(errors)
    }
    const handleEditClick = (sp) => (e) => {
        rowClickedHandler(e, sp, null)
    }

    const rowClickedHandler = (event, data, rowIndex) => {

        let tab = []
        for (let i = 0; i < ((data.habilitations).split(",")).length; i++) {

            let couleur = (((data.habilitations).split(","))[i]) === "H1" ? "#00B8D9" : "H2" ? "#0052CC" : "H3" ? "#5243AA" : "H4" ? "#FF5630" : "H5" ? "#FF8B00" : "H6" ? "#FFC400" : "H7" ? "#36B37E" : "H8" ? "#00875A" : "H9" ? "#253858" : "H10" ? "#666666" : "H11" ? "#3333ff" : "H12" ? "#99003d" : "H13" ? "#00cc00" : "H14" ? "#333300" : "#ff0000";
            // let couleur = (((data.habilitations).split(","))[i]) == "H1" ? "#00B8D9" : "H2" ? "#0052CC" : "H3" ? "#5243AA" : "" ;
            const element = { value: ((data.habilitations).split(","))[i], label: ((data.habilitations).split(","))[i], color: couleur };
            tab.push(element)
        }

        props.idChanged(data.id)
        props.libelleChanged(data.libelle)
        props.habilitationsChanged(tab)
        //setCadre([colourOptions[0]])
        props.descriptionChanged(data.description)
        props.selectedItemChanged(data)

        //console.log("cadreeeeeeeeee",cadre)
    }
    const tableChangeHandler = data => {
    }

    let titleText = props.selectedItem.id !== undefined ? "Modifier ou Supprimer" : "Ajouter";

    let buttons = props.selectedItem.id !== undefined ?
        (<>
            <LoadingButton
                className="btn waves-effect waves-light mr-1 btn-small red-text white lighten-4"
                onClick={(e) => handleCancel(e)}
                loading={props.etat2}
                loadingPosition="end"
                endIcon={<CancelIcon />}
                variant="contained"
                sx={{ textTransform: "initial" }}
            >
                <span>Annuler</span>
            </LoadingButton>

            <LoadingButton
                className="btn waves-effect waves-light mr-1 btn-small"
                onClick={(e) => handleEditModal(e)}
                loading={updateIsLoading}
                loadingPosition="end"
                endIcon={<SaveIcon />}
                variant="contained"
                sx={{ textTransform: "initial" }}
            >
                <span>Modifier</span>
            </LoadingButton>

        </>)
        :
        (
            <LoadingButton
                className="btn waves-effect waves-light mr-1 btn-small"
                onClick={(e) => handleSubmit(e)}
                loading={createIsLoading}
                loadingPosition="end"
                endIcon={<SaveIcon />}
                variant="contained"
                sx={{ textTransform: "initial" }}
            >
                <span>Ajouter</span>
            </LoadingButton>

        );

    return (
        <>
            <div className="card-panel" ref={topRef}>
                <form className="paaswordvalidate" >
                    <div className="row">
                        <div className="col s12">
                            <h6 className="card-title">{titleText} un Poste</h6>
                            <p>Il s'agit d'enregistrer les Postes existants au sein de votre institution</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col s6">
                            <div className="col s12">
                                <div className="input-field">
                                    <input id="jname" name="libelle" type="text"
                                        placeholder=""
                                        data-error=".errorTxt4"
                                        value={props.libelle}
                                        onChange={(e) => props.libelleChanged(e.target.value)} />
                                    <label htmlFor="jname" className={"active"}>Intitulé&nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Directeur Générale, RA, etc.. ">
                                            <HelpIcon />
                                        </a>
                                    </label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.libelle}</div>
                                    </small>
                                </div>
                            </div>
                            <div className="col s12 input-field">
                                <textarea id="jdescription" name="description" type="text"
                                    placeholder=""
                                    className="validate materialize-textarea" value={props.description}
                                    onChange={(e) => props.descriptionChanged(e.target.value)}
                                    data-error=".errorTxt2" />
                                <label htmlFor="jdescription" className={"active"}>Description&nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Description du poste">
                                        <HelpIcon />
                                    </a>
                                </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.description}</div>
                                </small>
                            </div>
                            <div className="col s12">
                                <div className="input-field">
                                    <Select
                                        classNamePrefix="react-select"
                                        className='react-select-container mt-4'
                                        closeMenuOnSelect={false}
                                        isMulti
                                        options={colourOptions}
                                        styles={colourStyles}
                                        placeholder="Sélectionner les habilitations"
                                        value={
                                            props.habilitations
                                                ? props.habilitations
                                                : (cadre.length == 0
                                                    ? [colourOptions[0], colourOptions[1]]
                                                    : colourOptions.filter(obj => cadre.includes(obj.value)))
                                        }
                                        onChange={handleChange}
                                        formatOptionLabel={(option, { context }) => {
                                            if (context === "menu") {
                                                return (
                                                    <div>
                                                        <div>{option.label}</div>
                                                        <div style={{ fontSize: '0.8em', color: '#555' }}>
                                                            {habilitationDescriptions[option.value]}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            // contexte = "value" → badges sélectionnés
                                            return option.label
                                        }}
                                    />
                                    <label htmlFor="ulevel" className="active mb-4" style={{ top: '-18%' }}>Habilitations&nbsp;</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.habilitations}</div>
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="col s6 mb-4">

                            <Card sx={{ minWidth: 275 }} style={{ borderLeft: "7px solid #059db1" }}>
                                <CardContent >
                                    <Typography style={{ textAlign: "center" }}>
                                        <h5 style={{ fontWeight: "bold" }}>Habilitations</h5>
                                    </Typography>
                                    <Typography component={'div'} >
                                        {h1}{h2}{h3}{h4}{h5}{h6}{h7}{h8}{h9}{h10}{h11}{h12}{h13}{h14}
                                    </Typography>

                                </CardContent>

                            </Card>

                        </div>




                        <div className="col s12 display-flex justify-content-end form-action">
                            {buttons}
                        </div>

                    </div>
                </form>

                <div className="row">
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content">
                                <div className="row">
                                    <div className="col l6 m6 s12">
                                        <h4 className="card-title">Liste des postes&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign: "end" }}>
                                        <img src={pdf} alt="" style={{ marginRight: "15px", cursor: "pointer" }} onClick={(e) => { handlePrint(config, columns, props.items, 0) }} />
                                        <img src={excel} alt="" style={{ cursor: "pointer" }} onClick={(e) => { table2XLSX("Liste_des_postes" + today().replaceAll("/", ""), "app-postes") }} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className={"responsive-table table-xlsx app-postes no-hover"}
                                            config={config}
                                            records={props.items}
                                            columns={columns}
                                            // onRowClicked={rowClickedHandler}
                                            onChange={tableChangeHandler}
                                        />
                                    </div>
                                </div>
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
        isLoading: state.poste.isLoading,
        id: state.poste.id,
        libelle: state.poste.libelle,
        habilitations: state.poste.habilitations,
        description: state.poste.description,
        items: state.poste.items,
        selectedItem: state.poste.selectedItem,
        errors: state.poste.poste_errors,
        etat: state.poste.etat,
        etat2: state.poste.etat2,
        etat3: state.poste.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        posteErrors: (err) => {
            dispatch(posteErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        libelleChanged: (libelle) => {
            dispatch(libelleChanged(libelle))
        },
        descriptionChanged: (description) => {
            dispatch(descriptionChanged(description))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
        habilitationsChanged: (habilitations) => {
            dispatch(habilitationsChanged(habilitations))
        },
        cardChanged: (card) => {
            dispatch(cardChanged(card))
        },
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
        etat2Changed: (etat2) => {
            dispatch(etat2Changed(etat2));
        },
        etat3Changed: (etat3) => {
            dispatch(etat3Changed(etat3));
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Postes)