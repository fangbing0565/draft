import React from 'react';
import styles from '../../page/demo.css'
import StyleButton from '../StyleButton'
import * as Draft from 'draft-js';

const {Editor, EditorState, RichUtils} = Draft;
var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
];

class InlineStyleControls extends Editor {
    constructor(props) {
        super(props)
    }

    render() {
        const {editorState, onToggle} = this.props;
        var currentStyle = editorState.getCurrentInlineStyle();
        return (
            <div className={styles["RichEditor-controls"]}>
                {INLINE_STYLES.map(type =>
                    <StyleButton
                        key={type.label}
                        active={currentStyle.has(type.style)}
                        label={type.label}
                        onToggle={onToggle}
                        style={type.style}
                    />
                )}
            </div>
        );
    }
}
export default InlineStyleControls
