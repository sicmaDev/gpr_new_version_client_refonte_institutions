const initialState = {
    isLoading: false,
    isSuccess: false,
    showMessage: false,
    message: '',
    items: [],
    current: null,
    current_valeurs: {
        global: {},
        claim: {},
        denun: {},
        suggest: {}
    },
    isCreated: false,
    current_id: 0,
    showCreateForm: false,
    showForm: false,
    form: {
        title: null,
        default: false,
        valeurs: {

        }
    },
    tmpInit: {
        id: 0,
        default: false,
        title: 'Rapport GPR',
        valeurs: {
            global: {
                globalPieChartRef: true,
                globalLineChartRef: true,
                globalByCanalPieChartRef: true,
                globalByCanalBarChartRef: true,
                globalByObjetPieChartRef: true,
                globalByObjetBarChartRef: true,
                resolutionPieChartRef: true,
                evolutionByAgenceByAnneeBarChartRef: true,
            },
            claim: {
                resolutionClaimDelaiByMonthBarChartRef: true,
                resolutionClaimDelaiByMonthByAgenceBarChartRef: true,
                claimByAgencePieChartRef: true,
                claimByAgenceBarChartRef: true,
                claimByGenderPieChartRef: true,
                claimByGenderBarChartRef: true,
                claimByCanalPieChartRef: true,
                claimByCanalBarChartRef: true,
                claimByObjetPieChartRef: true,
                claimByObjetBarChartRef: true,
                claimByGravitePieChartRef: true,
                claimByGraviteBarChartRef: true,
                claimBySatisfactionPieChartRef: true,
                tauxMensuelClaimByMonthByAgenceBarChartRef: true,
                tauxMensuelClaimByMonthBarChartRef: true,
            },
            denun: {
                denunByAgencePieChartRef: true,
                denunByAgenceBarChartRef: true,
                denunByCanalPieChartRef: true,
                denunByCanalBarChartRef: true,
                denunByObjetPieChartRef: true,
                denunByObjetBarChartRef: true,
                resolutionDenunDelaiByMonthBarChartRef: true,
                resolutionDenunDelaiByMonthByAgenceBarChartRef: true,
                denunByGravitePieChartRef: true,
                denunByGraviteBarChartRef: true,
            },
            suggest: {
                sugByAgencePieChartRef: true,
                sugByAgenceBarChartRef: true,
                sugByGenderPieChartRef: true,
                sugByGenderBarChartRef: true,
                sugByCanalPieChartRef: true,
                sugByCanalBarChartRef: true,
            }
        }
    }
};

const RapportsTemplate = (state = initialState, action) => {
    switch (action.type) {
        case "RAPPORTS_TEMPLATE_IS_LOADING":
            return {
                ...state,
                isLoading: action.payload,
            };

        case "RAPPORTS_TEMPLATE_SET_STATE":
            return {
                ...state,
                ...action.payload,
            };
        case "RAPPORTS_TEMPLATE_SHOW_LOADING":
            return {
                ...state,
                isLoading: true,
            };
        case "RAPPORTS_TEMPLATE_HIDE_LOADING":
            return {
                ...state,
                isLoading: false,
            };
        case "RAPPORTS_TEMPLATE_SHOW_MESSAGE":
            return {
                ...state,
                showMessage: true,
            };
        case "RAPPORTS_TEMPLATE_HIDE_MESSAGE":
            return {
                ...state,
                showMessage: false,
            };
        case "RAPPORTS_TEMPLATE_IS_SUCCESS":
            return {
                ...state,
                isSuccess: true,
            };
        case "RAPPORTS_TEMPLATE_IS_ERROR":
            return {
                ...state,
                isSuccess: false,
            };
        case "RAPPORTS_TEMPLATE_SET_MESSAGE":
            return {
                ...state,
                message: action.payload,
            };
        case "RAPPORTS_TEMPLATE_SET_CURRENT":
            return {
                ...state,
                current_valeurs: action.payload,
            };
        case "RAPPORTS_TEMPLATE_SET_ITEMS":
            return {
                ...state,
                items: action.payload,
            };
        default:
            return state;
    }
};

export default RapportsTemplate;
