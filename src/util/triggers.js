export const TAG = 1;
export const PERSON = 2;
export const RELATIONS = 3;
export const TAG_TRIGGER = ['#'];
export const PERSON_TRIGGER = ['。', '!', '！', '?', '？', '.', ',', '，', ';'];
export const RELATIONS_TRIGGER = '<';


export const TAG_REG_EX = [/^#/];
export const PERSON_REG_EX = [/^#。/,/^#!/,/^#！/,/^#？/,/^#?/,/^#,/,/^#./,/^#;/];
function isHasElementOne(arr,value){
    for(var i = 0,vlen = arr.length; i < vlen; i++){
        if(arr[i] == value){
            return i;
        }
    }
    return -1;
}

export const triggerByType = (type) => {
  return type == TAG ? TAG_TRIGGER : PERSON_TRIGGER;
};

export const regExByType = (type, text) => {
    return type == TAG ? TAG_REG_EX[isHasElementOne(TAG_TRIGGER,text)] : PERSON_REG_EX[isHasElementOne(PERSON_TRIGGER,text)];
};
