const initialState = {
    isLoading: false,
    isSuccess:false,
    showMessage:false,
    message:'',
    currentItem:null,
    items:[],
    showModal:false,
};
const HistoriqueReclamationReducer = (state = initialState, action) => {
    switch (action.type) {
        


        case 'CLAIM_HISTORIQUE_IS_LOADING_CHANGED':
            return {
                ...state,
                isLoading: action.payload,
            };
        case 'CLAIM_HISTORIQUE_IS_SUCCESS_CHANGED':
            return {
                ...state,
                isSuccess: action.payload,
            };
        case 'CLAIM_HISTORIQUE_SHOW_MESSAGE_CHANGED':
            return {
                ...state,
                showMessage: action.payload,
            };
        case 'CLAIM_HISTORIQUE_MESSAGE_CHANGED':
            return {
                ...state,
                message: action.payload,
            };

        case 'CLAIM_HISTORIQUE_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'CLAIM_HISTORIQUE_SHOW_MODAL_CHANGED':
            return {
                ...state,
                showModal: action.payload,
            };
        case 'CLAIM_HISTORIQUE_CURRENT_ITEM_CHANGED':
            return {
                ...state,
                currentItem: action.payload,
            };
            
        case 'CLAIM_HISTORIQUE_RESET_ALL':
            return {
                isLoading: false,
                isSuccess:false,
                showMessage:false,
                message:'',
                currentItem:null,
                items:[],
                showModal:false,
            };
        default:
            return state
    }
}

export default HistoriqueReclamationReducer;