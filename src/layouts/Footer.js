import React from "react";
import {APP_OWNER, APP_OWNER_WEBSITE} from "../Utils/globals"
import {loadItemFromSessionStorage} from "../Utils/utils";
import {isLicenseDays} from "../Utils/license";

const Footer = (props) => {

    if( loadItemFromSessionStorage("app-license") === undefined){
        var contain = isLicenseDays();
        var text = "";
        if (contain=="nothing") {
            text = "";
        } else if(contain<=0){
            text = "Votre licence a expirée !";
        } else {
            text = "Votre licence expire dans "+contain+" jours !";
        }
    }
    return (
        
        <footer
            className="page-footer footer footer-static footer-light footer-bottom white navbar-border navbar-shadow">
            <div className="footer-copyright">
                <div className="container"><span>&copy; {(new Date().getFullYear())} <a href={APP_OWNER_WEBSITE} target="_blank">{APP_OWNER}</a> Tous droits réservés.</span>
                <span className="right hide-on-small-only hide"> <a href="#"></a></span></div>
                <div className="" style={{
                    color: "red",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "11px",
                }}>
                    {text}
                </div>
            </div>
           
        </footer>
    )
}

export default Footer