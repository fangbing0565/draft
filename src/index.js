import React from 'react';
import ReactDOM from 'react-dom';

import { Router, Switch, Route } from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import history from './history'
import Helmet from 'react-helmet'
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './store'
import MainLayout from './routes/MainLayout'

const store = configureStore({})


const mapStateToProps = (state) => {
    return {
        width: state.width,
    }
}
class App extends React.Component {
    render() {
        return (
            <div>
                <Helmet
                    title="智能编辑器"
                    meta={[
                        { name: 'keywords', content: '智能编辑器' },
                        { name: 'description', content: '智能编辑器' }
                    ]}
                />
                <Switch>
                    <Route path="/" component={MainLayout} />
                </Switch>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
}
ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route component={connect(mapStateToProps, mapDispatchToProps)(App)} />
        </Router>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();
