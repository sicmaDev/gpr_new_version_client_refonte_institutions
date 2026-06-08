import { Save } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import Select from "react-select"
import { useState } from "react";
import { exportConfigs } from "../../apis/Configurations/ExportationApi";
import { generateString } from "../../Utils/utils";
import React from "react";
import { Box, Typography } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.4px" };

const selectStyles = {
    control: (base, state) => ({ ...base, minHeight: 40, borderRadius: 9, borderColor: state.isFocused ? "#3b3fd8" : "#e2e8f0", borderWidth: 1.5, boxShadow: "none", "&:hover": { borderColor: "#3b3fd8" } }),
    valueContainer: base => ({ ...base, padding: "2px 14px" }),
    placeholder: base => ({ ...base, fontSize: 14, color: "#94a3b8" }),
    singleValue: base => ({ ...base, fontSize: 14, color: "#1e293b" }),
    input: base => ({ ...base, margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: provided => ({ ...provided, zIndex: 9999 }),
};

const Exportation = () => {

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [typeExport, setTypeExport] = useState({
        value: "configs",
        label: ""
    });

    const handleSubmit = (e) => {
        const jsonFile = `Exportation_${typeExport.label}_${generateString(5)}.json`
        exportConfigs(typeExport.value, jsonFile)

    }

    return (
        <div className="card-panel pb-5">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileDownloadOutlinedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>Exportation des configurations, dénonciations et plaintes</Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.3 }}>Il s'agit d'exporter en JSON/CSV vos données</Typography>
                </Box>
            </Box>

            <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                <Box>
                    <label style={labelStyle}>Type d'exportation</label>
                    <Select
                        value={typeExport}
                        placeholder="Choix de la configuration à exporter"
                        options={[
                            { label: "Configurations", value: "configs" },
                            { label: "Réclamations", value: "claims" },
                            { label: "Dénonciations", value: "denunciations" },
                            { label: "Suggestions", value: "suggestions" }
                        ]}
                        onChange={(e) => { setTypeExport(e) }}
                        styles={selectStyles}
                    />
                </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <LoadingButton
                    onClick={(e) => handleSubmit(e)}
                    loading={isLoading}
                    loadingPosition="start"
                    startIcon={<Save style={{ fontSize: 16 }} />}
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, px: 3, background: "linear-gradient(135deg, #1e2188, #3b3fd8)", "&:hover": { background: "linear-gradient(135deg, #16186e, #2f32b0)" }, "&.Mui-disabled": { opacity: 0.6 } }}
                >
                    Exporter
                </LoadingButton>
            </Box>
        </div>
    )
}

export default Exportation
