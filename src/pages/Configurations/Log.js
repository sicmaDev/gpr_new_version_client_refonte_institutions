
import React from "react"
import ReactDatatable from "@ashvin27/react-datatable";
import { useEffect, useState } from "react";
import { KTApp } from "../../Utils/blockui";
import { logs } from "../../apis/Configurations/LogApi";
import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import excel from '../../assets/images/excel.svg';
import { handlePrint } from "../../Utils/tables";
import { table2XLSX } from "../../Utils/tabletoexcel";
import pdf from '../../assets/images/pdf.svg';
import { Chip } from "@mui/material";
import { today } from "../../Utils/utils";


const Log = () => {
    useEffect(() => {
      getLogs()
    
    
    }, [""]);
    const [data, setData] = useState([])


    const getLogs = async()=>{
        KTApp.blockPage({
            overlayColor: '#000000',
            type: 'v1',
            state: 'danger',
            message: 'En cours...'
        })
        logs().then(({data})=>{
            setData(data.content)
        }).catch((err)=>{
            setData([]);

        }).finally(()=>{
            KTApp.unblockPage() 
        })
    }

    let columns = [
       
        {
            key: "libelle",
            text: "Libelle",
            className: "libelle",
            align: "left",
            sortable: true,
            
        },
        {
            key: "content",
            text: "Content",
            className: "type",
            align: "left",
            sortable: true,
           
        },
        {
            key: "target",
            text: "Target",
            className: "type",
            align: "left",
            sortable: true,
           
        },
        {
            key: "type",
            text: "Type",
            className: "name",
            align: "left",
            sortable: true,
            cell: (lo) => {
                let type = lo.type;
               
                return <div style={{maxWidth:"100px"}}><Chip style={{maxWidth:"100px"}} label={type} color={type.toLowerCase()}   /></div>
                
            },

        },
        {
            key: "userIpAddress",
            text: "Address IP",
            className: "type",
            align: "left",
            sortable: true,
           
        },
        {
            key: "createdAt",
            text: "Enregistré le",
            className: "created_at",
            align: "left",
            sortable: true,
            cell: (user, index) => {
                let createdAt = new Intl.DateTimeFormat("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit"
                }).format(new Date(user.createdAt));
                if (user.deleted) {
                    return <i style={{color:"lightgray"}}>{createdAt}</i>
                }
                return (createdAt);
            }
        }
    ];

    let config = {
        page_size: 15,
        length_menu: [15, 25, 50, 100],
        show_filter: true,
        show_pagination: true,
        filename: "Logs Systeme",
        button: {
            // excel: true,
            // pdf: true,
            // print: true,
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
  return (
    <div className="row">
    <div className="col s12">
        <div className="card">
            <div className="card-content">
                <div className="row">
                    <div className="col l6 m6 s12">
                        <h4 className="card-title">Liste des logs du serveur&nbsp;</h4>
                    </div>
                    <div className="col l6 m6 s12" style={{ textAlign: "end" }}>
                        <img src={pdf} alt="" style={{ marginRight: "15px", cursor: "pointer" }} onClick={(e) => { handlePrint(config, columns, data, 0) }} />
                        <img src={excel} alt="" style={{ cursor: "pointer" }} onClick={(e) => { table2XLSX("Liste_des_unités_opérationnelles" + today().replaceAll("/", ""), "app-ps") }} />
                    </div>
                </div>

                <div className="row">
                    <div className="col s12">
                        <ReactDatatable
                            className={"responsive-table table-xlsx app-ps"}
                            config={config}
                            records={data}
                            columns={columns}
                           
                        />
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
  )
}

export default Log
