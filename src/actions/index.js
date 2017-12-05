import { ajax } from '../util'
export function getPromptSuccess(data) {
    return {
        type: 'GET_PROMPT_SUCCESS',
        data
    }
}

export function isGettingPrompt(data) {
    return {
        type: 'IS_GETTING_PROMPT',
        data
    }
}

export function getPromptError(data) {
    return {
        type: 'GET_PROMPT_ERROR',
        data
    }
}


export function getPrompt(data) {
    return (dispatch) => {
        console.log(1)
        // dispatch(isGettingPrompt(true))
        // const url = '/prediction'
        // ajax(url, data, 'POST').then(res => {
        //     if (res.hasError) {
        //         dispatch(getPromptError(res[Object.keys(res)[0]]))
        //     } else {
        //         dispatch(getPromptSuccess(res))
        //     }
        //     dispatch(isGettingPrompt(false))
        // })
    }
}