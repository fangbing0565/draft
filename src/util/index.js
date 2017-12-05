function json2Form(json) {
    if (!json) {
        return ''
    }

    let str = []
    for (let p in json) {
        if (json.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]))
        }
    }
    return str.join('&')
}

async function ajax(url, payload, method) {
    if (!url) {
        return
    }

    let init = {}
    const auth = localStorage.getItem('token') ? ('JWT ' + localStorage.getItem('token')) : ''

    if (method === 'GET' || method === 'get') {
        url = url + json2Form(payload)

        init = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': auth
            },
        }
    } else if (method === 'POST' || method === 'post') {
        init = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Authorization': auth
            },
            body: json2Form(payload)
        }
    } else {
        return
    }

    // url = API_HOST + url

    try {
        const response = await fetch(url, init)
        if (
            response.status === 500 ||
            response.status === 404
        ) {
            return Object.assign({}, {error: response.statusText}, {hasError: true})
        }
        const responseJson = await response.json()

        if (response.status.toString()[0] !== '2') {
            return {...responseJson, hasError: true}
        } else {
            return responseJson
        }
    } catch (error) {
        return error.statusText
    }
}

async function ajaxJson(url, payload, method) {
    if (!url) {
        return
    }

    let init = {}
    const auth = localStorage.getItem('token') ? ('JWT ' + localStorage.getItem('token')) : ''

    if (method === 'GET' || method === 'get') {
        url = url + json2Form(payload)

        init = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': auth
            },
        }
    } else if (method === 'POST' || method === 'post') {
        init = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': auth
            },
            body: JSON.stringify(payload)
        }
    } else {
        return
    }

    // url = API_HOST + url

    try {
        const response = await fetch(url, init)
        if (
            response.status === 500 ||
            response.status === 404
        ) {
            return Object.assign({}, {error: response.statusText}, {hasError: true})
        }
        const responseJson = await response.json()

        if (response.status.toString()[0] !== '2') {
            return {...responseJson, hasError: true}
        } else {
            return responseJson
        }
    } catch (error) {
        return error.statusText
    }
}

export {
    ajax,
    ajaxJson
}