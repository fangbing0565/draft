import {combineReducers} from 'redux'

function width(state, action) {
    if (!state) {
        state = window.innerWidth
    }
    switch (action.type) {
        case 'SCREEN_WIDTH':
            return action.width

        default:
            return state
    }
}

export function prompt(state, action) {
    if(!state){
        state = {fetching: false, entities: {}, error: ''}
    }
    switch (action.type) {
        case 'GET_PROMPT_SUCCESS':
            return {...state, entities: action.data}

        case 'GET_PROMPT_ERROR':
            return {...state, error: action.data}

        case 'IS_GETTING_PROMPT':
            return {...state, fetching: action.data}

        default:
            return state
    }
}


const reducers = Object.assign(
    {},
    width,
    prompt,
)

export default combineReducers(reducers)
