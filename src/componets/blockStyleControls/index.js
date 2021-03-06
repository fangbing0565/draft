import React from 'react';
import styles from '../../page/demo.css'
import StyleButton from '../StyleButton'
import * as Draft from 'draft-js';

const {Editor, EditorState, RichUtils} = Draft;
var INLINE_STYLES = [
    {id: 1, url: './img/title.svg',name:'标题',style: 'header-two'},
    {id: 2, url: './img/cite.svg',name:'引用块',style: 'blockquote'},
    {id: 3, url: './img/code.svg',name:'代码块',style: 'code-block'},
    {id: 4, url: './img/unorderedlist.svg',name:'无序列表',style: 'unordered-list-item'},
    {id: 5, url: './img/orderedlist.svg',name:'有序列表',style: 'ordered-list-item'},
];
class BlockStyleControls extends Editor {
    constructor(props) {
        super(props)
    }

    render() {
        const {editorState, onToggle} = this.props;
        var currentStyle = editorState.getCurrentInlineStyle();
        return (
            <div className={styles["RichEditor-controls"]} style={{display:'flex'}}>
                {INLINE_STYLES.map(type =>
                    <StyleButton
                        key={type.id}
                        active={currentStyle.has(type.style)}
                        label={type.name}
                        onToggle={onToggle}
                        style={type.style}
                        url={type.url}
                    />
                )}
            </div>
        );
    }
}
export default BlockStyleControls
