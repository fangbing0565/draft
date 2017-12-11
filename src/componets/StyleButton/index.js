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
        const {active, label} = this.props

        let className = styles['RichEditor-styleButton'] + ' editorTools-item';
        if (active) {
            className += ' ' + styles['RichEditor-activeButton'];
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
                {label}
            </span>
        );
    }
}
export default StyleButton