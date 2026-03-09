const initialState = {
  isLoading: false,
  claim_record_errors: {},
  id: "",
  firstname: "",
  lastname: "",
  address: "",
  phone: "",
  gender: "",
  language: "",
  dossierimf: "",
  crew: "",
  code: "",
  recorded_at: "",
  recorded_at_dp: "",
  collect: "",
  subject: "",
  subjectLibelle: "",
  underSubject: "",
  underSubjectLibelle: "",
  product: "",
  unit: "",
  content: "",
  etat: false,
  etat2: false,
  items: [],
  selectedFiles: [],
  selectedItem: {},
  selectedItemFiles: [],
  selectedItemAudio: [],
};
const claimRecordReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        isLoading: !state.isLoading,
      };
    case "CLAIM_RECORD_ERRORS":
      return {
        ...state,
        claim_record_errors: action.payload,
      };
    case "CLAIM_RECORD_FIRSTNAME_CHANGED":
      return {
        ...state,
        firstname: action.payload,
      };
    case "CLAIM_RECORD_ID_CHANGED":
      return {
        ...state,
        id: action.payload,
      };
    case "CLAIM_RECORD_LASTNAME_CHANGED":
      return {
        ...state,
        lastname: action.payload,
      };
    case "CLAIM_RECORD_ADDRESS_CHANGED":
      return {
        ...state,
        address: action.payload,
      };
    case "CLAIM_RECORD_PHONE_CHANGED":
      return {
        ...state,
        phone: action.payload,
      };
    case "CLAIM_RECORD_GENDER_CHANGED":
      return {
        ...state,
        gender: action.payload,
      };
    case "CLAIM_RECORD_LANGUAGE_CHANGED":
      return {
        ...state,
        language: action.payload,
      };
    case "CLAIM_RECORD_LANGUAGE_LIBELLE_CHANGED":
      return {
        ...state,
        languageLibelle: action.payload,
      };
    case "CLAIM_RECORD_DOSSIERIMF_CHANGED":
      return {
        ...state,
        dossierimf: action.payload,
      };
    case "CLAIM_RECORD_CREW_CHANGED":
      return {
        ...state,
        crew: action.payload,
      };
    case "CLAIM_RECORD_CODE_CHANGED":
      return {
        ...state,
        code: action.payload,
      };
    case "CLAIM_RECORD_RECORDED_AT_CHANGED":
      return {
        ...state,
        recorded_at: action.payload,
      };
    case "CLAIM_RECORD_RECORDED_AT_DP_CHANGED":
      return {
        ...state,
        recorded_at_dp: action.payload,
      };
    case "CLAIM_RECORD_COLLECT_CHANGED":
      return {
        ...state,
        collect: action.payload,
      };
    case "CLAIM_RECORD_COLLECT_LIBELLE_CHANGED":
      return {
        ...state,
        collectLibelle: action.payload,
      };
    case "CLAIM_RECORD_SUBJECT_CHANGED":
      return {
        ...state,
        subject: action.payload,
      };
    case "CLAIM_RECORD_SUBJECT_LIBELLE_CHANGED":
      return {
        ...state,
        subjectLibelle: action.payload,
      };
    case "CLAIM_RECORD_UNDERSUBJECT_CHANGED":
      return {
        ...state,
        underSubject: action.payload,
      };
    case "CLAIM_RECORD_UNDERSUBJECT_LIBELLE_CHANGED":
      return {
        ...state,
        underSubjectLibelle: action.payload,
      };
    case "CLAIM_RECORD_PRODUCT_CHANGED":
      return {
        ...state,
        product: action.payload,
      };
    case "CLAIM_RECORD_PRODUCT_LIBELLE_CHANGED":
      return {
        ...state,
        productLibelle: action.payload,
      };
    case "CLAIM_RECORD_UNIT_CHANGED":
      return {
        ...state,
        unit: action.payload,
      };
    case "CLAIM_RECORD_UNIT_LIBELLE_CHANGED":
      return {
        ...state,
        unitLibelle: action.payload,
      };
    case "CLAIM_RECORD_CONTENT_CHANGED":
      return {
        ...state,
        content: action.payload,
      };
    case "CLAIM_RECORD_RESET":
      return {
        state: undefined,
      };
    case "CLAIM_RECORD_ITEMS_CHANGED":
      return {
        ...state,
        items: action.payload,
      };
    case "CLAIM_RECORD_SELECTED_FILES_CHANGED":
      return {
        ...state,
        selectedFiles: [...state.selectedFiles, action.payload],
      };
    case "CLAIM_RECORD_SELECTED_FILES_RESET":
      return {
        ...state,
        selectedFiles: action.payload,
      };
    case "CLAIM_RECORD_SELECTED_ITEM_CHANGED":
      return {
        ...state,
        selectedItem: action.payload,
      };
    case "CLAIM_RECORD_SELECTED_ITEM_FILES_CHANGED":
      return {
        ...state,
        selectedItemFiles: action.payload,
      };
    case "CLAIM_RECORD_SELECTED_ITEM_AUDIO_CHANGED":
      return {
        ...state,
        selectedItemAudio: action.payload,
      };
    case "CLAIM_RECORD_ETAT_CHANGED":
      return {
        ...state,
        etat: action.payload,
      };
    case "CLAIM_RECORD_ETAT2_CHANGED":
      return {
        ...state,
        etat2: action.payload,
      };
    case "CLAIM_RECORD_EXISTING_CLAIMS_CHANGED":
      return {
        ...state,
        existingClaims: action.payload,
      };
    case "CLAIM_RECORD_MODAL_VISIBLE_CHANGED":
      return {
        ...state,
        modalVisible: action.payload,
      };
    default:
      return state;
  }
};

export default claimRecordReducer;
