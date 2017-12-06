import * as React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

// import Header from '../components/Header'
// import Footer from '../components/Footer'

import Home from '../page/App'

class MainLayout extends React.Component {
    render() {
        return (
            <div className="app">
                {/*<Header />*/}
                <Switch>
                    <Route exact={true} path="/" component={Home} />
                </Switch>
                {/*<Footer />*/}
            </div>
        )
    }
}

// const PrivateRoute = ({component: Component, token, ...rest}) => {
//     return (
//         <Route
//             {...rest}
//             render={(props) => (token && token.length > 0)
//                 ? <Component {...props} />
//                 : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
//         />
//     )
// }

const mapStateToProps = (state) => {
    return {
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout)

