import React from 'react';
import styles from '../../page/demo.css'
import StyleButton from '../StyleButton'
import * as Draft from 'draft-js';
const {Editor, EditorState, RichUtils} = Draft;

const BLOCK_TYPES = [
    {id: 1, url: './img/bold.svg',name:'粗体', style: 'BOLD' }, {id: 2, url: './img/italic.svg',name:'斜体',style: 'ITALIC'},
];
const temp = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'left', style: 'left' },
    { label: 'right', style: 'right' },
    { label: 'center', style: 'center' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
]

class InlineStyleControls extends Editor {
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
export default InlineStyleControls
