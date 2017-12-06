import React from 'react';
import * as Draft from 'draft-js';
import {AutocompleteEditor} from '../componets/autocomplete';
import SuggestionList from '../componets/suggestions';
import styles from '../styles/styles'
import {normalizeIndex, filterArray} from '../util/utils';
import { connect } from 'react-redux'
import * as triggers from '../util/triggers';
import * as data from '../data/data';
// import addSuggestion from '../componets/addsuggestion';
import 'whatwg-fetch'
import { getPrompt, getPromptSuccess } from '../actions/index'
import './App.css'
let filteredArrayTemp;
const {Entity, Modifier, Editor, EditorState, convertToRaw, RichUtils, CodeUtils} = Draft;

let currentIndex = -1;
let requestStr = '';
let hasDot = false;
let updateEditorState;
let filterType ={
    name: '',
    category: '',
    expense: ''
}
// let lastPostStr = '';
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
        };
        this.mark = ['。', '!', '！', '?', '？', '.', ',', '，', ';'];
    }

    onChange = (editorState, state) => {
        hasDot = false
        if(this.state.editorState) {
            editorState = editorState ? editorState : updateEditorState
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
                    state ? this.cursorToMark(convertToRaw(content), selection) : ''
                }
            )
        }
    }

    myKeyBindingFn(e){
        if(e.keyCode === 17 ){
            this.onChange(this.state.editorState, 1)
        }
    }

    cursorToMark = (data, selection) => {
        let cursor = {
            key: selection.getEndKey(),
            offset: selection.getEndOffset(),
            hasFocus: selection.getHasFocus()
        }
        for (let i = 0; i < data.blocks.length; i++) {
            if (cursor.hasFocus && data.blocks[i].key === cursor.key && data.blocks[i].text.slice(cursor.offset - 1, cursor.offset) !== '' && this.mark.indexOf(data.blocks[i].text.slice(cursor.offset - 1, cursor.offset)) >= 0) {
                requestStr = this.getRequestStr(i, cursor.offset)
                // todo  弹出提示选择自动填充下一句
                // this.insertResponse()
                let data = {'context': requestStr}
                if(requestStr && requestStr.length >= 60 ) {
                    hasDot = true
                    // lastPostStr = requestStr
                    currentIndex =  this.mark.indexOf(this.getRequestStr(i, cursor.offset).slice(this.getRequestStr(i, cursor.offset).length - 1, this.getRequestStr(i, cursor.offset).length))
                    this.props.getPrompt(data)
                }
            }
        }
        if(!hasDot){
            let data = {result:[]}
            this.props.fetchPrompt(data)
        }
    }

    addSuggestion = (data) => {
        //    todo  取回数据 更新进对应位置
        const text = ''
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        let txt = data.text + text;
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
        updateEditorState =  nextEditorState
        this.onChange(updateEditorState)
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
            requestStr && requestStr.length >= 60 && index ?
            // insertState.text = insertState.trigger[currentIndex] + filteredArrayTemp[index]
            insertState.text =  filteredArrayTemp[index]
                :
                insertState.text = ''
            ;
            // insertState.trigger =  requestStr.slice(requestStr.length,1)
            return  this.addSuggestion(insertState);
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
        if(currentIndex === -1 || !hasDot){
            return []
        }
        if(!this.props.promptData.length){
            dataArray = type === triggers.PERSON ? data.persons : data.tags;
        }
        else{
            dataArray = this.props.promptData
        }
        // const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type, text), ''));
        // console.log(filteredArray)

        return dataArray;
    }

    changeNameValue(e){
        filterType.name = e.target.value
    }

    changeCateGoryValue(e){
        filterType.category = e.target.value
    }

    changeexpenseValue(e){
        filterType.expense = e.target.value
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
                            <input type="text" className="search-input" autoComplete="off" onChange={this.changeNameValue} />
                        </li>
                        <li>
                            <span>
                                产品种类
                            </span>
                            <input type="text" className="search-input" autoComplete="off"  onChange={this.changeCateGoryValue} />
                        </li>
                        <li>
                            <span>
                                加盟费用
                            </span>
                            <input type="text" className="search-input" autoComplete="off" onChange={this.changeexpenseValue} />
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
                < div style={styles.editor}>
                    < AutocompleteEditor editorState={
                        this.state.editorState
                    }
                                         myKeyBindingFn={(e) =>this.myKeyBindingFn(e)}
                                         onChange={
                                             this.onChange
                                         }
                                         onAutocompleteChange={
                                             this.onAutocompleteChange
                                         }
                                         onInsert={
                                             this.onInsert
                                         }
                    />
                </div>
            </div>
        );
    }

}

function filterPromptData  (data){
    data = data.result
    let str = []
    for(let i =0; i < data.length; i++){
        str[i] = ''
        for(let j=0; j<data[i].length; j++){
            const end = data[i][j].length
            let temp = ''
            if(data[i][j].indexOf('product_name') >= 0  && filterType.name){
                const start = data[i][j].indexOf('product_name') - 12
                temp = data[i][j].slice(0,start) + filterType.name + data[i][j].slice(12,end)
            }
            if(data[i][j].indexOf('category') >= 0  && filterType.category){
                const start = data[i][j].indexOf('product_name') -8
                temp = data[i][j].slice(0,start) + filterType.category + data[i][j].slice(8,end)
            }
            if(data[i][j].indexOf('expense') >= 0  && filterType.expense){
                const start = data[i][j].indexOf('product_name') -7
                temp = data[i][j].slice(0,start) + filterType.category + data[i][j].slice(7,end)
            }
            str[i] += temp ? temp : data[i][j]
        }
    }
    return str
}
const mapStateToProps = (state) => {

    return {
        promptData: state.promptData.entities.result ? filterPromptData(state.promptData.entities) : state.promptData.entities,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getPrompt: (data) => dispatch(getPrompt(data)),
        fetchPrompt: (data) => dispatch(getPromptSuccess(data)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput)

