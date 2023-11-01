import React, { useEffect, useState,useRef } from 'react';
import {fetchWithAuth} from 'digimaker-ui/util';
import {DMEditor} from 'dmeditor';
import { Util } from "dmeditor/utils/Util";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Tooltip } from '@mui/material';
import { CloseOutlined, MenuOutlined, InfoOutlined, SendOutlined, SaveOutlined, CheckOutlined } from '@mui/icons-material';
import { Button } from 'react-bootstrap';
import { BrowseImage } from '../BrowseImage';
import { css } from '@emotion/css'
import { BrowseLink } from '../BrowseLink';
import { DMFieldSelect,PreBlock, SettingTab, convertDMFieldToInput } from './Common';
import {getFileUrl,getImageUrl} from '../Config'
import i18n from 'dmeditor/i18n';
// import toast from 'react-hot-toast';

export const FullEdit = (props:{id:number, afterAction:any,editField:any})=>{
  const [content, setContent] = useState<any>(null);
  const [data, setData] = useState(false as any);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validation,setValidation] = useState();
  const [pageTabActiveIndex,setPageTabActiveIndex] = useState(0);
  const [editField,setEditField] = useState('');
  const [contentType,setContentType] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const formRef = useRef(null);
  const dataRef:any = useRef(null);
  const save = (e:any)=>{
    e.preventDefault();
    let params:any={}
    let bodyJson:any={};
    bodyJson[editField]=JSON.stringify(data);
    if(formRef.current){
      let form=new FormData(formRef.current)
      const dataObject:any= {};
      for (let key of Array.from(form.keys())) {
          dataObject[key] = form.get(key);
      };
      params={...dataObject,...bodyJson}
      //Save to server
    }else{
      params=bodyJson
    }

    let mergedData:any=JSON.parse(JSON.stringify(params))

     //update dmeditor data to content field
     data.map((item:any)=>{     
      const field = item.dm_field;   
      if(field){
        mergedData[field] = convertDMFieldToInput(contentType, field, item, mergedData[field] );          
      }
    })
   
    setAnchorEl(null);
      fetchWithAuth('content/update/'+props.id, {
        method:'POST', 
        body:JSON.stringify(mergedData) 
      }).then((data:any)=>{
          if(data.error === false){
              Util.message('Saved')
              props.afterAction(1);
          }else{
            Util.error(data.data.message)
            setValidation(data.data.detail)
            setPageTabActiveIndex(1)
          }
      });
  }

  const cancel = (e:any)=>{
    e.preventDefault();
    props.afterAction(2);
  }

  useEffect(()=>{
    let data = fetchWithAuth('content/get/'+props.id).then((data:any)=>{
        setContent(data.data);
        setContentType(data.data.metadata.contenttype);
      let editField = props.editField(data.data.metadata.contenttype);
      setEditField(editField)
        try{
          const bodyObject = data.data[editField];
          setData([...bodyObject]);
        }catch(err){
          Util.error("Wrong format: "+ err)
        }
    });
  },[]);
  

  useEffect(()=>{
    dataRef.current={
      data:data,
      activeIndex:activeIndex
    }
  },[data,activeIndex])

  const setProperyFun = (propertyValue:any)=>{
    let list=[...dataRef.current.data]
    list.forEach((item:any)=>{
      if(item.dm_field==propertyValue)delete item.dm_field
    })
    list[dataRef.current.activeIndex].dm_field=propertyValue;
    setData([...list]);
  }

  if( !content || data===false ){
    return <div style={{position:'absolute'}}>...</div>;
  }
  return <div>
      <div>
      <DMEditor
      menu={<div>       
        <Tooltip title={i18n.t("Save")} placement="right" arrow>
         <a href="/" className='current' onClick={save}>
          <CheckOutlined />
        </a>   
        </Tooltip>     
        <Tooltip title={i18n.t("Close")} placement="right" arrow>
        <a href="/" style={{color:'red'}} onClick={cancel}>
          <CloseOutlined />
        </a>   
        </Tooltip>
        </div>}

      data={data} 
      onChangeActive={(activeIndex:any)=>setActiveIndex(activeIndex)}
      onChange={(data)=>{setData([...data])}}
      browseImage={BrowseImage} browseLink={BrowseLink} 
      customProperty={(props:any)=> DMFieldSelect({onChange:setProperyFun,data:props.data,contenttype:contentType})}
      preBlock={(props:{blockData:any})=><PreBlock blockData={props.blockData} contentType={contentType} />}
      // toast={toast}
      pageTab={()=> SettingTab({id:props.id,ref:formRef,validation:validation,content:content})}
      pageTabActiveIndex={pageTabActiveIndex}
      getFileUrl={getFileUrl}
      getImageUrl={getImageUrl}
      /> 
      </div>
  </div>
}

