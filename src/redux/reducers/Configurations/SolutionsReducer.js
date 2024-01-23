const initialState = {
    isLoading: false,
    solution_errors: {},
    id: "",
    objet: "",
    objetLibelle :"",
    solution: "",
    items: [],
    selectedItem: {},
    etat: false,
    etat2: false,
    etat3: false,
};

const SolutionsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING':
            return {
                ...state,
                isLoading: !state.isLoading,
            };
        case 'SOLUTION_ERRORS':
            return {
                ...state,
                solution_errors: action.payload,
            };
        case 'SOLUTION_ID_CHANGED':
            return {
                ...state,
                id: action.payload,
            };
        case 'SOLUTION_OBJET_CHANGED':
            return {
                ...state,
                objet: action.payload,
            };
        case 'SOLUTION_OBJET_LIBELLE_CHANGED':
            return {
                ...state,
                objetLibelle: action.payload,
            };
        case 'SOLUTION_SOLUTION_CHANGED':
            return {
                ...state,
                solution: action.payload,
            };
        case 'SOLUTION_ITEMS_CHANGED':
            return {
                ...state,
                items: action.payload,
            };
        case 'SOLUTION_SELECTED_ITEM_CHANGED':
            return {
                ...state,
                selectedItem: action.payload,
            };
        case 'SOLUTION_ETAT_CHANGED':
            return {
                ...state,
                etat: action.payload,
            };
        case 'SOLUTION_ETAT2_CHANGED':
            return {
                ...state,
                etat2: action.payload,
            };
        case 'SOLUTION_ETAT3_CHANGED':
            return {
                ...state,
                etat3: action.payload,
            };
        default:
            return state
    }
}

export default SolutionsReducer;