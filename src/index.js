import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom'
import { Provider, connect } from 'react-redux'
import history from './history'
import Helmet from 'react-helmet'
import './index.css';
import AutocompleteInput from './App';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './store'
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
                    title="投研通"
                    meta={[
                        { name: 'keywords', content: '投研通' },
                        { name: 'description', content: '投研通' }
                    ]}
                />
                <Switch>
                    <Route path="/" component={AutocompleteInput} />
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
