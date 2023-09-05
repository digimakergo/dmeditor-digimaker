import React, { useEffect, useState,useRef } from 'react';
import {fetchWithAuth} from 'digimaker-ui/util';
import {DMEditor} from 'dmeditor';
import { Util } from "dmeditor/utils/Util";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Tooltip } from '@mui/material';
import { CloseOutlined, MenuOutlined, InfoOutlined, SendOutlined, SaveOutlined } from '@mui/icons-material';
import { Button } from 'react-bootstrap';
import { BrowseImage } from '../BrowseImage';
import { BrowseLink } from '../BrowseLink';
import { CustomProperty,PreBlock,PrivateProperty } from './FullEdit_Custom';
import {getFileUrl,getImageUrl} from '../Config'
import { dmeditorActionCss } from './FullEdit';
import { convertDMFieldToInput } from './Common';
// import toast from 'react-hot-toast';

export const FullCreate = (props:{id:number, afterAction:any,contentType:string,editField:string,data?:any})=>{
  const [data, setData] = useState(props.data?props.data:[] as any);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validation,setValidation] = useState();
  const [pageTabActiveIndex,setPageTabActiveIndex] = useState(0);
  let contentType=props.contentType?props.contentType:'';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const formRef = useRef(null);
  const dataRef:any = useRef(null);
  const save = ()=>{
    if(formRef.current){
      //form data
      let form=new FormData(formRef.current)
      const dataObject:any = {};
      for (let key of Array.from(form.keys())) {
          dataObject[key] = form.get(key);
      };
      setAnchorEl(null);
      let bodyJson:any={};
      bodyJson[props.editField]=JSON.stringify(data);

      let mergedData:any=JSON.parse(JSON.stringify({...dataObject,...bodyJson}))

      //update dmeditor data to content field
      data.map((item:any)=>{     
        const field = item.dm_field;   
        if(field){
          mergedData[field] = convertDMFieldToInput(props.contentType, field, item, mergedData[field] );          
        }
      })

      fetchWithAuth(`${process.env.REACT_APP_REMOTE_URL}/content/create/${contentType}/${props.id}`, {
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
      //Save to server
    }else{
      Util.error('No pagetab is set')
    }
  }

  const cancel = ()=>{
    props.afterAction(2);
  }
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
  return <div>
    <div className={dmeditorActionCss}>
          <Button onClick={save} size='sm' variant='success'>
            <SendOutlined /> Save
        </Button></div>

    <DMEditor
      menu={<div>          
          <Button onClick={(e)=>setAnchorEl(e.currentTarget)} size='sm' variant='outlink-info'>
            <MenuOutlined />
          </Button>          
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={anchorEl?true:false}
            onClose={()=>setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={cancel}>
              <ListItemIcon><CloseOutlined fontSize="small" /></ListItemIcon>
              <ListItemText> Exit</ListItemText>
            </MenuItem>
            <MenuItem>          
              <ListItemIcon><InfoOutlined fontSize="small" /></ListItemIcon>
              <ListItemText>About</ListItemText>
            </MenuItem>        
          </Menu>
      </div>}
      data={data} 
      onChangeActive={(activeIndex:any)=>setActiveIndex(activeIndex)}
      onChange={(data)=>{setData([...data])}}
      browseImage={BrowseImage} browseLink={BrowseLink} 
      customProperty={(props:any)=> CustomProperty({onChange:setProperyFun,data:props.data,contenttype:contentType})}
      preBlock={PreBlock}
      // toast={toast}
      pageTab={()=> PrivateProperty({id:props.id,ref:formRef,contenttype:'article',type:'create',validation:validation,content:data})}
      pageTabActiveIndex={pageTabActiveIndex}
      getFileUrl={getFileUrl}
      getImageUrl={getImageUrl}
    /> 
  </div>
}

