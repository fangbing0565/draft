const ENV = process.env.NODE_ENV
const API_HOST = 'http://' + process.env.REACT_APP_HOST
const WS_HOST = 'ws://' + process.env.REACT_APP_HOST + '/ws'

const EMAIL_REGEX = '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$'
const PASSWORD_REGEX = '^[0-9A-Za-z]{6,}$' 
export {
    ENV,
    API_HOST,
    WS_HOST,
    EMAIL_REGEX,
    PASSWORD_REGEX,
}
