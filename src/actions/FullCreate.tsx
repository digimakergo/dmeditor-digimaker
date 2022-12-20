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

export const FullCreate = (props:{id:number, afterAction:any,contentType:string,editField:string})=>{
  const [data, setData] = useState([] as any);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validation,setValidation] = useState();
  const [pageTabActiveIndex,setPageTabActiveIndex] = useState(0);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const formRef = useRef(null);
  const save = ()=>{
    if(formRef.current){
      let form=new FormData(formRef.current)
      const dataObject = {};
      for (let key of Array.from(form.keys())) {
          dataObject[key] = form.get(key);
      };
      setAnchorEl(null);
      let bodyJson:any={};
      bodyJson[props.editField]=JSON.stringify(data);
      fetchWithAuth(`${process.env.REACT_APP_REMOTE_URL}/content/create/${props.contentType}/${props.id}`, {
        method:'POST', 
        body:JSON.stringify({...dataObject,...bodyJson}) 
      }).then(data=>{
          if(data.error === false){
              Util.message('Saved')
              props.afterAction(1);
          }else{
            Util.error(data.data.message)
            setValidation(data.data.detail)
            setPageTabActiveIndex(1)
            // window.alert(data.data.detail);
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

  const setProperyFun = (propertyValue:any)=>{
    let list=[...data]
    list[activeIndex].dm_field=propertyValue;
    setData(list);
  }
  return <div>
    <DMEditor
      menu={<div>
          <Button onClick={(e)=>setAnchorEl(e.currentTarget)} size='sm' variant='outlink-info'>
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
      ids={props.id}
      data={data} 
      onChangeActive={(activeIndex)=>setActiveIndex(activeIndex)}
      onChange={(data)=>{setData(data)}}
      imageBrowse={BrowseImage} linkBrowse={BrowseLink} 
      customProperty={(props:any)=> CustomProperty({onChange:setProperyFun,data:props.data})}
      preBlock={PreBlock}
      toast={toast}
      pageTab={()=> PrivateProperty({id:props.id,ref:formRef,contenttype:'article',type:'create',validation:validation,content:''})}
      pageTabActiveIndex={pageTabActiveIndex}
    /> 
  </div>
}

