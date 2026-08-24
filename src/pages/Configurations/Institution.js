import React, { useEffect, useMemo, useState } from "react";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { v4 as uuidv4 } from 'uuid';
import { Box, Typography, Tooltip } from "@mui/material";

import { cleanPhoneNumber, isValidPhone, loadItemFromLocalStorage, loadItemFromSessionStorage, today } from "../../Utils/utils";
import { connect } from "react-redux";
import { ajout } from "../../apis/Configurations/InstitutionApi";

import { LoadingButton } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LOGO_SUPPORTED_SIZE } from "../../Utils/globals";
import { licenseControl } from "../../Utils/license";
import { addressChanged, denominationChanged, emailChanged, idChanged, institutionErrors, logoChanged, phoneChanged, referenceChanged, etatChanged, paysChanged, paysCodeChanged } from "../../redux/actions/Configurations/InstitutionActions";
import countryList from 'react-select-country-list'
import Select from "react-select";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };
const inputStyle = (hasError) => ({ width: "100%", boxSizing: "border-box", border: hasError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0", borderRadius: 9, padding: "10.5px 14px", fontSize: 14, outline: "none", background: "#fff", color: "#1e293b", height: 40 });

const selectStyles = (hasError) => ({
    control: (base, state) => ({ ...base, minHeight: 40, borderRadius: 9, borderColor: hasError ? "#ef4444" : (state.isFocused ? "var(--gpr-primary, #005081)" : "#e2e8f0"), borderWidth: 1.5, boxShadow: "none", "&:hover": { borderColor: hasError ? "#ef4444" : "var(--gpr-primary, #005081)" } }),
    valueContainer: base => ({ ...base, padding: "2px 14px" }),
    placeholder: base => ({ ...base, fontSize: 14, color: "#94a3b8" }),
    singleValue: base => ({ ...base, fontSize: 14, color: "#1e293b" }),
    input: base => ({ ...base, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
});

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Icon sx={{ fontSize: 16, color: "var(--gpr-primary, #005081)" }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "var(--gpr-primary, #005081)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>{subtitle}</Typography>}
    </Box>
);

const FieldCheck = ({ valid }) => valid
    ? <CheckCircleIcon sx={{ fontSize: 14, color: "#16a34a", verticalAlign: "middle", ml: 0.6 }} />
    : null;


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
            let appInstitution = loadItemFromLocalStorage("app-institution") !== undefined && (loadItemFromLocalStorage("app-institution").length !== 0) ? loadItemFromLocalStorage("app-institution") : undefined;

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

    let isLicenseControl = licenseControl()

    let errors = {};

    const [imageToCrop, setImageToCrop] = useState(undefined);
    const [croppedImage, setCroppedImage] = useState(undefined);
    const [isDragging, setIsDragging] = useState(false);

    const readLogoFile = (file) => {
        if (!file) return;
        let reader = new FileReader();
        reader.addEventListener('load', () =>
            setImageToCrop(reader.result)
        );
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            props.logoChanged(e.target.result)
        }
    }

    const handleFile = (e) => {
        readLogoFile(e.target.files[0]);
    }

    const handleLogoDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        readLogoFile(e.dataTransfer.files[0]);
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

    const validDenomination = !!props.denomination;
    const validReference = !!props.reference;
    const validAddress = !!props.address;
    const validEmail = !!props.email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email);
    const validPhone = !!props.phone && isValidPhone(props.phone);
    const validPays = !!props.pays;
    const validLogo = !!props.logo;

    return (
        <div className="card-panel pb-5">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BusinessIcon sx={{ color: "var(--gpr-primary, #005081)", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Configurer les informations de l'institution</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>Il s'agit de configurer les informations (Dénomination, Email, etc..) de votre institution</Typography>
                </Box>
            </Box>

            <Box component="form" id="accountForm" sx={{ mt: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>

                    {/* Colonne gauche */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={BadgeIcon} title="Identité" subtitle="(dénomination, agrément, logo)" />
                        <Box>
                            <label style={labelStyle}>Raison / Dénomination <FieldCheck valid={validDenomination} /></label>
                            <input value={props.denomination || ""} onChange={(e) => props.denominationChanged(e.target.value)} placeholder="Ex: SICMA ET ASSOCIES"
                                style={inputStyle(props.errors.denomination)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.errors.denomination ? "#ef4444" : "#e2e8f0"; }} />
                            {props.errors.denomination && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.denomination}</div>}
                        </Box>
                        <Box>
                            <label style={labelStyle}>Numéro d'agrément <FieldCheck valid={validReference} /></label>
                            <input value={props.reference || ""} onChange={(e) => props.referenceChanged(e.target.value)} placeholder="Ex: RCCM RB/ABC/20 B 3215"
                                style={inputStyle(props.errors.reference)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.errors.reference ? "#ef4444" : "#e2e8f0"; }} />
                            {props.errors.reference && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.reference}</div>}
                        </Box>
                        <Box>
                            <label style={labelStyle}>Adresse <FieldCheck valid={validAddress} /></label>
                            <input value={props.address || ""} onChange={(e) => props.addressChanged(e.target.value)} placeholder="Ex: Calavi-Kpota, 2ème étage Immeuble Tankaya-Banque Atlantique"
                                style={inputStyle(props.errors.address)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.errors.address ? "#ef4444" : "#e2e8f0"; }} />
                            {props.errors.address && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.address}</div>}
                        </Box>
                    </Box>

                    {/* Colonne droite */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <SectionTitle icon={ContactMailIcon} title="Coordonnées" subtitle="(email, téléphone, pays)" />
                        <Box>
                            <label style={labelStyle}>Adresse électronique <FieldCheck valid={validEmail} /></label>
                            <input type="email" value={props.email || ""} onChange={(e) => props.emailChanged(e.target.value)} placeholder="Ex: info@sicmagroup.com"
                                style={inputStyle(props.errors.email)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.errors.email ? "#ef4444" : "#e2e8f0"; }} />
                            {props.errors.email && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.email}</div>}
                        </Box>
                        <Box>
                            <label style={labelStyle}>
                                Téléphone <FieldCheck valid={validPhone} />{" "}
                                <Tooltip title="Exemple: 22990909090 ou +22990909090">
                                    <HelpOutlineIcon sx={{ fontSize: 14, color: "#94a3b8", verticalAlign: "middle" }} />
                                </Tooltip>
                            </label>
                            <input type="tel" value={props.phone || ""} onChange={(e) => props.phoneChanged(e.target.value)} placeholder="Ex: 22990909090"
                                style={inputStyle(props.errors.phone)} onFocus={(e) => { e.target.style.borderColor = "var(--gpr-primary, #005081)"; }} onBlur={(e) => { e.target.style.borderColor = props.errors.phone ? "#ef4444" : "#e2e8f0"; }} />
                            {props.errors.phone && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.phone}</div>}
                        </Box>
                        <Box>
                            <label style={labelStyle}>Pays <FieldCheck valid={validPays} /></label>
                            <Select
                                id="slevel"
                                value={props.pays ? { value: props.paysCode, label: props.pays } : null}
                                placeholder="Sélectionner le pays"
                                options={options}
                                onChange={changeHandler}
                                styles={selectStyles(props.errors.pays)}
                            />
                            {props.errors.pays && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.pays}</div>}
                        </Box>
                    </Box>
                </Box>

                {/* Logo - pleine largeur */}
                <Box sx={{ mt: 2.5 }}>
                    <label style={labelStyle}>Logo de l'institution <FieldCheck valid={validLogo} /></label>
                    <Box
                        component="label"
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleLogoDrop}
                        sx={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                            width: "100%", minHeight: 150, borderRadius: 2.5, cursor: "pointer", textAlign: "center", padding: "16px",
                            border: isDragging ? "2px dashed #3b3fd8" : (props.errors.logo ? "1.5px dashed #ef4444" : "1.5px dashed #cbd5e1"),
                            background: isDragging ? "#EEF2FF" : "#f8fafc",
                            transition: "all 0.15s ease",
                            "&:hover": { borderColor: "var(--gpr-primary, #005081)", background: "#EEF2FF" },
                        }}
                    >
                        <input type="file" hidden accept="image/*" onChange={handleFile} />
                        {props.logo ? (
                            <img src={props.logo} alt="Logo de l'institution" style={{ maxWidth: 180, maxHeight: 90, objectFit: "contain" }} />
                        ) : (
                            <BusinessIcon sx={{ color: "#94a3b8", fontSize: 28 }} />
                        )}
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                            {props.logo ? "Cliquez ou glissez pour remplacer le logo" : "Glissez votre logo ici ou cliquez pour parcourir"}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>Dimensions supportées: {LOGO_SUPPORTED_SIZE}</Typography>
                    </Box>
                    {props.errors.logo && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{props.errors.logo}</div>}
                </Box>

                <Box sx={{
                    position: "sticky", bottom: 0, zIndex: 5, mt: 3, pt: 2, pb: 1,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2,
                    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", borderTop: "1px solid #e2e8f0",
                }}>
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", mr: "auto" }}>
                        Les champs marqués d'un <CheckCircleIcon sx={{ fontSize: 12, color: "#16a34a", verticalAlign: "middle" }} /> sont valides
                    </Typography>
                    <LoadingButton
                        onClick={(e) => handleSubmit(e)}
                        loading={props.etat}
                        loadingPosition="start"
                        startIcon={<SaveIcon style={{ fontSize: 16 }} />}
                        variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "var(--gpr-primary, #005081)", "&:hover": { background: "var(--gpr-primary-dark, #003d63)" }, "&.Mui-disabled": { opacity: 0.6 } }}
                    >
                        Enregistrer
                    </LoadingButton>
                </Box>
            </Box>
        </div>
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