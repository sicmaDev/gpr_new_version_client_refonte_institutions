import React, {useEffect, useMemo, useState} from "react";
import ReactDatatable from '@ashvin27/react-datatable';
import HelpIcon from '@mui/icons-material/Help';
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { v4 as uuidv4 } from 'uuid';

import {cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today} from "../../Utils/utils";
import { connect } from "react-redux";
import {modalify} from "../../Utils/modal";
import { ajout } from "../../apis/Configurations/InstitutionApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import { licenseControl } from "../../Utils/license";
import { addressChanged, denominationChanged, emailChanged, idChanged, institutionErrors, logoChanged, phoneChanged, referenceChanged, etatChanged, paysChanged, paysCodeChanged } from "../../redux/actions/Configurations/InstitutionActions";
import countryList from 'react-select-country-list'
import Select from "react-select";



const Institution = (props) => {
    const [valueP, setValueP] = useState('')
    const [valueC, setValueC] = useState('')
    const options = useMemo(() => countryList().getData(), [])
  
    const changeHandler = valueP => {
      setValueP(valueP)
      props.paysChanged(valueP.label)
      props.paysCodeChanged(valueP.value)
      setValueC(valueC)
    //   console.log("payssss",valueP.label)
    }
  

    useEffect(() => {

        try {
            let appInstitution =  loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !== 0) ? JSON.parse(loadItemFromLocalStorage("app-institution")) : undefined;
           
            if (appInstitution !== undefined || appInstitution !== "") {
                props.denominationChanged(appInstitution.denomination)
                props.referenceChanged(appInstitution.numAgrement)
                props.addressChanged(appInstitution.adresse)
                props.logoChanged(appInstitution.logo)
                props.emailChanged(appInstitution.email)
                props.phoneChanged(appInstitution.tel)
                props.paysChanged(appInstitution.pays)
                props.paysCodeChanged(appInstitution.paysCode)

            } else {
            }
        } catch (e) {
        }
       
       
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
       
    }, []);

    let isLicenseControl = licenseControl()

    let errors = {};

    const [imageToCrop, setImageToCrop] = useState(undefined);
    const [croppedImage, setCroppedImage] = useState(undefined);

    const handleFile = (e) => {
        let reader = new FileReader();
        reader.addEventListener('load', () =>
            setImageToCrop(reader.result)
        );

        reader.readAsDataURL(e.target.files[0]);
        reader.onload = (e) => {
            props.logoChanged(e.target.result)
        }
    }
    const handleValidation = () => {
        let isValid = true;
      
        if ((props.denomination === "" || props.denomination === undefined || props.denomination === null)) {
            isValid = false;
            errors["denomination"] = "Champ incorrect";
        }
        if ((props.reference === "" || props.reference === undefined || props.reference === null)) {
            isValid = false;
            errors["reference"] = "Champ incorrect";
        }
        if ((props.address === "" || props.address === undefined || props.address === null)) {
            isValid = false;
            errors["address"] = "Champ incorrect";
        }
        if ((props.email === "" || props.email === undefined || props.email === null) || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)) {
            isValid = false;
            errors["email"] = "Champ incorrect";
        }
        if ((props.phone === "" || props.phone === undefined || props.phone === null) || !isValidPhone(props.phone)) {
            isValid = false;
            errors["phone"] = "Champ incorrect";
        }
        if ((props.pays === "" || props.pays === undefined || props.pays === null)) {
            isValid = false;
            errors["pays"] = "Champ incorrect";
        }
        if ((props.logo === "" || props.logo === undefined || props.logo === null)) {
            isValid = false;
            errors["logo"] = "Champ incorrect";
        }
        
        return isValid
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        if (handleValidation()) {
            let item = {}
            item["denomination"] = props.denomination;
            item["numAgrement"] = props.reference;
            item["adresse"] = props.address;
            item["email"] = props.email;
            item["tel"] = cleanPhoneNumber(props.phone);
            item["logo"] = props.logo;
            item["pays"] = props.pays;
            item["paysCode"] = props.paysCode;
           
            props.etatChanged(true)
            ajout(item, props).then(() => {
                // handleCancel(e)
            })

        }
        props.institutionErrors(errors)
    }

    let companyLogo = (props.logo)?
        (<img src={props.logo} alt="Logo de l'institution" className="responsive-img"/>)
        :
        (<div className={"img-placeholder"}></div>)

    return (
        <>
            <div className="card-panel">

                <form id="accountForm" >
                    <div className="row mb-2">
                        <div className="col s12"><h6 className="card-title">Configurer les informations de l'institution</h6>
                            <p>Il s'agit de configurer les informations(Dénomination, Email, etc..)  de votre institution</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s12 m6">
                            <div className="row">
                                <div className="col s12 input-field">
                                    <input id="denomination" placeholder="" name="denomination" type="text"
                                           className="validate" value={props.denomination}
                                           onChange={(e) => props.denominationChanged(e.target.value)}
                                           data-error=".errorTxt1"/>
                                    <label htmlFor="denomination" className={"active"}>Raison / Dénomination</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.denomination}</div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">
                                    <input id="reference" placeholder="" name="reference" type="text"
                                           className="validate" value={props.reference}
                                           onChange={(e) => props.referenceChanged(e.target.value)}
                                           data-error=".errorTxt1"/>
                                    <label htmlFor="reference" className={"active"}>Numéro d'agrément</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.reference}</div>
                                    </small>
                                </div>
                                <div className="col s12 input-field">
                                    <textarea id="address" placeholder="" name="address" type="text"
                                              className="validate materialize-textarea" value={props.address}
                                              onChange={(e) => props.addressChanged(e.target.value)}
                                              data-error=".errorTxt2"/>
                                    <label htmlFor="address" className={"active"}>Adresse</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.address}</div>
                                    </small>
                                </div>
                               
                               
                                <div className="col s12 file-field input-field">
                                    <div className="btn btn-small file-small brand-blue">
                                        <span>Logo</span>
                                        <input type="file" onChange={(e) => handleFile(e)}/>
                                    </div>
                                    <div className="file-path-wrapper">
                                        <input className="file-path validate" type="text" value={props.logo}/>
                                        <span className="helper-text" data-error="" data-success="">Dimensions supportées: {LOGO_SUPPORTED_SIZE}</span>
                                    </div>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.logo}</div>
                                    </small>
                                    {/*<div>*/}
                                    {/*    <ImageCropper*/}
                                    {/*        imageToCrop={imageToCrop}*/}
                                    {/*        onImageCropped={(croppedImage) => setCroppedImage(croppedImage)}*/}
                                    {/*    />*/}
                                    {/*</div>*/}
                                    {/*{*/}
                                    {/*    croppedImage &&*/}
                                    {/*    <div>*/}
                                    {/*        <h2>Cropped Image</h2>*/}
                                    {/*        <img*/}
                                    {/*            alt="Cropped Image"*/}
                                    {/*            src={croppedImage}*/}
                                    {/*        />*/}
                                    {/*    </div>*/}
                                    {/*}*/}
                                </div>
                            </div>
                        </div>
                        <div className="col s12 m6">
                            <div className="row">
                                <div className="col s12 input-field">
                                    <input id="email" name="email" placeholder="" type="email"
                                           onChange={(e) => props.emailChanged(e.target.value)}
                                           className=""
                                           value={props.email}/>
                                    <label htmlFor="email" className={"active"}>Adresse électronique</label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.email}</div>
                                    </small>

                                </div>
                                <div className="col s12 input-field">
                                    <input type="tel" placeholder="" value={props.phone} onChange={(e) => props.phoneChanged(e.target.value)} />

                                    <label htmlFor="phone" className={"active"}>Téléphone&nbsp;
                                        <a className="btn btn-floating tooltipped btn-small waves-effect waves-light white red-text" data-position="bottom" data-tooltip="Exemple: 22990909090 ou +22990909090">
                                            <HelpIcon/>
                                        </a></label>
                                    <small className="errorTxt4">
                                        <div id="cpassword-error" className="error">{props.errors.phone}</div>
                                    </small>
                                </div>
                                <div className="col s12">
                                    <div className="input-field">
                                        <Select

                                            id="slevel"
                                            value={{"value": props.paysCode ,"label": props.pays}}
                                            // value={valueP}
                                            className='react-select-container mt-2'
                                            classNamePrefix="react-select"
                                            // style={styles}
                                            placeholder="Sélectionner le pays"
                                            options={options}
                                            // onChange={(e) => props.risqueLevelChanged(e.value)}
                                            onChange={changeHandler}
                                        />
                                        <label htmlFor="slevel" className={"active"} style={{top:'-14%'}}>Pays</label>
                                        <small className="errorTxt4">
                                            <div id="cpassword-error" className="error">{props.errors.pays}</div>
                                        </small>
                                    </div>
                                </div>
                                <div className="col s12">
                                    {companyLogo}
                                </div>
                            </div>
                        </div>

                        <div className="col s12 display-flex justify-content-end mt-3">
                            {/* {!licenseControl? */}
                                {/* ( */}
                                    <LoadingButton
                                    className="btn waves-effect waves-light mr-1 btn-small"
                                    onClick={(e) => handleSubmit(e)}
                                    loading={props.etat}
                                    loadingPosition="end"
                                    endIcon={<SaveIcon />}
                                    variant="contained"
                                    sx={{ textTransform:"initial" }}
                                    >
                                        <span>Enregistrer</span>
                                    </LoadingButton>
                                {/* ) */}
                            {/* :
                                (<div className="card-alert card red lighten-5">
                                    <div className="card-content red-text">
                                        <ul>
                                            Veuillez activer une licence.
                                        </ul>
                                    </div>
                                </div>)} */}
                        </div>
                    </div>
                </form>

            </div>
        </>
    )
}
const mapStateToProps = (state) => {
    return {
        isLoading: state.institution.isLoading,
        denomination: state.institution.denomination,
        reference: state.institution.reference,
        address: state.institution.address,
        email: state.institution.email,
        phone: state.institution.phone,
        pays: state.institution.pays,
        paysCode: state.institution.paysCode,
        logo: state.institution.logo,
        etat: state.institution.etat,
        errors: state.institution.institution_errors,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

        institutionErrors: (err) => {
            dispatch(institutionErrors(err))
        },
        idChanged: (id) => {
            dispatch(idChanged(id))
        },
        denominationChanged: (denomination) => {
            dispatch(denominationChanged(denomination))
        },
        referenceChanged: (reference) => {
            dispatch(referenceChanged(reference))
        },
        addressChanged: (address) => {
            dispatch(addressChanged(address))
        },
        logoChanged: (logo) => {
            dispatch(logoChanged(logo))
        },
        emailChanged: (email) => {
            dispatch(emailChanged(email))
        },
        phoneChanged: (phone) => {
            dispatch(phoneChanged(phone))
        },
        paysChanged: (pays) => {
            dispatch(paysChanged(pays))
        },
        paysCodeChanged: (paysCode) => {
            dispatch(paysCodeChanged(paysCode))
        },
        etatChanged: (etat) => {
            dispatch(etatChanged(etat));
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Institution)