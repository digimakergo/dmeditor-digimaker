import {  SquareOutlined} from "@mui/icons-material";
//@ts-ignore
import { ToolRenderProps } from "dmeditor/ToolDefinition";
import {BlockProperty} from 'dmeditor/BlockProperty';
import {PropertyGroup, PropertyItem,isServer} from "dmeditor/utils";
import { Util} from "dmeditor/utils/Util";
import axios from 'axios';

import Browse from 'digimaker-ui/Browse';
//@ts-ignore
import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState } from "react";
import { Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { serverUtil } from "./ServerUtil";

interface soureDataType {
  id:number;
  contentType:string;
}

const EmbedContent = (props:ToolRenderProps) =>{
  const [source,setSource] = useState(props.blockdata.source)
  const [currentSource, setCurrentSource] = useState({} as any);
  const [columns, setColumns] = useState(1);
  const [adding, setAdding] = useState(props.adding);
  const [html, setHtml] = useState(props.blockdata.data as any);

  const handleClickOpen = () => {
    setAdding(true);
    setAdding(false);
    setTimeout(()=>{setAdding(true);},10)

  };
  const handleClose = (event?:any, reason?:any) => {
    if (reason && reason === "backdropClick") 
    return false;
    setAdding(false);
    // props.onCancel();
  };
 
  const onConfirmSelect= (source:any)=>{
    setCurrentSource(source);
  }

  const onConfirm = ()=>{
    if(Object.keys(currentSource).length===0){
      Util.error('Please select a file  before confirm')
     return  false    
    }
    fetchHtml({id:currentSource.id,contentType:currentSource.metadata.contenttype});
    setAdding(false);
  }

  const fetchHtml = ({id,contentType,isInit}:any)=>{
      FetchWithAuth(`${process.env.REACT_APP_DMEDITOR_CONTENT_VIEW}/site/content/view?id=${id}&type=${contentType}&viewmode=editor_embed&site=dmdemo`)
      .then((data: { data: { [x: string]: any; }; settings: any; })=>{
        setHtml(data.data)
        let propsData = props.blockdata;
        if(!isInit){
          let sourceData:soureDataType={id:id,contentType:contentType}
          props.onChange({...propsData, data: data.data,source:sourceData});
        }
      });
  }

  useEffect(()=>{
    if(!props.view){
      if(source){
        fetchHtml({id:source.id,contentType:source.contentType,isInit:true})
      }
    }
  },[])
  

  if(isServer()){
    return <div className={"dm-columns columns-"+props.blockdata.settings?.columns}>        
        {Object.keys(props.blockdata.data).map(index=><div style={{display:'inline-block'}} className='Embed-list'>
          <div dangerouslySetInnerHTML={{ __html:props.blockdata.data[index]}} />
          </div>)}
      </div>;
}


  return <div>
  {props.active&&<BlockProperty inBlock={props.inBlock} blocktype="content_embed">
      <PropertyGroup header='Settings'>
          <PropertyItem label='Source'>
              <Button onClick={handleClickOpen}>Choose</Button>
            </PropertyItem>
      </PropertyGroup>
  </BlockProperty>}
  {adding&&<><Dialog 
      fullWidth={true}
      maxWidth={'md'}
      onClose={handleClose}
      open={adding}>
        <DialogTitle>Select
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
          <div className="tab-content">
            <Browse inline={true}  multi={false} trigger={true} selected={Object.keys(currentSource).length===0&&currentSource.constructor===Object?'':currentSource} contenttype={['article',"folder"]}  onConfirm={onConfirmSelect} /> 
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} autoFocus> Confirm</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
  </>}

  {Object.keys(html).length===0?<div className="empty-message">Please select Content</div>
  : <div className={"dm-columns columns-"+columns}>
     {Object.keys(html).map(id=><div style={{display:'inline-block'}} className='Embed-list'>
          <div dangerouslySetInnerHTML={{__html:(html?html[id]:'')}}></div>
        </div>)}
  </div>}
  </div>

}

const serverLoad = async (data:any)=>{
  let ids = data.data.join(',');
  let resp = await await serverUtil.get('site/content/view?id='+ids+'&type=article&viewmode=editor_block&site=dmdemo');
  let result = {...data, data:resp.data.data};
  return result;
}

export const  toolEmbedContent =   { 
    type: "content_embed",
    name: "Embed content",
menu: {
  category: "content",
  icon: <SquareOutlined />,
},
initData: ()=>{
  return {type:'content_embed', data:[], settings:{contentType:'article'}}
},
onServerLoad: serverLoad,
render: (props:ToolRenderProps)=> <EmbedContent {...props} /> }