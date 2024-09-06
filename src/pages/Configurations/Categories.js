import React, {useEffect, useState} from "react";
import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { v4 as uuidv4 } from 'uuid';
import {
    descriptionChanged, etat2Changed, etat3Changed, etatChanged, idChanged,
    itemsChanged, categorieErrors,
    libelleChanged,
    selectedItemChanged
} from "../../redux/actions/Configurations/CategoriesActions";
import {loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import {modalify} from "../../Utils/modal";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/CategoriesApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { pageChanged } from "../../redux/actions/LayoutActions";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';


const Categories = (props) => {

    // props.pageChanged("hello")
    // console.log("prego1",props.page)
    const [deleteIsLoading,setDeleteIsLoading] = useState(false);
    const [createIsLoading,setCreateIsLoading] = useState(false);
    const [updateIsLoading,setUpdateIsLoading] = useState(false);
   
    useEffect(() => {
       
        liste(props).then((r) => {});
        //UI Fixebs
       
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
        window.$('ul.pagination').parent().parent().css({marginTop:"1%", boxShadow:"none"})
        window.$('ul.pagination').parent().css({boxShadow:"none"})
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
    ];

    let config = {
        page_size: 15,
        length_menu: [ 15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Catégories des Objets de réclamation",
        button: {
            //excel: true,
            //pdf: true,
            //print: true,
        },
        language: {
            length_menu: "Afficher _MENU_ éléments",
            filter: "Rechercher...",
            info: "Affichage de l'élement _START_ à _END_ sur _TOTAL_ éléments",
            zero_records:    "Aucun élément à afficher",
            no_data_text: "Aucun élément à afficher",
            loading_text: "Chargement en cours...",
            pagination: {
                first: <FirstPageIcon/>,
                previous: <ChevronLeftIcon/>,
                next: <ChevronRightIcon/>,
                last: <LastPageIcon/>
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
        
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
           setCreateIsLoading(true)
           
            let item = {}
            item["libelle"] = props.libelle;
            item["description"] = props.description;
            
            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            }).finally(()=>{
                setCreateIsLoading(false)
            })
        } else {
        }
        props.categorieErrors(errors)
    }

    function clearComponentState() {
        props.idChanged("")
        props.libelleChanged("")
        props.descriptionChanged("")
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
            let item = {}
            item["id"] = props.id;
            item["libelle"] = props.libelle;
            item["description"] = props.description;
           
            props.etat2Changed(true)
            modification(item, props).then(() => {
                handleCancel(e)
            }).finally(()=>{
                setUpdateIsLoading(false)
            })
            clearComponentState()
        }
        else {
        }
        props.categorieErrors(errors)
    }
   
    const handleModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la suppression de cet élément?", "confirm", handleDelete)
    }
    const handleEditModal = (e) => {
        e.preventDefault()
        modalify("Confirmation", "Confirmez vous la modification de cet élément?", "confirm", handleEdit)
    }
    const handleDelete = (e) => {
        e.preventDefault()

        setDeleteIsLoading(true)
       
        props.etat3Changed(true)
        suppression(props).then(() => {
            handleCancel(e)
        }).finally(()=>{
            setDeleteIsLoading(false)
        })
       
        props.categorieErrors(errors)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id)
        props.libelleChanged(data.libelle)
        props.descriptionChanged(data.description)
        props.selectedItemChanged(data)
    }
    const  tableChangeHandler = data => {
    }
   
    let titleText = props.selectedItem.id!== undefined ? "Modifier ou Supprimer" : "Ajouter";
    
    let buttons = props.selectedItem.id!== undefined ?
    (<>
        <LoadingButton
            className="btn waves-effect waves-effect-b waves-light btn-small mr-1 red-text red lighten-4"
            onClick={(e) => handleModal(e)}
            loading={deleteIsLoading}
            loadingPosition="end"
            endIcon={<DeleteIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
        >
            <span>Supprimer</span>
        </LoadingButton>

        <LoadingButton
            className="btn waves-effect waves-light mr-1 btn-small red-text white lighten-4"
            onClick={(e) => handleCancel(e)}
            loading={props.etat2}
            loadingPosition="end"
            endIcon={<CancelIcon />}
            variant="contained"
            sx={{ textTransform:"initial" }}
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
            sx={{ textTransform:"initial" }}
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
            sx={{ textTransform:"initial" }}
        >
            <span>Ajouter</span>
        </LoadingButton>
       
    )

    return (
        <>
            <div className="card-panel">
                <form className="paaswordvalidate" onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col s12"><h6 className="card-title">{titleText} une Catégorie</h6>
                            <p>Il s'agit d'enregistrer les catégories des objets de réclamations</p></div>
                    </div>

                    <div className="row">
                        <div className="col s12">
                            <div className="input-field">
                                <input id="lgname" name="libelle" type="text" placeholder=""
                                       data-error=".errorTxt4" value={props.libelle}
                                       onChange={(e) => props.libelleChanged(e.target.value)}/>
                                <label htmlFor="lgname" className={"active"}>Intitulé
                                    &nbsp;
                                    <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Goun, Fon, Français etc.. ">
                                        <HelpIcon/>
                                    </a>
                                </label>
                                <small className="errorTxt4">
                                    <div id="cpassword-error" className="error">{props.errors.libelle}</div>
                                </small>
                            </div>
                        </div>
                        <div className="col s12 input-field">
                                    <textarea id="lgdescription" name="description" type="text" placeholder=""
                                              className="validate materialize-textarea" value={props.description}
                                              onChange={(e) => props.descriptionChanged(e.target.value)}
                                              data-error=".errorTxt2"/>
                            <label htmlFor="lgdescription" className={"active"}>Description&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: Le Fon est... et est parlé dans les régions  ... et par x% de nos clients.">
                                    <HelpIcon/>
                                </a>
                            </label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.description}</div>
                            </small>
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
                                        <h4 className="card-title">Liste des Catégories&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_categories" + today().replaceAll("/", ""),"app-categories")}} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className = {"responsive-table table-xlsx app-categories"}
                                            config={config}
                                            records={props.items}
                                            columns={columns}
                                            onRowClicked={rowClickedHandler}
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
        isLoading: state.categorie.isLoading,
        id: state.categorie.id,
        libelle: state.categorie.libelle,
        description: state.categorie.description,
        items: state.categorie.items,
        selectedItem: state.categorie.selectedItem,
        errors: state.categorie.categorie_errors,
        page: state.layout.page,
        etat: state.categorie.etat,
        etat2: state.categorie.etat2,
        etat3: state.categorie.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        categorieErrors: (err) => {
            dispatch(categorieErrors(err))
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
        selectedItemChanged: (selectedItem) => {
            dispatch(selectedItemChanged(selectedItem))
        },
        pageChanged: (page) => {
            dispatch(pageChanged(page))
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
)(Categories)