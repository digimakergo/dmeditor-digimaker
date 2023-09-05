import {getDefinition} from 'digimaker-ui/util';

//convert dmeditor's block data to input
export const convertDMFieldToInput = (contenttype:string,field:string,blockData:any, value:any)=>{
    const def = getDefinition( contenttype );
    const fieldType = def.fields.find((item:any)=>(item.identifier==field)).type;
    const blockType = blockData.type;

    let html:any=document.querySelector(`#${blockData.id} .dme-block`)?.innerHTML;
    let result = value;
    switch(fieldType){
        case 'image':
            result = blockData.data.url;
            break;
        case 'text':
            result = blockData.data;
            break;
        case 'richtext':
            result = html;
            break;        
    }

    return result;
}