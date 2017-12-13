import React from 'react';
import styles from '../../page/demo.css'

class StyleButton extends React.Component {
    constructor(props) {
        super(props);
        this.onToggle = (e) => {
            const {style} = this.props
            e.preventDefault();
            this.props.onToggle(style);
        };
    }

    render() {
        const {active, label, url} = this.props

        let className = styles['RichEditor-styleButton'] + ' editorTools-item';
        if (active) {
            className += ' ' + styles['RichEditor-activeButton'];
        }
        
        return (
                <div className={className} onMouseDown={this.onToggle}>
                    <button>{url === './img/bold.svg' ?
                        <img className="item-icon" src={require('./img/bold.svg')} alt=""/> : ''}
                        {url === './img/italic.svg' ?
                            <img className="item-icon" src={require('./img/italic.svg')} alt=""/> : ''}
                        {url === './img/title.svg' ?
                            <img className="item-icon" src={require('./img/title.svg')} alt=""/> : ''}
                        {url === './img/cite.svg' ?
                            <img className="item-icon" src={require('./img/cite.svg')} alt=""/> : ''}
                        {url === './img/code.svg' ?
                            <img className="item-icon" src={require('./img/code.svg')} alt=""/> : ''}
                        {url === './img/unorderedlist.svg' ?
                            <img className="item-icon" src={require('./img/unorderedlist.svg')} alt=""/> : ''}
                        {url === './img/orderedlist.svg' ?
                            <img className="item-icon" src={require('./img/orderedlist.svg')} alt=""/> : ''}
                        {url === './img/link.svg' ?
                            <img className="item-icon" src={require('./img/link.svg')} alt=""/> : ''}
                        {url === './img/pic.svg' ?
                            <img className="item-icon" src={require('./img/pic.svg')} alt=""/> : ''}
                        {url === './img/video.svg' ?
                            <img className="item-icon" src={require('./img/video.svg')} alt=""/> : ''}
                        {url === './img/formulae.svg' ?
                            <img className="item-icon" src={require('./img/formulae.svg')} alt=""/> : ''}
                        {url === './img/line.svg' ?
                            <img className="item-icon" src={require('./img/line.svg')} alt=""/> : ''}
                        {url === './img/removeformat.svg' ?
                            <img className="item-icon" src={require('./img/removeformat.svg')} alt=""/> : ''}
                    </button>
            </div>
        );
    }
}

export default StyleButton