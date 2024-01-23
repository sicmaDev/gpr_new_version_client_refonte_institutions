import React, {useEffect} from "react";
import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Select from "react-select";
import {
    etat2Changed, etat3Changed, etatChanged, idChanged,
    itemsChanged, solutionErrors,
    selectedItemChanged,
    objetLibelleChanged,
    objetChanged,
    solutionChanged
} from "../../redux/actions/Configurations/SolutionsActions";
import {loadItemFromLocalStorage, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import {modalify} from "../../Utils/modal";
import { ajout, liste, modification, suppression } from "../../apis/Configurations/SolutionsApi";
import excel from '../../assets/images/excel.svg'
import pdf from '../../assets/images/pdf.svg'
import {handlePrint} from "../../Utils/tables";
import {table2XLSX} from "../../Utils/tabletoexcel";
import { pageChanged } from "../../redux/actions/LayoutActions";
import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';

const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({...provided, zIndex: 9999})
};
const Solutions = (props) => {

    useEffect(() => {
       
        liste(props).then((r) => {});
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

    const handleChange1 = (obj) => {
        props.objetChanged(obj.value)
        props.objetLibelleChanged(obj.label)
    }

    let columns = [
        {
            key: "objetDto.libelle",
            text: "Objet",
            className: "name",
            align: "left",
            sortable: true,
            cell: (solution) => {
                return solution.objetDto.libelle
            }
        },
        {
            key: "content",
            text: "Solution",
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
        filename: "Langues",
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

    let objets =  loadItemFromLocalStorage("app-objets") !== undefined ? JSON.parse(loadItemFromLocalStorage("app-objets")) : undefined;
    let objetsOptions = [];
    
    objets.map((objet) => {
        
        objetsOptions.push({
            label: objet.libelle,
            value: objet.id,
        });
    });


    let errors = {};
    const handleValidation = () => {
        let isValid = true;

        if ((props.objet === "" || props.objet === undefined || props.objet === null)) {
            isValid = false;
            errors["objet"] = "Champ incorrect";
        }
        if ((props.solution === "" || props.solution === undefined || props.solution === null)) {
            isValid = false;
            errors["solution"] = "Champ incorrect";
        }
        
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
           
           
            let item = {}
            item["objet"] = props.objet;
            item["content"] = props.solution;
            console.log("solutionitem",item)
            props.etatChanged(true)
            ajout(item, props).then(() => {
                handleCancel(e)
            })
        } else {
        }
        props.solutionErrors(errors)
    }

    function clearComponentState() {
        props.idChanged("")
        props.objetChanged("")
        props.objetLibelleChanged("")
        props.solutionChanged("")
        props.selectedItemChanged({})
    }

    const handleCancel = (e) => {
        e.preventDefault()
        clearComponentState()
    }
    const handleEdit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
           
            //Create updated version of selected item
            let item = {}
            item["id"] = props.id;
            item["objet"] = props.objet;
            item["content"] = props.solution;
           
            props.etat2Changed(true)
            modification(item, props).then(() => {
                handleCancel(e)
            })
            clearComponentState()
        }
        else {
        }
        props.solutionErrors(errors)
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
       
        props.etat3Changed(true)
        suppression(props).then(() => {
            handleCancel(e)
        })
       
        props.solutionErrors(errors)
    }
    const rowClickedHandler = (event, data, rowIndex) => {
        props.idChanged(data.id)
        props.objetChanged(data.objetDto.id)
        props.objetLibelleChanged(data.objetDto.libelle)
        props.solutionChanged(data.content)
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
            loading={props.etat3}
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
            loading={props.etat}
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
            loading={props.etat}
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
                        <div className="col s12"><h6 className="card-title">{titleText} des solutions pour les objets</h6>
                            <p>Il s'agit d'enregistrer les solutions potentielles des objets de réclamation</p></div>
                    </div>

                    <div className="row">
                        <div className="col l12 m12 s12 input-field">

                            <Select
                                id={"usrole"}
                                className='react-select-container mt-4'
                                classNamePrefix="react-select"
                                style={styles}
                                placeholder="Sélectionnez l'objet"
                                options={objetsOptions}
                                // value={roleValue}
                                // onChange={(e) => props.roleChanged(e.value)}
                                value={props.role!=="" ? {"label": props.objetLibelle, "value": props.objet } : "Sélectionner l'objet"}
                                onChange={handleChange1}
                            />
                            <label htmlFor="usrole" className={"active"}>Objets&nbsp;</label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">
                                {props.errors !== undefined
                                ? props.errors.objet
                                : ""}
                                </div>
                            </small>
                        </div>
                       
                        <div className="col s12 input-field">
                                    <textarea id="lgdescription" name="description" type="text" placeholder=""
                                              className="validate materialize-textarea" value={props.solution}
                                              onChange={(e) => props.solutionChanged(e.target.value)}
                                              data-error=".errorTxt2"/>
                            <label htmlFor="lgdescription" className={"active"}>Solution&nbsp;
                                <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: La meilleur des solutions dans ce cas est de mener une enquête.....">
                                    <HelpIcon/>
                                </a>
                            </label>
                            <small className="errorTxt4">
                                <div id="cpassword-error" className="error">{props.errors.solution}</div>
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
                                        <h4 className="card-title">Liste des solutions&nbsp;</h4>
                                    </div>
                                    <div className="col l6 m6 s12" style={{ textAlign:"end" }}>
                                        {/* <img src={pdf} alt="" style={{ marginRight:"15px",cursor:"pointer" }} onClick={(e) => {handlePrint(config, columns, props.items, 0)}} />
                                        <img src={excel} alt="" style={{ cursor:"pointer" }} onClick={(e) => {table2XLSX("Liste_des_solutions" + today().replaceAll("/", ""),"app-solutions")}} /> */}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col s12">
                                        <ReactDatatable
                                            className = {"responsive-table table-xlsx"}
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
        isLoading: state.solution.isLoading,
        id: state.solution.id,
        objet: state.solution.objet,
        objetLibelle: state.solution.objetLibelle,
        solution: state.solution.solution,
        items: state.solution.items,
        selectedItem: state.solution.selectedItem,
        errors: state.solution.solution_errors,
        page: state.layout.page,
        etat: state.solution.etat,
        etat2: state.solution.etat2,
        etat3: state.solution.etat3,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        solutionErrors: (err) => {
            dispatch(solutionErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        objetChanged: (objet) => {
            dispatch(objetChanged(objet))
        },
        objetLibelleChanged: (objetLibelle) => {
            dispatch(objetLibelleChanged(objetLibelle))
        },
        solutionChanged: (solution) => {
            dispatch(solutionChanged(solution))
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
)(Solutions)