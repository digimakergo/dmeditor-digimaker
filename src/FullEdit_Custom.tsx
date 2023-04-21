//@ts-ignore
import React,{ useState,useEffect} from "react";
import RenderFields from 'digimaker-ui/RenderFields';
import {FetchWithAuth,getDefinition} from 'digimaker-ui/util';
import { Select,MenuItem,FormControl} from "@mui/material";
import { PropertyItem } from 'dmeditor/utils';
import {getcustomPropetryConfig} from "./Config"

export interface PrivatePropertyProps {
  id:any, 
  contenttype?:string, 
  ref:any,
  type?:any,
  validation?:any
  content:any
  // afterAction:any
}
export interface CustomPropertyProps{
  data?:any,
  onChange?:any,
  blockData?:any,
  contenttype?:string
}

export const PrivateProperty = (props:PrivatePropertyProps) =>{
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
                <RenderFields mode='edit' type={contenttype} data={''} validation={validation} />
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

export const CustomProperty = (props:CustomPropertyProps) =>{
  const [blockData, setBlockData] = useState(()=>{
      let arr:any=[];
      if(props.contenttype){
        let fields=getDefinition(props.contenttype)?.fields||[];
        let customProperty=getcustomPropetryConfig(props.data.type)||[];
        arr= fields.filter((item:any)=>customProperty.length==0?true:customProperty.some((ele:any)=> ele === item.type))
      }
      return arr
    }
  )
  const [property,setProperty] = useState(props.data?.dm_field?props.data.dm_field:'')
 
  const changeFontFormat = (v:any,format:any,e?:any)=>{
    setProperty(v)
    props.onChange(v)
  }
 

  return <PropertyItem label="property">
   <Select
      size="small"
      fullWidth
      value={property}
      onChange={(e)=>{changeFontFormat(e.target.value,'fontFamily')}}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
    >
      <MenuItem value="" onMouseUp={(e)=>{e.preventDefault()}}>
        <em>Default</em>
      </MenuItem>
      {blockData.map((data:any, index:any) => (
        <MenuItem key={index} value={data.identifier} onMouseUp={(e)=>{e.preventDefault()}}>
          <span >{data.identifier}</span>
        </MenuItem>
      ))
      }
    </Select>
    </PropertyItem>

}

export const PreBlock = (props:{blockData:any}) =>{
  return <div>{props.blockData?props.blockData:''}</div>
}

