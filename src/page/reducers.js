export function promptData(state, action) {
    if(!state){
        state = {fetching: false, entities: {}, error: ''}
    }
    switch (action.type) {
        case 'GET_PROMPT_SUCCESS':
            const data = action.data.result
            let str = []
            for(let i =0; i < data.length; i++){
                str[i] = ''
                for(let j=0; j<data[i].length; j++){
                    str[i] +=  data[i][j]
                }
            }
            return {...state, entities: str}

        case 'GET_PROMPT_ERROR':
            return {...state, error: action.data}

        // case 'IS_GETTING_PROMPT':
        //     return {...state, fetching: action.data}

        default:
            return state
    }
}