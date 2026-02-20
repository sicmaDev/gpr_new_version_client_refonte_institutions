// pages/SupersetPage.js
import React from 'react';
import SupersetDashboard from '../../components/superset/SupersetDashboard'; // Chemin vers votre fichier

const Superset = () => {
    return (
        <div className="container-fluid">
            <h4>Superset Rapport GPR</h4>
            
            <div className="row">
                <div className="col-12">
                    <SupersetDashboard /> 
                </div>
            </div>
        </div>
    );
};

export default Superset;