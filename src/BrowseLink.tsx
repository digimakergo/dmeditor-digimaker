import Browse from 'digimaker-ui/Browse';
//@ts-ignore
import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState,useRef } from "react";
import {IconButton,TextField,Button, Dialog,DialogActions,DialogContent,DialogTitle,Tabs ,Tab , Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { Util } from "dmeditor/utils/Util";
import React from 'react';

export interface DialogProps {
  adding?: boolean;
  onConfirm: (val:any,type:any) => void;
  defalutValue?:any
}

export const BrowseLink = (props:DialogProps) =>{
    const [adding, setAdding] = useState(props.adding?true:false);
    const [sourceType, setSourceType] = useState(props.defalutValue?props.defalutValue.source.sourceType:'select');
    const [inputUrl, setInputUrl] = useState(props.defalutValue&&props.defalutValue.source.sourceType==='input'?props.defalutValue.url:'');
    const [currentList, setCurrentList] = useState(props.defalutValue&&props.defalutValue.source.sourceType==='select'?props.defalutValue.source.sourceData:{id:'',content_type:'article'});
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setSourceType(newValue);
      // if(sourceType=='input'){
      //   setCurrentList({id:'',content_type:'article'})
      // }else{
      //   setInputUrl('')
      // }
    };
    const onConfirmSelect= (list:any)=>{
      setCurrentList(list)
    }

    const onConfirm = ()=>{
      if(sourceType=='input'){
        if(inputUrl==''){
          Util.error('Please enter the url before confirm')
         return  false    
        }
        props.onConfirm(inputUrl,'input')
      }else{
        if((currentList.id??'')==''){
          Util.error('Please select a article  before confirm')
          return  false    
        }
        props.onConfirm(currentList,'select')
      }
      setAdding(false);
    }
    const handleClose = (event?:any, reason?:any) => {
      if (reason && reason === "backdropClick") 
      return;
      setAdding(false);
    };

    return <div>
     {adding&& <Dialog 
        fullWidth={true}
        maxWidth={'md'}
        onClose={handleClose}
        open={adding}>
          <DialogTitle>Link
            {(
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={sourceType} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab label="Select" value='select' />
                <Tab label="Input" value='input'/>
              </Tabs>
            </Box>
            {sourceType=="input"&&<div className="tab-content" style={{display: 'flex',alignItems: 'center'}}>
              <span style={{marginRight:'10px'}}>InputUrl:</span>
              <TextField sx={{width:'calc(100% - 120px)'}} placeholder='Please enter the url' defaultValue={inputUrl} size="small" hiddenLabel variant="outlined" onChange={(e)=>setInputUrl(e.target.value)} />
            </div>}
            {sourceType=="select"&&<div className="tab-content">
              <Browse inline={true} multi={false} trigger={true} selected={currentList.id==''?'':currentList} contenttype={['article',"folder"]} onConfirm={(value:any)=>{onConfirmSelect(value)}} /> 
            </div>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onConfirm} autoFocus> Confirm</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
      </Dialog>}
  </div>

}

