import { combineReducers } from "redux";
import LayoutReducer from "./reducers/LayoutReducer";
import PointsServicesReducer from "./reducers/Configurations/PointsServicesReducer";
import LoginReducer from "./reducers/LoginReducer";
import LanguesReducer from "./reducers/Configurations/LanguesReducer";
import ProduitsReducer from "./reducers/Configurations/ProduitsReducer";
import PosteReducer from "./reducers/Configurations/PostesReducer";
import ObjetsReducer from "./reducers/Configurations/ObjetsReducer";
import SupportsCollectesReducer from "./reducers/Configurations/SupportsCollectesReducer";
import RecoursExternesReducer from "./reducers/Configurations/RecoursExternesReducer";
import UtilisateursReducer from "./reducers/Configurations/UtilisateursReducer";
import EnregistrementReclamationReducer from "./reducers/Reclamations/EnregistrementReclamationReducer";
import ListeReclamationsReducer from "./reducers/Reclamations/ListeReclamationsReducer";
import TraitementReclamationReducer from "./reducers/Reclamations/TraitementReclamationReducer";
import MesurerReclamationReducer from "./reducers/Reclamations/MesureReclamationReducer";
import AssuranceReclamationReducer from "./reducers/Reclamations/AssuranceReclamationReducer";
import ListeSuggestionsReducer from "./reducers/Suggestions/ListeSuggestionsReducer";
import EnregistrementSuggestionReducer from "./reducers/Suggestions/EnregistrementSuggestionReducer";
import TraitementSuggestionReducer from "./reducers/Suggestions/TraitementSuggestionReducer";
import AlertesReducer from "./reducers/Alertes/AlertesReducer";
import CompteDetailsReducer from "./reducers/Compte/CompteDetailsReducer";
import ChangePasswordReducer from "./reducers/Compte/ChangePasswordReducer";
import GlobalReducer from "./reducers/Rapports/GlobalReducer";
import BceaoReducer from "./reducers/Rapports/BceaoReducer";
import DashboardReducer from "./reducers/DashboardReducer";
import DocumentsReducer from "./reducers/Configurations/DocumentsReducer";
import FaqReducer from "./reducers/Configurations/FaqReducer";
import HelpReducer from "./reducers/HelpReducer";
import NotificationsReducer from "./reducers/Configurations/NotificationsReducer";
import SolutionsReducer from "./reducers/Configurations/SolutionsReducer";
import CategoriesReducer from "./reducers/Configurations/CategoriesReducer";
import InstitutionReducer from "./reducers/Configurations/InstitutionReducer";
import EmailReducer from "./reducers/Configurations/EmailReducer";
import SmsReducer from "./reducers/Configurations/SmsReducer";
import BotReducer from "./reducers/Configurations/BotReducer";
import LockscreenReducer from "./reducers/LockscreenReducer";
import WhatsappReducer from "./reducers/WhatsappReducer";
import RapportsTemplate from "./reducers/Rapports/TemplateReducer";
import HistoriqueReclamationReducer from "./reducers/Reclamations/HistoriqueReclamationReducer";


const reducer = combineReducers({
    layout: LayoutReducer,
    login:LoginReducer,
    ps: PointsServicesReducer,
    langue:LanguesReducer,
    produit:ProduitsReducer,
    poste:PosteReducer,
    objet:ObjetsReducer,
    categorie:CategoriesReducer,
    solution : SolutionsReducer,
    sc:SupportsCollectesReducer,
    recoursExternes:RecoursExternesReducer,
    user:UtilisateursReducer,
    claim_record:EnregistrementReclamationReducer,
    claim_historique:HistoriqueReclamationReducer,
    claim_list: ListeReclamationsReducer,
    claim_handle: TraitementReclamationReducer,
    claim_appraise: MesurerReclamationReducer,
    claim_assurance: AssuranceReclamationReducer,
    suggestion_list: ListeSuggestionsReducer,
    suggestion_record: EnregistrementSuggestionReducer,
    suggestion_handle: TraitementSuggestionReducer,
    alert:AlertesReducer,
    compte_details:CompteDetailsReducer,
    change_password:ChangePasswordReducer,
    report: GlobalReducer,
    bceao: BceaoReducer,
    dashboard : DashboardReducer,
    document : DocumentsReducer,
    faq : FaqReducer,
    help : HelpReducer,
    notification : NotificationsReducer,
    institution : InstitutionReducer,
    mail : EmailReducer,
    sms : SmsReducer,
    gprbot : BotReducer,
    lockscreen:LockscreenReducer,
    whatsapp:WhatsappReducer,
    templates:RapportsTemplate
});
  
export default reducer;
  