
//@ts-ignore
import Browse from 'digimaker-ui/Browse';
//@ts-ignore
import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState,useRef } from "react";
import {IconButton,TextField, Button, Dialog,DialogActions,DialogContent,DialogTitle,Tabs ,Tab , Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { Util, BrowseProps } from "dmeditor/utils/Util";
import React from 'react';

export const BrowseImage = (props:BrowseProps) =>{
    const [adding, setAdding] = useState(props.adding?true:false);
    const [sourceType, setSourceType] = useState('select');
    const [inputUrl, setInputUrl] = useState('');
    const [currentList, setCurrentList] = useState({image:''});
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setSourceType(newValue);
      if(sourceType=='input'){
        setCurrentList({image:''})
      }else{
        setInputUrl('')
      }
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
        if (!isImageUrl(inputUrl)) {
          Util.error('URL is not an image')
          return false  
        }
        props.onConfirm(inputUrl,'input')
      }else{
        if((currentList.image??'')==''){
          Util.error('Please select a image  before confirm')
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
    const isImageUrl = (url:any) => {
      if (!url) return false
      if (!isUrl(url)) return false
      const ext:any = new URL(url).pathname.split('.').pop()
      return imageExtensions.includes(ext)
    }

    return <div>
     {adding&& <Dialog 
        fullWidth={true}
        maxWidth={'md'}
        onClose={handleClose}
        open={adding}>
          <DialogTitle>Image
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
              <Browse inline={true} parent={461} multi={false} trigger={true} selected={''} contenttype={['image']} onConfirm={(value:any)=>{onConfirmSelect(value)}} />
            </div>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onConfirm} autoFocus> Confirm</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
      </Dialog>}
  </div>

}

