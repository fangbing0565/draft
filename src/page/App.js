import React from 'react';
import * as Draft from 'draft-js';
import {AutocompleteEditor} from '../componets/autocomplete';
import SuggestionList from '../componets/suggestions';
import styles from '../styles/styles'
import {normalizeIndex, filterArray} from '../util/utils';
import {filterPromptData} from '../util';
import {connect} from 'react-redux'
import * as triggers from '../util/triggers';
import * as data from '../data/data';
// import addSuggestion from '../componets/addsuggestion';
import 'whatwg-fetch'
import { Modal } from 'antd'
import 'antd/dist/antd.css';
import {getPrompt, getPromptSuccess} from '../actions/index'
import BlockStyleControls from '../componets/blockStyleControls'
import InlineStyleControls from '../componets/inlineStyleControls'
import LinkStyleControls from '../componets/linkStyleControls'
import './App.css'

let filteredArrayTemp;
const {Entity, Modifier, Editor, EditorState, convertToRaw, RichUtils, CodeUtils} = Draft;

let currentIndex = -1;
let requestStr = '';
let hasDot = false;
let updateEditorState;
let filterType = {
    name: '',
    category: '',
    expense: ''
}
const tools = [
    {id: 1, url: './img/bold.svg', name: '粗体'}, {id: 2, url: './img/italic.svg', name: '斜体'}, {
        id: 3,
        url: './img/title.svg',
        name: '标题'
    },
    {id: 4, url: './img/cite.svg', name: '引用块'}, {id: 5, url: './img/code.svg', name: '代码块'}, {
        id: 6,
        url: './img/unorderedlist.svg',
        name: '无序列表'
    },
    {id: 7, url: './img/orderedlist.svg', name: '有序列表'}, {id: 8, url: './img/link.svg', name: '插入链接'}, {
        id: 9,
        url: './img/pic.svg',
        name: '上传图片'
    },
    {id: 10, url: './img/video.svg', name: '上传视频'}, {id: 11, url: './img/formulae.svg', name: '插入公式'}, {
        id: 12,
        url: './img/line.svg',
        name: '插入分割线'
    },
    {id: 13, url: './img/removeformat.svg', name: '清除格式'},
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
            linkUrl: '',
            linkVisible: false,
        };
        this.mark = ['。', '!', '！', '?', '？', '.', ',', '，', ';'];
        this.toggleBlockType = this.toggleBlockType.bind(this)
        this.toggleInlineStyle = this.toggleInlineStyle.bind(this)
    }

    onChange = (editorState, state) => {
        if (this.state.editorState) {
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
                    console.log(this.state.content)
                    this.cursorToMark(this.state.content, this.state.selection, state)
                }
            )
        }
    }

    myKeyBindingFn(e) {
        if (e.keyCode === 17) {
            this.onChange(this.state.editorState, 1)
        }
    }

    cursorToMark = (data, selection, state) => {
        let judgeHasDot = false   // true 进入hasDot判断且有 Dot
        let cursor = {
            key: selection.getEndKey(),
            offset: selection.getEndOffset(),
            hasFocus: selection.getHasFocus()
        }
        for (let i = 0; i < data.blocks.length; i++) {
            if (cursor.hasFocus && data.blocks[i].key === cursor.key && (data.blocks[i].text.slice(cursor.offset - 1, cursor.offset) === '\n' || this.mark.indexOf(data.blocks[i].text.slice(cursor.offset - 1, cursor.offset)) >= 0)) {
                requestStr = this.getRequestStr(i, cursor.offset)
                // todo  弹出提示选择自动填充下一句
                let data = {'context': requestStr}
                if (requestStr && requestStr.length >= 60) {
                    judgeHasDot = true
                    hasDot = true
                    currentIndex = this.mark.indexOf(this.getRequestStr(i, cursor.offset).slice(this.getRequestStr(i, cursor.offset).length - 1, this.getRequestStr(i, cursor.offset).length))
                    state ? this.props.getPrompt(data) : ''
                }
            }
        }
        if (!judgeHasDot) {
            hasDot = false
            let newData = {result: []}
            this.props.fetchPrompt(newData)
        }
    }

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
            return currentText.slice(start, end)
        } else {
            if (index === 0) {
                return data.blocks[index].text.slice(0, end) + strRepo
            }
            for (let i = index; i >= 0; i--) {
                if (i === index && (data.blocks[i].text.slice(0, data.blocks[i].text.length - 1)).length >= 60) {
                    return data.blocks[i].text.slice(end - 60, end)
                }
                else if (i !== index && (data.blocks[i].text.slice(0, data.blocks[i].text.length)).length + strRepo.length >= 60) {
                    return data.blocks[i].text.slice(0, data.blocks[i].text.length) + strRepo
                }
                else {
                    strRepo = data.blocks[i].text + strRepo
                }
            }
        }
    }
    /* todo   ---------------发送前准备结束-----------------------  */


    /* todo   ---------------返回数据处理插入开始-----------------------  */
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
        /*----- todo 参数归零-----*/
        let newData = {result: []}
        this.props.fetchPrompt(newData)
        updateEditorState = nextEditorState
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
        } else {
            const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
            requestStr && requestStr.length >= 60 && index >= 0 ?
                // insertState.text = insertState.trigger[currentIndex] + filteredArrayTemp[index]
                insertState.text = filteredArrayTemp[index]
                :
                insertState.text = '';
            if (filteredArrayTemp[index] === 'ctrl键提示下一句') {
                insertState.text = '\n'
            }
            // insertState.trigger =  requestStr.slice(requestStr.length,1)
            return this.addSuggestion(insertState);
        }
    };

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
        // if(currentIndex === -1 || !hasDot){
        if (!hasDot) {
            return []
        }
        if (!this.props.promptData.length) {
            dataArray = type === triggers.PERSON ? data.persons : data.tags;
        }
        else {
            dataArray = this.props.promptData
        }
        // const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type, text), ''));
        // console.log(filteredArray)

        return dataArray;
    }

    changeNameValue = (e) => {
        filterType.name = e.target.value
    }

    changeCateGoryValue = (e) => {
        filterType.category = e.target.value
    }

    changeexpenseValue = (e) => {
        filterType.expense = e.target.value
    }

    toggleBlockType = (blockType) => {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    toggleInlineStyle = (inlineStyle) => {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }
    toggleLinkStyle = (e) => {
        this.setState({
            linkVisible:true
        })
    }

    saveWrite = () => {
        let str = ''
        const {content} = this.state
        for (let i = 0; i < content.blocks.length; i++) {
            str += content.blocks[i].text
        }
        console.log(str)
    }

    changeLinkValue = (e) => {
        this.setState({
            linkUrl: e.target.value
        })
    }
    submitLink = () => {
        this.setState({
            linkVisible:false
        })
        const {editorState, linkUrl,content} = this.state;
        const key = Entity.create(
            'LINK',
            'MUTABLE',
            {url: linkUrl}
        );
        const contentStateWithLink = RichUtils.toggleLink(
            editorState,
            editorState.getSelection(),
            key
        );
        this.onChange(
                contentStateWithLink
        );
    }
    cancelLink = () => {
        this.setState({
            linkVisible:false
        })
    }

    // 键盘enter事件 保存url
    linkInputKeyDown = (e) => {
        if (e.which === 13) {
            this.submitLink();
        }
    }
    render() {
        const {editorState,linkVisible} = this.state
        return ( < div style={
                styles.root
            }>
                <div className="editorName">EditorAI智能编辑器</div>
                <div className="content-box">
                    <div className="content-title">
                        用户输入
                    </div>
                    <ul>
                        <li>
                            <span>
                                产品名称
                            </span>
                            <input type="text" className="search-input" autoComplete="off"
                                   onChange={this.changeNameValue}/>
                        </li>
                        <li>
                            <span>
                                产品种类
                            </span>
                            <input type="text" className="search-input" autoComplete="off"
                                   onChange={this.changeCateGoryValue}/>
                        </li>
                        <li>
                            <span>
                                加盟费用
                            </span>
                            <input type="text" className="search-input" autoComplete="off"
                                   onChange={this.changeexpenseValue}/>
                        </li>
                    </ul>
                </div>
                {
                    this.renderAutocomplete()
                }

                <div className="editorTools">
                    <InlineStyleControls
                        editorState={editorState}
                        onToggle={this.toggleInlineStyle}
                    />
                    <BlockStyleControls
                        editorState={editorState}
                        onToggle={this.toggleBlockType}
                    />
                    <LinkStyleControls
                        editorState={editorState}
                        onToggle={this.toggleLinkStyle}
                    />
                </div>
                <Modal title={'输入链接'} visible={linkVisible} onOk={() => this.submitLink()}
                       onCancel={() => this.cancelLink()}>
                    <div>
                        <input type="text"  onKeyDown={this.linkInputKeyDown} onChange={this.changeLinkValue}/>
                    </div>
                </Modal>
                < div style={styles.editor}>
                    < AutocompleteEditor editorState={
                        this.state.editorState
                    }
                                         myKeyBindingFn={(e) => this.myKeyBindingFn(e)}
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
                <div>
                    <button onClick={this.saveWrite} className="editor-save">保存</button>
                </div>
            </div>
        );
    }

}


const mapStateToProps = (state) => {

    return {
        promptData: state.promptData.entities.result ? filterPromptData(state.promptData.entities, filterType) : state.promptData.entities,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getPrompt: (data) => dispatch(getPrompt(data)),
        fetchPrompt: (data) => dispatch(getPromptSuccess(data)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutocompleteInput)

