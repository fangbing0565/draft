import React from 'react';
import * as Draft from 'draft-js';
import {AutocompleteEditor} from './componets/autocomplete';
import SuggestionList from './componets/suggestions';
import styles from './styles/styles'
import {normalizeIndex, filterArray} from './util/utils';
import { connect } from 'react-redux'
import * as triggers from './util/triggers';
import * as data from './data/data';
import addSuggestion from './componets/addsuggestion';
import 'whatwg-fetch'
import { getPrompt } from './actions'

var filteredArrayTemp;
const {Entity, Modifier, Editor, EditorState, convertToRaw} = Draft;


class AutocompleteInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            autocompleteState: null,
            backGround: false,
            currentTool: 0,
            currentType: '',
            content: {},
            selection: {},
            requestStr: '',
        };
        this.mark = ['。', '!', '！', '?', '？', '.', ',', '，', ';']
    }

    Ajax = (type, url, data) => {
        fetch(url, {
            method: type.toUpperCase(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(
            (res) => {
                console.log(res)
            }
        ).then(
            (res) => {
                console.log(res)
            }
        )
    }

    onChange = (editorState) => {
        this.setState({editorState});
        const content = this.state.editorState.getCurrentContent();
        const selection = this.state.editorState.getSelection();
        this.setState(
            {
                content: convertToRaw(content),
                selection: selection,
            },
            () => {
                const content = this.state.editorState.getCurrentContent()
                const selection = this.state.editorState.getSelection()
                console.log(selection, selection.getEndKey(), selection.getEndOffset(), convertToRaw(content))
                this.cursorToMark(convertToRaw(content), selection)
            }
        )
    }

    cursorToMark = (data, selection) => {
        let cursor = {
            key: selection.getEndKey(),
            offset: selection.getEndOffset()
        }
        for (let i = 0; i < data.blocks.length; i++) {
            if (data.blocks[i].key === cursor.key && data.blocks[i].text.slice(cursor.offset - 1, cursor.offset) !== '' && this.mark.indexOf(data.blocks[i].text.slice(cursor.offset - 1, cursor.offset)) >= 0) {
                this.requestStr = this.getRequestStr(data, i, cursor.offset)
                // todo  弹出提示选择自动填充下一句
                // this.insertResponse()
                let data = {'context': this.requestStr}
                this.props.getPrompt(data)
            }
        }
    }

    insertResponse = () => {
        //    todo  取回数据 更新进对应位置
        const text = ''
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const txt = '机器写作部分。' + text;
        let nextEditorState = EditorState.createEmpty();
        if (selection.isCollapsed()) {
            const nextContentState = Modifier.insertText(contentState, selection, txt);
            nextEditorState = EditorState.push(
                editorState,
                nextContentState,
                'insert-characters'
            );
        } else {
            const nextContentState = Modifier.replaceText(contentState, selection, text);
            nextEditorState = EditorState.push(
                editorState,
                nextContentState,
                'insert-characters'
            );
        }
        this.setState(
            {
                editorState: nextEditorState
            }
        )

    }

    onAutocompleteChange = (autocompleteState) => {
        console.log(autocompleteState)
        this.setState({
            autocompleteState
        })
    };

    onInsert = (insertState) => {
        if (!filteredArrayTemp) {
            return null;
        }
        const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
        insertState.text = insertState.trigger + filteredArrayTemp[index];
        return addSuggestion(insertState);
    };

    getRequestStart(text) {
        let tag = false
        let arr = []
        for (let i = 0; i < this.mark.length; i++) {
            if (text.indexOf(this.mark[i]) >= 0) {
                tag = true
                arr.push(text.lastIndexOf(this.mark[i]))
            }
        }
        if (tag) {
            return Math.max.apply(null, arr)
        }
        else {
            return -1

        }
    }

    getRequestStr = (data, index, end) => {
        let currentText = data.blocks[index].text.slice(0, end)
        let tag = false
        let start = null
        let strRepo = ''

        if (this.getRequestStart(currentText.slice(0, end - 1)) >= 0) {
            start = this.getRequestStart(currentText.slice(0, end - 1)) + 1
            tag = true
        }
        if (tag) {
            return currentText.slice(start, end)
        } else {
            if (index === 0) {
                return data.blocks[index].text.slice(0, end) + strRepo
            }
            for (let i = index; i >= 0; i--) {
                if (i === index && this.getRequestStart(data.blocks[i].text.slice(0, data.blocks[i].text.length - 1)) >= 0) {
                    return data.blocks[i].text.slice(this.getRequestStart(data.blocks[i].text), end)
                }
                else if (i !== index && this.getRequestStart(data.blocks[i].text.slice(0, data.blocks[i].text.length)) >= 0) {
                    return data.blocks[i].text.slice(this.getRequestStart(data.blocks[i].text) + 1, data.blocks[i].text.length) + strRepo

                }
                else {
                    strRepo = data.blocks[i].text + strRepo
                }
            }
        }


    }

    handleKeyCommand = (command, editorState) => {
        console.log(this.requestStr)
        // Enter 键  发送数据
        this.insertResponse()
        // const newState = RichUtils.handleKeyCommand(editorState, command);
        // const newState = RichUtils.handleKeyCommand(editorState, command);
        // if (newState) {
        //     this.handleChange(newState);
        //     return 'handled';
        // }
        // return 'not-handled';
    }

    renderAutocomplete() {
        const {
            autocompleteState,
            onSuggestionClick
        } = this.state;
        if (!autocompleteState) {
            return null;
        }
        filteredArrayTemp = this.getFilteredArray(autocompleteState.type);
        autocompleteState.array = filteredArrayTemp;
        autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
        return <SuggestionList suggestionsState={
            autocompleteState
        }
        />;
    };

    getFilteredArray(type) {
        const dataArray = type == triggers.PERSON ? data.persons : data.tags;
        // const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type, text), ''));
        // console.log(filteredArray)

        return dataArray;
    }

    render() {
        return ( < div style={
                styles.root
            }> {
                this.renderAutocomplete()
            }
                < div style={
                    styles.editor
                }>
                    < AutocompleteEditor editorState={
                        this.state.editorState
                    }
                                         onChange={
                                             this.onChange
                                         }
                                         onAutocompleteChange={
                                             this.onAutocompleteChange
                                         }
                                         onInsert={
                                             this.onInsert
                                         }
                                         handleKeyCommand={this.handleKeyCommand}
                    /></div>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        prompt: state.prompt,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getPrompt: (data) => dispatch(getPrompt(data)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput)

