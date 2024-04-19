import {itemsChanged, loading} from "../../redux/actions/Alertes/AlertesActions";
import React, {useEffect} from "react";
import ReactDatatable from "@ashvin27/react-datatable";
import { Link, NavLink } from "react-router-dom";
import { loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";
import { alertReclamationApi } from "../../apis/Alertes/AlertesApi";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from '@mui/icons-material/Menu';

const ReclamationsAlertes = (props) => {

    const clearComponentState = ()=> {
        props.itemsChanged([])
    }
    useEffect(() => {
        props.itemsChanged([])
        alertReclamationApi(props).then((r) => {});

        window.$('.buttons-excel').html('<span><i class="fa fa-file-excel"></i></span>')
        window.$('ul.pagination').parent().parent().css({marginTop: "1%", boxShadow: "none"})
        window.$('ul.pagination').parent().css({boxShadow: "none"})
        window.$('ul.pagination').parent().addClass('white')
        window.$('ul.pagination').addClass('right-align')
        window.$('a.page-link input').addClass('indigo-text bold-text')
        window.$('.pagination li.disabled a').addClass('black-text')
        window.$('#as-react-datatable').removeClass('table-bordered table-striped')
        window.$('#as-react-datatable').addClass('highlight display dataTable dtr-inline')
        window.$('#as-react-datatable tr').addClass('cursor-pointer')

        //cleanup
        return clearComponentState();
    }, []);
    
    let columns = [
        {
          key: "claimCode",
          text: "Code",
          className: "code",
          align: "left",
          sortable: true,
        },
        {
          key: "claimClient",
          text: "Client",
          className: "client",
          align: "left",
          sortable: true,
        },
        {
            key: "receiptDateTimeFormated",
            text: "Reçu le",
            className: "receiptDateTime",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let receiptDateTime = new Intl.DateTimeFormat("fr-FR", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                }).format(new Date(claim.receiptDateTime));
                return receiptDateTime;
            },
        },
        {
            key: "declenchedAtFormated",
            text: "Déclenchée le",
            className: "declenchedDate",
            align: "left",
            sortable: true,
            cell: (claim, index) => {
                let declenchedAt = new Intl.DateTimeFormat("fr-FR", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                }).format(new Date(claim.declenchedDate));
                return declenchedAt;
            },
        },
        {
            key: "retardDay",
            text: "En retard de",
            className: "retard",
            align: "left",
            sortable: true,
        },

        {
            key: "action",
            text: "Action",
            className: "",
            align: "left",
            sortable: false,
            cell: (claim) => {
                let url="";
                switch (claim.status) {
                  case "SAVED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                  case "AFFECTED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                  case "DESAPPROUVED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                  case "TREAT":
                    url = "/reclamations/mesure/"+claim.claimCode
                    break;
                  case "UNSATISFIED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                  case "PARTIAL_SATISFIED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                  case "CLASSED":
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
        
                  default:
                    url = "/reclamations/traitement/"+claim.claimCode
                    break;
                }
               
                // console.log('url',url)
                
                let iconeElt =<NavLink to={url}><div className="card-content red-text"><MenuIcon/></div></NavLink>
                return iconeElt
            },
        }

       
    ];

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Liste des réclamations en retard de traitement",
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
                last: <LastPageIcon />,
            }
        }
    }

    let content = [];
    content = props.items;
    
    content.forEach(element => {
        // date declenchedAt
        let declenchedDate = new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour:"numeric",
          minute:"numeric"
        }).format(new Date(element.declenchedDate));
        element.declenchedAtFormated = declenchedDate;

        // date receiptAt
        let receiptDateTime = new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour:"numeric",
          minute:"numeric"
        }).format(new Date(element.receiptDateTime));
        element.receiptDateTimeFormated = receiptDateTime;
    });

    return (
        <div id="main">
            <div className="row">
               
                <div className="col l12 m12 s12">
                    <div className="container">


                        <section className="tabs-vertical mt-1 section">
                            <div className="row">
                                <div className="col l12 s12 pb-5">
                                    <div className="card-panel pb-5">
                                        <div className="row">
                                            <div className="row">
                                                <div className="col l6 m6 s12">
                                                    <h5 className="card-title">
                                                        Liste des réclamations en retard de traitement&nbsp;
                                                    </h5>
                                                </div>
                                                {/* <div
                                                    className="col l6 m6 s12"
                                                    style={{ textAlign: "end" }}
                                                    >
                                                    <img
                                                        src={pdf}
                                                        alt=""
                                                        style={{ marginRight: "15px", cursor: "pointer" }}
                                                        onClick={(e) => {
                                                        handleImpression();
                                                        // props.showSelectPrintItemChanged(true);
                                                        setChangeButtonPrint(true);
                                                        }}
                                                    />
                                                    <img
                                                        src={excel}
                                                        alt=""
                                                        style={{ cursor: "pointer" }}
                                                        onClick={(e) => {
                                                        handleImpression();
                                                        // props.showSelectPrintItemChanged(true);
                                                        setChangeButtonPrint(false);
                                                        }}
                                                    />
                                                </div> */}
                                            </div>
                                            <div className="col s12">
                                                <ReactDatatable
                                                className={"responsive-table table-xlsx"}
                                                config={config}
                                                records={content}
                                                columns={columns}
                                            
                                                />
                                                <div id="tab_exl" style={{ display: "none" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="content-overlay"></div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.alert.isLoading,
        items: state.alert.items,
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        loading: (err) => {
            dispatch(loading(err))
        },
        itemsChanged: (items) => {
            dispatch(itemsChanged(items))
        },
    }
};


export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReclamationsAlertes);