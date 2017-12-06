import {combineReducers} from 'redux'

import * as homeReducers from '../page/reducers'

const reducers = Object.assign(
    {},
    homeReducers,
)

export default combineReducers(reducers)
