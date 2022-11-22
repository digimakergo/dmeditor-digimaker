import {  SquareOutlined} from "@mui/icons-material";
//@ts-ignore
import { ToolRenderProps } from "dmeditor/ToolDefinition";
import {BlockProperty} from 'dmeditor/BlockProperty';
import {PropertyGroup, PropertyItem} from 'dmeditor/utils/Property';

import Browse from 'digimaker-ui/Browse';
//@ts-ignore
import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState } from "react";
import { Button } from "@mui/material";


const EmbedContent = (props:ToolRenderProps) =>{
  const [ids, setIds] = useState(props.data.data as any);
  const [list, setList] = useState([] as any);
  const [columns, setColumns] = useState(1);
  const [adding, setAdding] = useState(props.adding);
  const [isChange, setisChange] = useState(false);

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
 

  const onConfirm = (list:any)=>{
    if((list??'')===''){
      alert('Please select a file  before confirm')
     return  false    
    }
    
    let idsArray:Array<any> = [];
      idsArray.push(list.id);
    
    let listArray:Array<any> = [];
    listArray.push(list);
    setList(listArray);
    setIds(idsArray)
    setAdding(false);
    setisChange(!isChange);
    let data = props.data;
      props.onChange({...data, data: idsArray});
       
  }

  const getList = ()=>{
    if( ids.length > 0 ){
      FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/get/'+ids.join(',')).then(data=>{
        let listArray:Array<any> = [];
        listArray.push(data.data);
          setList(listArray);
      });
    }
  }

  useEffect(()=>{
    getList()
  },[isChange]);

  const showHtml = (ComponentTag)=>{
    return <>{ComponentTag}</>
  }

  return <div>
  <BlockProperty title="Embed content" active={props.active}>
      <PropertyGroup header='Settings'>
          <PropertyItem label='Source'>
              <Button onClick={handleClickOpen}>Choose</Button>
            </PropertyItem>
      </PropertyGroup>
  </BlockProperty>
  {adding&& <div >
      <Browse multi={false} trigger={true} selected={''} contenttype={['article',"folder"]} onCancel={handleClose}  onConfirm={onConfirm} /> 
  </div>}

  {(ids.length===0||((list??'')===''))&&<div className="empty-message">Please select Content</div>}
  <div className={"dm-columns columns-"+columns}>
     {list.map(item=><div style={{display:'inline-block'}} className='Embed-list'>
          <div className={'title'}>{item.title}</div>
          <div dangerouslySetInnerHTML={{__html:item.coverimage}}></div>
          <div dangerouslySetInnerHTML={{__html:item.summary}}></div>
        </div>)}
  </div>
  </div>

}

export const  toolEmbedContent =   { 
    type: "content_Embed",
menu: {
  text: "Embed content",
  category: "content",
  icon: <SquareOutlined />,
},
initData: {type:'content_Embed', data:[], settings:{contentType:'article'}},
view: (props:{data:Array<any>})=><EmbedContent data={props.data} active={false} onChange={()=>{}} />,
render: (props:ToolRenderProps)=> <EmbedContent {...props} /> }