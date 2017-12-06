export function promptData(state, action) {
    if(!state){
        state = {fetching: false, entities: {}, error: ''}
    }
    switch (action.type) {
        case 'GET_PROMPT_SUCCESS':
            return {...state, entities: action.data}

        case 'GET_PROMPT_ERROR':
            return {...state, error: action.data}

        // case 'IS_GETTING_PROMPT':
        //     return {...state, fetching: action.data}

        default:
            return state
    }
}