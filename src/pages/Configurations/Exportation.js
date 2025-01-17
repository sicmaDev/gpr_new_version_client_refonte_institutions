import { Save } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import Select from "react-select"
import { useState } from "react";
import { exportConfigs } from "../../apis/Configurations/ExportationApi";
import { generateString } from "../../Utils/utils";


const styles = {
    control: base => ({
        ...base,
        height: 35,
        minHeight: 35
    }),
    menu: provided => ({ ...provided, zIndex: 9999 })
};
const Exportation = () => {

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [typeExport, setTypeExport] = useState("configs");

    const handleSubmit = (e) => {
        const jsonFile = `exportation_${generateString(5)}.json`
        exportConfigs(typeExport, jsonFile)

    }

    return (
        <div className="card-panel">
            <form className="paaswordvalidate" >
                <div className="row">
                    <div className="col s12"><h6 className="card-title">Exportation des configurations,denonciations et plaintes</h6>
                        <p>Il s'agit d'exporter en JSON/CSV vos de donnees</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col l6 m12 s12 input-field">
                        <Select
                            // isMulti
                            className="react-select-container mt-4"
                            classNamePrefix="react-select"
                            style={styles}
                            value={typeExport}
                            // value={valueP}
                            placeholder="Choix de la configuration a exporter"
                            options={[
                                { label: "Configurations", value: "configs" },
                                { label: "Réclamations", value: "claims" },
                                { label: "Dénonciations", value: "denunciations" },
                                { label: "Suggestions", value: "suggestions" }
                            ]}
                            onChange={(e) => { setTypeExport(e) }}
                        // onChange={(e) => props.emailsChanged(e.value)}
                        />
                        <label
                            htmlFor="idObjet"
                            className={"active"}
                        >
                            Type d'exportation
                        </label>

                    </div>

                    <div className="col s12 display-flex justify-content-end form-action">
                        {/* {buttons}    */}
                        <LoadingButton
                            className="btn waves-effect waves-light mr-1 btn-small"
                            onClick={(e) => handleSubmit(e)}
                            loading={isLoading}
                            loadingPosition="end"
                            endIcon={<Save />}
                            variant="contained"
                            sx={{ textTransform: "initial" }}
                        >
                            <span>Exporter</span>
                        </LoadingButton>
                    </div>

                </div>
            </form>



        </div>
    )
}

export default Exportation
