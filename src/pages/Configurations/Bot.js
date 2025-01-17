import React, { useEffect, useState } from "react";


import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';

import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import axios from "axios";
import { licenseInfo } from "../../apis/LoginApi";
import { QRCode } from 'react-qrcode-logo';
import { Button, Chip } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { QrCode } from "@mui/icons-material";

const Bot = (props) => {

    const [form, setForm] = useState({ libelle: "", number: "" });

    const [createSession, setCreateSession] = useState({
        isLoading: false,
        showMessage: false,
        message: "",
        isSuccess: false,
        isGenerate: false,
        qrCode: null,
        items: null,

    })

    const [bots, setBots] = useState([])


 


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const getQrcode = (token) => {
        const number = form.number.trim();
        createSession.isLoading = true
        createSession.isGenerate = false
        createSession.showMessage = false


        axios.get(`http://localhost:21465/api/${number}_session/qrcode-session`, {
            headers: {
                'Authorization': "Bearer " + token
            }
        }).then(({ data }) => {

            // console.log('data qrcode', data)
        }).catch((err) => {
            console.log('err', err)
        }).finally(() => {
            createSession.isLoading = false
            createSession.isGenerate = true
        })

    }
    const generateToken = (session) => {
        return axios.post(`http://localhost:21465/api/${session}/THISISMYSECURETOKEN/generate-token`)
    }
    const createNewSession = (e,sessionPass="vide") => {
        const number = form.number.trim();
        const label = form.libelle.trim().replace(/[\/?&= ]/g, '_');
        const url = sessionPass ==="vide" ? `${number}_wpp_${label}`:sessionPass

       
        if(sessionPass === "vide" &&( label === "" || number === "")){
            return false
        }else{
            setCreateSession((prevState) => ({
                ...prevState,
                isLoading: true,
                isGenerate: false,
                showMessage: false,
            }));
            generateToken(url).then(({ data }) => {
                axios.post(`http://localhost:21465/api/${url}/start-session`, {
                    "webhook": "http://localhost:8080/api/v1/webhook/save",
                    "waitQrCode": true
                }, {
                    headers: {
                        'Authorization': `Bearer ${data?.token ?? 'vide'}`
                    }
                }).then(({ data }) => {
                    setCreateSession({
                        isLoading: false,
                        isGenerate: true,
                        isSuccess: true,
                        qrCode: data.urlcode ?? "Aucune URL reçue",
                    });
                }).catch((err) => {
                    console.error('Erreur de création de session:', err);
                    setCreateSession({
                        isLoading: false,
                        isGenerate: true,
                        isSuccess: false,
                        message: "Échec de la création de session. Veuillez réessayer.",
                    });
                });
            }).catch((err) => {
                console.log('err', err)
            })
        }
    
        

        
    };

    
    const getAllSessions = () => {

        axios.get(`http://localhost:21465/api/THISISMYSECURETOKEN/show-all-sessions`).then(({ data }) => {
            const result = data?.response?.map((da) => {
                return { name: da.split("_wpp_")[1] ?? "Non Defini", number: da.split("_wpp_")[0], session: da, color: "info", message: 'No check', status: false }
            }) ?? []
            console.log('result', result)
            setBots(result);
        }).catch((err) => {
            console.log('err', err)
        })

    }
    const checkConnection = (session) => {

        generateToken(session).then(({ data }) => {
            const token = data.token
            axios.get(`http://localhost:21465/api/${session}/check-connection-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(({ data }) => {
                const result = bots.map((er) => {
                    if (er.session === session) {
                        return { ...er, ...data }
                    }
                    return er
                })
                setBots(result)
            }).catch((err) => {
                console.log('err', err)
            })
        }).catch((err) => {
            console.log('err generator', err)

        })


    }
    const logoutSession = (session) => {

        generateToken(session).then(({ data }) => {
            const token = data.token
            axios.post(`http://localhost:21465/api/${session}/logout-session`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(({ data }) => {
                getAllSessions()
            }).catch((err) => {
                console.log('err', err)
            })
        }).catch((err) => {
            console.log('err generator', err)

        })


    }






    useEffect(() => {


        getAllSessions()
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

    }, []);

    let columns = [
        {
            key: "name",
            text: "Intitulé",
            className: "name",
            align: "left",
            sortable: true,
        },
        {
            key: "number",
            text: "Numéro de téléphone",
            className: "number",
            align: "left",
            sortable: true
        },
        {
            key: "message",
            text: "Status",
            className: "number",
            align: "left",
            sortable: false
        },

        {
            key: "action",
            text: "Actions",
            className: "action",
            align: "left",
            cell: (sessions) => {

                return <div style={{ display: 'flex', width: "fit-content" }}>

                    <Chip label="Vérifier connexion" onClick={(e) => { checkConnection(sessions.session) }} />
                    {
                        sessions.message !== "No check" && (sessions.status ?
                            <Chip label="Disconnect" onClick={(e) => { logoutSession(sessions.session) }} color="error" style={{ marginLeft: "5px" }} /> :
                            <Chip label="Connect" color="info" style={{ marginLeft: "5px" }} />)
                    }


                </div>



            }
        },

    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
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
    const rowClickedHandler = (event, data, rowIndex) => {
        console.log('data', data)
    }


    const licenseControl = async () => {
        try {
            await licenseInfo();


        } catch (error) {
            console.error("Une erreur s'est produite :", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await licenseControl();
        };

        fetchData();
    }, []);

    let errors = {};



    const handleSubmit = (e) => {
        e.preventDefault()



    }



    return (
        <>
            <div className="row">
                <div className="col s12 m4">
                    <div className="card-panel">
                        <div className="row">
                            <div className="col s12"><h6 className="card-title">Configuration GPR BOT</h6>
                                <p>Il s'agit de configurer GPR BOT pour recevoir vos réclamations / suggestion depuis vos réseaux sociaux</p></div>
                        </div>
                        <form id="accountForm" onSubmit={handleSubmit}>
                            <div className="row">


                                <div className="col s12 m12">
                                    <div className="row">

                                        <div className="col s12 input-field">
                                            <input id="apisecret" placeholder="" name="libelle" type="text"
                                                className="validate" value={form.libelle} onChange={handleFormChange} maxLength="36"
                                                data-error=".errorTxt1" />
                                            <label htmlFor="apisecret" className={"active"}>Intitulé &nbsp;
                                                <span className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                                    data-tooltip="NOM DE LA SESSION">
                                                    <HelpIcon />
                                                </span></label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error"></div>
                                            </small>

                                        </div>
                                        <div className="col s12 input-field">
                                            <input id="apikey" placeholder="" name="number" type="tel"
                                                className="validate" value={form.number} onChange={handleFormChange} maxLength="12"
                                                data-error=".errorTxt1" />
                                            <label htmlFor="apikey" className={"active"}>Numero de téléphone &nbsp;
                                                <span className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom"
                                                    data-tooltip="NUMERO DE TELEPHONE WHATSAPP">
                                                    <HelpIcon />
                                                </span></label>
                                            <small className="errorTxt4">
                                                <div id="cpassword-error" className="error"></div>
                                            </small>
                                        </div>
                                        <div className="col s12 display-flex justify-content-center">
                                            {createSession.isLoading ? (
                                                <div>En cours de chargement...</div>
                                            ) : createSession.qrCode ? (
                                                <QRCode value={createSession.qrCode} size={400} bgColor="#FFFFFF" fgColor="#005081" />
                                            ) : createSession.isGenerate && (
                                                <div>Pas de QR Code, réessayez.</div>
                                            )}


                                        </div>

                                        <div className="">



                                            <LoadingButton
                                                className="btn  waves-light  btn-small col s12 display-flex justify-content-start mt-3"
                                                onClick={createNewSession}
                                                loading={props.etat}
                                                loadingPosition="end"
                                                endIcon={<QrCode />}
                                                variant="contained"
                                                sx={{ textTransform: "initial" }}
                                            >
                                                <span>Créer une nouvelle session</span>
                                            </LoadingButton>
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </form>

                    </div>

                </div>
                <div className="col s12 m8">
                    <div className="card-panel">
                        <div className="row">
                            <div className="col s12"><h6 className="card-title">Liste des appareils connectes</h6>
                                <p>Il s'agit de la liste des appareils connectes</p></div>
                        </div>
                        <div className="row">
                            <div className="col s12">
                                <ReactDatatable
                                    className={"responsive-table table-xlsx app-categories"}
                                    config={config}
                                    records={bots}
                                    columns={columns}
                                    onRowClicked={rowClickedHandler}
                                />
                            </div>
                        </div>

                    </div>
                </div>

            </div>


        </>
    )
}

export default Bot