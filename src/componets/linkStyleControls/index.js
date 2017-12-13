import React from 'react';
import styles from '../../page/demo.css'
import StyleButton from '../StyleButton'
import * as Draft from 'draft-js';
const {Editor, EditorState, RichUtils} = Draft;

const BLOCK_TYPES = [
    {id: 1, url: './img/link.svg',name:'链接', style: 'LINK' },
];

class LinkStyleControls extends Editor {
    constructor(props){
        super(props)
    }
    render() {
        const {editorState, onToggle} = this.props;
        const selection = editorState.getSelection();
        const blockType = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();

        return (
            <div className={styles["RichEditor-controls"]} style={{display:'flex'}}>
                {BLOCK_TYPES.map((type) =>
                    <StyleButton
                        key={type.id}
                        active={type.style === blockType}
                        label={type.name}
                        onToggle={onToggle}
                        style={type.style}
                        url={type.url}
                    />
                )}
            </div>
        );
    }
};
export default LinkStyleControls