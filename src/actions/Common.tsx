//@ts-ignore
import React,{ useState,useEffect} from "react";
import RenderFields from 'digimaker-ui/RenderFields';
import {FetchWithAuth,getDefinition} from 'digimaker-ui/util';
import { Select,MenuItem,FormControl} from "@mui/material";
import { PropertyItem } from 'dmeditor/utils';
import {getcustomPropetryConfig} from "../Config";
import { css } from "@emotion/css";

export interface SettingTabProps {
  id:any, 
  contenttype?:string, 
  ref:any,
  type?:any,
  validation?:any
  content:any
  // afterAction:any
}
export interface DMFieldSelectProps{
  data?:any,
  onChange?:any,
  blockData?:any,
  contenttype?:string
}

export const SettingTab = (props:SettingTabProps) =>{
    const [content, setContent] = useState(props.content?props.content:'');
    const [contenttype, setContenttype] = useState(props.contenttype?props.contenttype:'');
    const [validation,setValidation] = useState(props.validation?props.validation:null)

    let params:string = '';
   
    const fetchData = ()=>{
      if(!content){
        let url = '/content/get/'+params
        FetchWithAuth(process.env.REACT_APP_REMOTE_URL + url)
        .then((data:any) => {
          setContent(data.data);
          setContenttype(data.data.metadata.contenttype)
        })
      }
    }
    useEffect(()=>{
      if(props.type=='create')return;
      if(props.id){
        params = props.contenttype?(props.contenttype+'/'+props.id):props.id+'';
        fetchData();
      }
    },[props.id])

    if(props.type=='create'){
      return <div>
              <form  ref={props.ref} >
                <RenderFields mode='edit' type={contenttype} data={content} validation={validation} />
              </form>
            </div>
    }else{
      if( !content ){
       return <></>
      }else{
        return <div>
            <form  ref={props.ref} >
              <RenderFields mode='edit' type={content.metadata.contenttype} data={content} validation={validation} />
            </form>
          </div>
      }
    }
}

export const DMFieldSelect = (props:DMFieldSelectProps) =>{
  const [fieldList, setFieldList] = useState(()=>{
      let arr:any=[];
      if(props.contenttype){
        let fields=getDefinition(props.contenttype)?.fields||[];
        let customProperty=getcustomPropetryConfig(props.data.type)||[];
        arr= fields.filter((item:any)=>customProperty.length==0?false:customProperty.includes(item.type))
      }
      return arr
    }
  )
  const [property,setProperty] = useState(props.data?.dm_field?props.data.dm_field:'')
 
  const changeFontFormat = (v:any,format:any,e?:any)=>{
    setProperty(v)
    props.onChange(v)
  }
 

  if( !fieldList ){
    return <></>
  }

  return <PropertyItem label="Field">
   <Select
      size="small"
      fullWidth
      value={property}
      onChange={(e)=>{changeFontFormat(e.target.value,'fontFamily')}}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
    >
      <MenuItem value="" onMouseUp={(e)=>{e.preventDefault()}}>
        None
      </MenuItem>
      {fieldList.map((fieldDef:any, index:any) => (
        <MenuItem key={index} value={fieldDef.identifier} onMouseUp={(e)=>{e.preventDefault()}}>
          <span>{fieldDef.name}</span>
        </MenuItem>
      ))
      }
    </Select>
    </PropertyItem>

}

const preBlockStyle = css`position: absolute;
left: -150px;
text-align: right;
display: block;
width: 150px;
color: #666;
padding: 5px`;

export const PreBlock = (props:{blockData:any, contentType:string}) =>{  
  const field = props.blockData.dm_field;
  if( !field ){
    return <></>
  }

  const def = getDefinition(props.contentType);
  if( !def ){
      return <></>;
  }
  const fieldDef = def.fields.find((item:any)=>item.identifier===field);  
  return <div className={preBlockStyle}>{fieldDef.name}</div>
}


//convert dmeditor's block data to input
export const convertDMFieldToInput = (contenttype:string,field:string,blockData:any, value:any)=>{
    const def = getDefinition( contenttype );
    const fieldType = def.fields.find((item:any)=>(item.identifier==field)).type;
    const blockType = blockData.type;

    let result = value;
    switch(fieldType){
        case 'image':
            result = blockData.data.url;
            break;
        case 'text':
            result = blockData.data;
            break;
        case 'richtext':
            let html:any=document.querySelector(`#${blockData.id} .dme-block`)?.innerHTML;
            result = html;
            break;        
    }

    return result;
}