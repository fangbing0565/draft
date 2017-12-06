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
    // return (dispatch) => {
    //     fetch('http://54.223.181.183:3000/prediction', {
    //         method: 'POST',
    //         mode: 'cors',
    //         credentials: 'include',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data)
    //     }).then(function(res) {
    //         dispatch(getPromptError(res[Object.keys(res)[0]]))
    //         console.log(res);
    //     }).then(function (res) {
    //         console.log(res);
    //         dispatch(getPromptSuccess(res))
    //     });
    // }

    //
    // //
    return (dispatch) => {
        console.log(1)
        // let res = ['res1','res2']
        // dispatch(getPromptSuccess(res))
        // dispatch(isGettingPrompt(true))
        const url = '/prediction'
        ajax(url, data, 'POST').then(res => {
            if (res.hasError) {
                dispatch(getPromptError(res[Object.keys(res)[0]]))
            } else {
                dispatch(getPromptSuccess(res))
            }
            // dispatch(isGettingPrompt(false))
        })
    }
}