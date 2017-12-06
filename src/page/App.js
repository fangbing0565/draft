import React from 'react';
import * as Draft from 'draft-js';
import {AutocompleteEditor} from '../componets/autocomplete';
import SuggestionList from '../componets/suggestions';
import styles from '../styles/styles'
import {normalizeIndex, filterArray} from '../util/utils';
import { connect } from 'react-redux'
import * as triggers from '../util/triggers';
import * as data from '../data/data';
import addSuggestion from '../componets/addsuggestion';
import 'whatwg-fetch'
import { getPrompt } from '../actions/index'
import './App.css'
let filteredArrayTemp;
const {Entity, Modifier, Editor, EditorState, convertToRaw} = Draft;

let currentIndex = -1;
let requestStr = '';
const tools = [
    {id: 1, url:'./img/bold.svg'}, {id: 2, url:'./img/italic.svg'}, {id: 3, url:'./img/title.svg'},
    {id: 4, url:'./img/cite.svg'}, {id: 5, url:'./img/code.svg'}, {id: 6, url:'./img/unorderedlist.svg'},
    {id: 7, url:'./img/orderedlist.svg'}, {id: 8, url:'./img/link.svg'}, {id: 9, url:'./img/pic.svg'},
    {id: 10, url:'./img/video.svg'}, {id: 11, url:'./img/formulae.svg'}, {id: 12, url:'./img/line.svg'},
    {id: 13, url:'./img/removeformat.svg'},
]

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
            promptData: []
        };
        this.mark = ['。', '!', '！', '?', '？', '.', ',', '，', ';'];
    }

    onChange = (editorState) => {
        if(this.state.editorState) {
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
    }

    cursorToMark = (data, selection) => {
        let cursor = {
            key: selection.getEndKey(),
            offset: selection.getEndOffset()
        }
        for (let i = 0; i < data.blocks.length; i++) {
            if (data.blocks[i].key === cursor.key && data.blocks[i].text.slice(cursor.offset - 1, cursor.offset) !== '' && this.mark.indexOf(data.blocks[i].text.slice(cursor.offset - 1, cursor.offset)) >= 0) {
                requestStr = this.getRequestStr(i, cursor.offset)
                // todo  弹出提示选择自动填充下一句
                // this.insertResponse()
                let data = {'context': requestStr}
                if(requestStr && requestStr.length >= 60) {
                    currentIndex =  this.mark.indexOf(this.getRequestStr(i, cursor.offset).slice(this.getRequestStr(i, cursor.offset).length - 1, this.getRequestStr(i, cursor.offset).length))
                    this.props.getPrompt(data)
                }
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
        }else {
            const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
            requestStr && requestStr.length >= 60 ?
            insertState.text = insertState.trigger[currentIndex] + filteredArrayTemp[index]
                :
                insertState.text = ''
            ;
            // insertState.trigger =  requestStr.slice(requestStr.length,1)
            return  addSuggestion(insertState);
        }
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

    getRequestStr = (index, end) => {
        const content = this.state.editorState.getCurrentContent();
        let data = convertToRaw(content)
        let currentText = data.blocks[index].text.slice(0, end)
        let tag = false
        let start = null
        let strRepo = ''

        if ((currentText.slice(0, end - 1)).length >= 60) {
            start = end - 60
            tag = true
        }
        if (tag) {
            return  currentText.slice(start, end)
        } else {
            if (index === 0) {
                return  data.blocks[index].text.slice(0, end) + strRepo
            }
            for (let i = index; i >= 0; i--) {
                if (i === index && (data.blocks[i].text.slice(0, data.blocks[i].text.length - 1)).length >= 60) {
                    return  data.blocks[i].text.slice(end - 60, end)
                }
                else if (i !== index && (data.blocks[i].text.slice(0, data.blocks[i].text.length)).length + strRepo.length >= 60) {
                    return  data.blocks[i].text.slice(0, data.blocks[i].text.length) + strRepo
                }
                else {
                    strRepo = data.blocks[i].text + strRepo
                }
            }
        }
    }

    handleKeyCommand = (command, editorState) => {
        // console.log(requestStr)
        // Enter 键  发送数据
        // this.insertResponse()
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
        // todo 更新数据部分
        let dataArray = []
        if(currentIndex === -1){
            return []
        }
        if(!this.props.promptData.entities.length){
            dataArray = type === triggers.PERSON ? data.persons : data.tags;
        }
        else{
            dataArray = this.props.promptData.entities
        }
        // const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type, text), ''));
        // console.log(filteredArray)

        return dataArray;
    }
    render() {
        return ( < div style={
                styles.root
            }>
                <div className="content-box">
                    <ul>
                        <li>
                            <span>
                                产品名称
                            </span>
                            <input type="text" name="" id=""/>
                        </li>
                        <li>
                            <span>
                                产品种类
                            </span>
                            <input type="text" name="" id=""/>
                        </li>
                        <li>
                            <span>
                                加盟费用
                            </span>
                            <input type="text" name="" id=""/>
                        </li>
                    </ul>
                </div>
                {
                this.renderAutocomplete()
            }
                <div className="editorName">智能编辑器</div>
                <div className="editorTools">
                    {
                        tools.map((item, index) =>
                            <div className="editorTools-item" key={index}>
                                {item.url === './img/bold.svg' ?  <img className="item-icon" src={require('./img/bold.svg')} alt=""/> : ''}
                                {item.url === './img/italic.svg' ?  <img className="item-icon" src={require('./img/italic.svg')} alt=""/> : ''}
                                {item.url === './img/title.svg' ?  <img className="item-icon" src={require('./img/title.svg')} alt=""/> : ''}
                                {item.url === './img/cite.svg' ?  <img className="item-icon" src={require('./img/cite.svg')} alt=""/> : ''}
                                {item.url === './img/code.svg' ?  <img className="item-icon" src={require('./img/code.svg')} alt=""/> : ''}
                                {item.url === './img/unorderedlist.svg' ?  <img className="item-icon" src={require('./img/unorderedlist.svg')} alt=""/> : ''}
                                {item.url === './img/orderedlist.svg' ?  <img className="item-icon" src={require('./img/orderedlist.svg')} alt=""/> : ''}
                                {item.url === './img/link.svg' ?  <img className="item-icon" src={require('./img/link.svg')} alt=""/> : ''}
                                {item.url === './img/pic.svg' ?  <img className="item-icon" src={require('./img/pic.svg')} alt=""/> : ''}
                                {item.url === './img/video.svg' ?  <img className="item-icon" src={require('./img/video.svg')} alt=""/> : ''}
                                {item.url === './img/formulae.svg' ?  <img className="item-icon" src={require('./img/formulae.svg')} alt=""/> : ''}
                                {item.url === './img/line.svg' ?  <img className="item-icon" src={require('./img/line.svg')} alt=""/> : ''}
                                {item.url === './img/removeformat.svg' ?  <img className="item-icon" src={require('./img/removeformat.svg')} alt=""/> : ''}
                            </div>
                        )
                    }
                </div>
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
        promptData: state.promptData,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getPrompt: (data) => dispatch(getPrompt(data)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput)

