import { GridViewOutlined, ArrowUpwardOutlined,ArrowDownwardOutlined, Settings, SwapCallsRounded} from "@mui/icons-material";

import { BlockProperty, ToolRenderProps } from "dmeditor";
import { Ranger, isServer, PropertyGroup, PropertyItem} from "dmeditor/utils";
import { Util} from "dmeditor/utils/Util";
import axios from 'axios';
import Browse from 'digimaker-ui/Browse';

import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState,useRef } from "react";
import {IconButton,TextField,Select,MenuItem, ToggleButtonGroup,ToggleButton, Button, Dialog,DialogActions,DialogContent,DialogTitle,Tabs ,Tab , Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { serverUtil } from "./ServerUtil";

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

interface soureDataType {
  sourceType:string,
  soureData: Array<soureDataFixedType|soureDataDynamicType>,
}

interface soureDataFixedType {
  id:number;
  contentType:string;
  title:string;
  location:any;
  metadata:any;
}

interface soureDataDynamicType {
  parent:number;
  contentType:string;
  title:string;
  location:any;
  metadata:any;
  number:number;
  sortby:string[];
}

const ContentGrid = (props: ToolRenderProps &{view?:boolean}) =>{
    const [source,setSource] = useState(props.data.source)
    const [sourceType, setSourceType] = useState('fixed');
    const [selectSourceType, setSelectSourceType] = useState('fixed');
    const [space, setSpace] = useState(props.data.settings.space);    
    const [columns, setColumns] = useState(props.data.settings.columns);
    const [viewMode,setViewMode] = useState(props.data.settings.viewMode?props.data.settings.viewMode:'editor_block');
    const [isChange,setIsChange] = useState(false);
    const [adding, setAdding] = useState(props.adding);
    const [html, setHtml] = useState(props.data.data as any);

    const [limit, setLimit] = useState(10);
    const [sortby, setSortby] = useState(["priority desc", "published desc"]);
    
    const [currentList, setCurrentList] = useState({} as any);
    const [currentListM, setCurrentListM] = useState([] as any);
    // let level=10;
    let sortbyArr=[{type1:'priority',type2:'desc'}, {type1:'published',type2:'desc'}]

    const handleClickOpen = () => {
      setAdding(true);
    };
  
    const handleClose = (event?:any, reason?:any) => {
      if (reason && reason === "backdropClick") 
      return;
      setAdding(false);
      if(selectSourceType=='fixed'){
        setSourceType('fixed')
      }else{
        setSourceType('dynamic')
      }
    };


    const fetchHtmlFixed = ({idArray,mode,isInit}:any)=>{
      let newViewMode=mode?mode:viewMode
      FetchWithAuth(`${process.env.REACT_APP_DMEDITOR_CONTENT_VIEW}/site/content/view?id=${idArray.join(',')}&type=article&viewmode=${newViewMode}&site=dmdemo`)
      .then((data: { data: { [x: string]: any; }; settings: any; })=>{
        setHtml(data.data)
        let propsData = props.data;
        if(!isInit){
          let sourceData:Array<soureDataFixedType>=currentListM.map((item:any)=>{return {id:item.id,contentType:item.metadata.contenttype,title:item.title,location:item.location,metadata:item.metadata}})
          props.onChange({...propsData,data:data.data,source:{sourceType:'fixed',sourceData:sourceData}, settings:{...propsData.settings, columns: columns,space:space,viewMode:newViewMode}});
        }
      });
    }

    const fetchHtmlDynamic = ({parent,mode,isInit}:any)=>{
      let newViewMode=mode?mode:viewMode
      FetchWithAuth(`${process.env.REACT_APP_DMEDITOR_CONTENT_VIEW}/site/content/view?parent=${parent}&limt=${limit}&sortby=${sortby}&type=article&viewmode=${newViewMode}&site=dmdemo`)
      .then((data: { data: { [x: string]: any; }; settings: any; })=>{
        setHtml(data.data)
        let propsData = props.data;
        if(!isInit){
          let sourceData:soureDataDynamicType={parent:parent,contentType:currentList.metadata.contenttype,title:currentList.title,location:currentList.location,metadata:currentList.metadata,number:limit,sortby:sortby}
          props.onChange({...propsData, data:data.data,source:{sourceType:'dynamic',sourceData:sourceData},settings:{...propsData.settings, columns: columns,space:space,viewMode:newViewMode}});
        }
      });
    }

    const onConfirmSelect= (list:any,type:string)=>{
      if(type=='one'){
        setCurrentList(list);
      }else{
        setCurrentListM(list)
      }
    }

    const onConfirm = ()=>{
      if(sourceType=='fixed'){
        onConfirmFixed();
        setCurrentList({})
        setSelectSourceType('fixed')
      }else{
        onConfirmDynamic();
        setCurrentListM([])
        setSelectSourceType('dynamic')
      }
    }

    const onConfirmFixed = ()=>{
      if(currentListM.length==0){
        Util.error('Please select a file  before confirm')
       return  false    
      }
      let idArray:Array<any> = [];
      for(var item of currentListM){
        idArray.push(item.id);
      }
      fetchHtmlFixed({idArray})
      setAdding(false);
    }

    const onConfirmDynamic = ()=>{
      if(Object.keys(currentList).length===0){
        Util.error('Please select a file  before confirm')
        return;
      }
      fetchHtmlDynamic({parent:currentList.location.id})
      setAdding(false);
    }
 
    const onChangeViewMode = (e:any)=>{
      setViewMode(e.target.value);
      if(sourceType=='fixed'){
        if(currentListM.length==0)return;
        let idArray:Array<any> = [];
        for(var item of currentListM){
          idArray.push(item.id);
        }
        fetchHtmlFixed({idArray,mode:e.target.value})
      }else{
        if(Object.keys(currentList).length===0)return;
        fetchHtmlDynamic({parent:currentList.location.id,mode:e.target.value})
      }
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setSourceType(newValue);
    };

    const handleChange = (val:any,index:any,type:string) => {
      let sortbys=[...sortby]
      sortbys[index]=type==='type1'?val+' '+sortbys[index].split(' ')[1]:sortbys[index].split(' ')[0]+' '+val
      setSortby([...sortbys])
    };

    useEffect(()=>{
      if(isChange){
          let propsData = props.data;
          props.onChange({...propsData, settings:{...propsData.settings, columns: columns,space:space,viewMode:viewMode}});
          setIsChange(false)
      }
    },[isChange])
    
    useEffect(()=>{
      if(!props.view){
        if(source){
          if(source.sourceType==='fixed'){
            let idArray:Array<any> = [];
            for(var item of source.sourceData){
              idArray.push(item.id);
            }
            setCurrentListM(source.sourceData)
            fetchHtmlFixed({idArray,isInit:true})
          }else{
            setCurrentList(source.sourceData)
            fetchHtmlDynamic({parent:source.sourceData.parent,isInit:true})
          }
          setSourceType(source.sourceType)
          setSelectSourceType(source.sourceType)
        }
      }
    },[])

    if(isServer()){
        return <div className={"dm-columns columns-"+props.data.settings.columns}>        
            {Object.keys(props.data.data).map(index=><div key={index} style={{paddingLeft:space, paddingTop: space}}>
              <div dangerouslySetInnerHTML={{ __html:props.data.data[index]}} />
              </div>)}
          </div>;
    }

    return <div>
    {props.active&&<BlockProperty inBlock={props.inBlock} blocktype="content_grid">
        <PropertyGroup header='Settings'>
            <PropertyItem label='Columns'>
                <Ranger min={1} max={6} defaultValue={columns} onChange={(v: any)=>{setColumns(v); setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='Space'>
                <Ranger min={1} max={20} defaultValue={space} onChange={(v: any)=>{setSpace(v); setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='View mode'>
                <Select
                  fullWidth
                  size="small"
                  defaultValue={viewMode}
                  value={viewMode}
                  onChange={(e)=>{onChangeViewMode(e)}}
                >
                  <MenuItem value={"editor_block"}>block</MenuItem>
                  <MenuItem value={'editor_line'}>list</MenuItem>
                </Select>
            </PropertyItem>
            <PropertyItem label='Source'>
                {selectSourceType}
                <div><Button onClick={handleClickOpen}>Choose</Button></div>
            </PropertyItem>
        </PropertyGroup>
    </BlockProperty>}
    {adding&& <Dialog 
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={sourceType} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="Fixed" value='fixed'/>
              <Tab label="Dynamic" value='dynamic' />
            </Tabs>
          </Box>
          {sourceType=="fixed"&&<div className="tab-content">
            <Browse inline={true}  multi={true} trigger={true} selected={currentListM} contenttype={['article']}  onConfirm={(value:any)=>{onConfirmSelect(value,'more')}} /> 
          </div>}
          {sourceType=="dynamic"&&<div className="tab-content">
            <Browse  inline={true} multi={false} trigger={true} selected={Object.keys(currentList).length===0?'':currentList} contenttype={['folder']} onCancel={props.onCancel} onConfirm={(value:any)=>{onConfirmSelect(value,'one')}}/>
            <div style={{display:"flex",marginTop:'15px'}}>
              <label style={{width:'60px'}}>Order:</label>
              <div>
                {sortbyArr.map((item,index)=>{
                  return (
                    <div key={index} style={{display:"flex",margin:'0  0 10px 10px'}}>
                      <Select
                        sx={{ minWidth: 300,marginRight:'10px'}}
                        size="small"
                        defaultValue={item.type1}
                        value={sortby.length>0?sortby[index].split(' ')[0]:item.type1}
                        onChange={(e)=>{handleChange(e.target.value,index,'type1')}}
                      >
                        <MenuItem value={"priority"}>priority</MenuItem>
                        <MenuItem value={'published'}>published</MenuItem>
                        <MenuItem value={'modified'}>modified</MenuItem>
                      </Select>
                      <ToggleButtonGroup
                        value={sortby.length>0?sortby[index].split(' ')[1]:item.type2}
                        exclusive
                        onChange={(e,val)=>handleChange(val,index,'type2')}
                        aria-label="text alignment"
                      >
                        <ToggleButton value="desc" >
                          <ArrowUpwardOutlined />
                        </ToggleButton>
                        <ToggleButton value="asc" >
                          <ArrowDownwardOutlined />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                  )
                })}
              
              </div>
            </div>
            <div>
              <label style={{width:'60px'}}>Limit:</label>
              <TextField  sx={{marginLeft:'10px'}} size="small" variant="outlined" defaultValue={limit} onChange={(event:any)=>setLimit(event.target.value)} />
            </div>
          </div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} autoFocus> Confirm</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>}
      
    {Object.keys(html).length===0?<div className="empty-message">Please select Content</div>
    :<div className={"dm-columns columns-"+columns}>
        {Object.keys(html).map(id=>
          <div key={id} style={{paddingLeft:space, paddingTop: space}}>
            <div dangerouslySetInnerHTML={{__html: (html?html[id]:'') }} />
          </div>
        )}
      </div>
    }
  </div>
}

const serverLoad = async (data:any)=>{
  let sourceData = data.source.sourceData;
  if( sourceData ){
    let sourceType=data.source.sourceType;
    let viewmode=data.settings.viewMode||'editor_block';
    let url='';
    if(sourceType=='dynamic'){
      let {parent,number,sortby}=sourceData
      url=`site/content/view?parent=${parent}&limt=${number}&sortby=${sortby}&type=article&viewmode=${viewmode}&site=dmdemo`
    }else{
      let ids:any = [];
      for(let item of sourceData ){
        ids.push(item['id']);
      }
      let idStr = ids.join(',');
      url=`site/content/view?id=${idStr}&type=article&viewmode=${viewmode}&site=dmdemo`
    }
    let resp = await serverUtil.get(url);
    let result = {...data, data:resp.data.data};
    return result;
  }else{
    return {};
  }
}

export const toolContentGrid =   { 
    type: "content_grid",
    name: "Content grid",
    menu: {
      category: "content",
      icon: <GridViewOutlined />,
    },
initData: ()=>{
  return {type:'content_grid', data:{}, settings:{columns:3, space:5,viewMode:'editor_block'}};
},
onServerLoad: serverLoad,
view: (props:{data:any})=><ContentGrid view={true} data={props.data} active={false} onChange={()=>{}} inBlock={false} />,
render: (props:ToolRenderProps)=> <ContentGrid {...props} /> }