import React, { useEffect, useState,useRef } from 'react';
import {fetchWithAuth} from 'digimaker-ui/util';
import {DMEditor} from 'dmeditor';
import { Util } from "dmeditor/utils/Util";
import { ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Tooltip } from '@mui/material';
import { CloseOutlined, MenuOutlined, InfoOutlined, SendOutlined, SaveOutlined } from '@mui/icons-material';
import { Button } from 'react-bootstrap';
import { BrowseImage } from '../BrowseImage';
import { BrowseLink } from '../BrowseLink';
import { CustomProperty,PreBlock,PrivateProperty } from '../FullEdit_Custom';
import toast from 'react-hot-toast';

export const FullEdit = (props:{id:number, afterAction:any,editField:any})=>{
  const [content, setContent] = useState<any>(null);

  const [data, setData] = useState(false as any);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validation,setValidation] = useState();
  const [pageTabActiveIndex,setPageTabActiveIndex] = useState(0);
  const [editField,setEditField] = useState('');

const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
const formRef = useRef(null);
const save = ()=>{
  let params={}
  let bodyJson:any={};
  bodyJson[editField]=JSON.stringify(data);
  if(formRef.current){
    let form=new FormData(formRef.current)
    const dataObject = {};
    for (let key of Array.from(form.keys())) {
        dataObject[key] = form.get(key);
    };
    params={...dataObject,...bodyJson}
    //Save to server
  }else{
    params={...content,...bodyJson}
  }

  setAnchorEl(null);
    fetchWithAuth('content/update/'+props.id, {
      method:'POST', 
      body:JSON.stringify(params) 
    }).then(data=>{
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

const cancel = ()=>{
  props.afterAction(2);
}

useEffect(()=>{
    let data = fetchWithAuth('content/get/'+props.id).then(data=>{
        setContent(data.data);
       let editField = props.editField(data.data.metadata.contenttype);
       setEditField(editField)
        try{
          const bodyObject = data.data[editField];
          setData(bodyObject);
        }catch(err){
          Util.error("Wrong format: "+ err)
        }
    });
},[props.id]);

  if( !content || data===false ){
      return <div style={{position:'absolute'}}>...</div>;
  }

const setProperyFun = (propertyValue:any)=>{
  let list=[...data]
  list[activeIndex].dm_field=propertyValue;
  setData(list);
}


return <div>
    <div>
    <DMEditor
    menu={<div><Button onClick={(e)=>setAnchorEl(e.currentTarget)} size='sm' variant='outlink-info'>
        <MenuOutlined />
    </Button>
    <Button onClick={save} size='sm' variant='outlink-info'>
        <Tooltip title={'Send'}>
        <SendOutlined />
        </Tooltip>
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
    <MenuItem onClick={cancel}><ListItemIcon>
        <CloseOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText>
      Exit
      </ListItemText>
    </MenuItem>
    <MenuItem>          
      <ListItemIcon>
        <InfoOutlined fontSize="small" />
      </ListItemIcon>
      <ListItemText>
      About
      </ListItemText>
    </MenuItem>        
  </Menu>

    </div>}
    ids={props.id}
    data={data} 
    onChangeActive={(activeIndex)=>setActiveIndex(activeIndex)}
    onChange={(data)=>{setData(data)}}
    imageBrowse={BrowseImage} linkBrowse={BrowseLink} 
    customProperty={(props:any)=> CustomProperty({onChange:setProperyFun,data:props.data})}
    preBlock={PreBlock}
    toast={toast}
    pageTab={()=> PrivateProperty({id:props.id,ref:formRef,validation:validation,content:content})}
    pageTabActiveIndex={pageTabActiveIndex}
    /> 
    </div>
</div>
}

