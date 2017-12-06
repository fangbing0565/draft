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
    // const auth = localStorage.getItem('token') ? ('JWT ' + localStorage.getItem('token')) : ''

    if (method === 'GET' || method === 'get') {
        url = url + json2Form(payload)

        init = {
            method: 'GET',
            credentials: 'include',
            headers: {
            },
        }
    } else if (method === 'POST' || method === 'post') {
        init = {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'cache-control': 'no-cache',
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

async function ajaxJson(url, payload, method) {
    if (!url) {
        return
    }

    let init = {}
    // const auth = localStorage.getItem('token') ? ('JWT ' + localStorage.getItem('token')) : ''

    if (method === 'GET' || method === 'get') {
        url = url + json2Form(payload)

        init = {
            method: 'GET',
            credentials: 'include',
            headers: {
                // 'Authorization': auth
            },
        }
    } else if (method === 'POST' || method === 'post') {
        init = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                // 'Authorization': auth
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

function filterPromptData  (data, filterType){
    data = data.result
    let str = []
    for(let i =0; i < data.length; i++){
        str[i] = ''
        for(let j=0; j<data[i].length; j++){
            const end = data[i][j].length
            let temp = ''
            if(data[i][j].indexOf('product_name') >= 0  && filterType.name){
                const start = data[i][j].indexOf('product_name') - 12
                temp = data[i][j].slice(0,start) + filterType.name + data[i][j].slice(12,end)
            }
            if(data[i][j].indexOf('category') >= 0  && filterType.category){
                const start = data[i][j].indexOf('product_name') -8
                temp = data[i][j].slice(0,start) + filterType.category + data[i][j].slice(8,end)
            }
            if(data[i][j].indexOf('expense') >= 0  && filterType.expense){
                const start = data[i][j].indexOf('product_name') -7
                temp = data[i][j].slice(0,start) + filterType.category + data[i][j].slice(7,end)
            }
            if(data[i][j] === 'paragraph'){
                temp = '\n'
            }
            str[i] += temp ? temp : data[i][j]
        }
    }
    for(let i = 0; i <= str.length; i ++){
        if(!str[i]){
            str.splice(i,1)
        }
    }
    return str
}

export {
    ajax,
    ajaxJson,
    filterPromptData
}