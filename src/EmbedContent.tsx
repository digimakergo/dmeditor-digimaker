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

interface soureDataType {
  id:number;
  contentType:string;
}

const EmbedContent = (props:ToolRenderProps) =>{
  const [currentSource, setCurrentSource] = useState({} as any);
  const [columns, setColumns] = useState(1);
  const [adding, setAdding] = useState(props.adding);
  const [html, setHtml] = useState(props.data.data as any);

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
    fetchHtml(currentSource.id);
    setAdding(false);
  }

  const fetchHtml = (id:any)=>{
    FetchWithAuth(`${process.env.REACT_APP_DMEDITOR_CONTENT_VIEW}/site/content/view?id=${id}&type=${currentSource.metadata.contenttype}&viewmode=editor_embed&site=dmdemo`)
    .then((data: { data: { [x: string]: any; }; settings: any; })=>{
      setHtml(data.data)
      let propsData = props.data;
      let sourceData:soureDataType={id:id,contentType:currentSource.metadata.contenttype}
      props.onChange({...propsData, data: data.data,source:sourceData});
    });
  }
  

  if(isServer()){
    return <div className={"dm-columns columns-"+props.data.settings.columns}>        
        {Object.keys(props.data.data).map(index=><div style={{display:'inline-block'}} className='Embed-list'>
          <div dangerouslySetInnerHTML={{ __html:props.data.data[index]}} />
          </div>)}
      </div>;
}


  return <div>
  {props.active&&<BlockProperty title="Embed content" active={props.active}>
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
  console.log('ids');
  console.log(data.data);
  let ids = data.data.join(',');
  let resp = await axios.get('http://localhost:9210/api/site/content/view?id='+ids+'&type=article&viewmode=editor_block&site=dmdemo');
  let result = {...data, data:resp.data.data};
  return result;
}

export const  toolEmbedContent =   { 
    type: "content_Embed",
menu: {
  text: "Embed content",
  category: "content",
  icon: <SquareOutlined />,
},
initData: {type:'content_Embed', data:[], settings:{contentType:'article'}},
onServerLoad: serverLoad,
view: (props:{data:Array<any>})=><EmbedContent data={props.data} active={false} onChange={()=>{}} />,
render: (props:ToolRenderProps)=> <EmbedContent {...props} /> }