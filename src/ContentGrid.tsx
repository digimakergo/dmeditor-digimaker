import { GridViewOutlined, ArrowUpwardOutlined,ArrowDownwardOutlined, Settings, SwapCallsRounded} from "@mui/icons-material";

import { BlockProperty, ToolRenderProps } from "dmeditor";
import { Ranger, isServer, PropertyGroup, PropertyItem} from "dmeditor/utils";
import { Util} from "dmeditor/utils/Util";
// import { Dialog} from "dmeditor/utils/Dialog";
import axios from 'axios';

import Browse from 'digimaker-ui/Browse';

import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState,useRef } from "react";
import {IconButton,TextField,Select,MenuItem, ToggleButtonGroup,ToggleButton, Button, Dialog,DialogActions,DialogContent,DialogTitle,Tabs ,Tab , Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}
interface sourceInter {
  sourceType:string,
  sourceData?:{[propName:string]:any}
}

const ContentGrid = (props: ToolRenderProps &{view?:boolean}) =>{
    // const [ids, setIds] = useState(props.data.data as any);
    const [sourceType, setSourceType] = useState('fixed');
    const [selectSourceType, setSelectSourceType] = useState('fixed');
    // const [list, setList] = useState([] as any);
    const [space, setSpace] = useState(props.data.settings.space);    
    const [columns, setColumns] = useState(props.data.settings.columns);
    const [viewMode,setViewMode] = useState(props.data.settings.viewMode?props.data.settings.viewMode:'editor_block');
    const [isChange,setIsChange] = useState(false);
    const [adding, setAdding] = useState(props.adding);
    const [html, setHtml] = useState(props.data.data as any);

    const [limit, setLimit] = useState(10);
    const [sortby, setSortby] = useState(["priority desc", "published desc"]);
    // const [isChange, setisChange] = useState(false);
    const [currentList, setCurrentList] = useState({id:'',parent_id:''});
    const [currentListM, setCurrentListM] = useState([] as any);
    const limitInputRef:any = useRef(null)
    // let level=10;
    let sortbyArr=[{type1:'priority',type2:'desc'}, {type1:'published',type2:'desc'}]



    const handleClickOpen = () => {
      setAdding(true);
      setAdding(false);
      setTimeout(()=>{setAdding(true);},10)
    };
  
    const handleClose = (event?:any, reason?:any) => {
      if (reason && reason === "backdropClick") 
      return;
      setAdding(false);
      // props.onCancel();
      if(selectSourceType=='fixed'){
        setSourceType('fixed')
      }else{
        setSourceType('dynamic')
      }
    };


    const fetchHtml = (idArray:any,type:string)=>{
      //process.env.DMEDITOR_CONTENT_VIEW
      FetchWithAuth('http://dmdemo2.dev.digimaker.no/api/site/content/view?id='+idArray.join(',')+'&type=article&viewmode='+viewMode+'&site=dmdemo')
      .then((data: { data: { [x: string]: any; }; settings: any; })=>{
        let html:any = {};
        for(let id of idArray){
          html[id] = data.data[id]
        }
        setHtml(html)
        let list = props.data;
        if(type==='fixed'){
          props.onChange({...list,data:html,source:{sourceType:'fixed',sourceData:currentListM}, settings:{...list.settings, columns: columns,space:space,viewMode:viewMode}});
          console.log("fixed data",{...list,data:html,source:{sourceType:'fixed',sourceData:currentListM}, settings:{...list.settings, columns: columns,space:space,viewMode:viewMode}})
        }else{
          let data = props.data;
          let settings={contentType:'article', columns:3,space:space,viewMode:viewMode, max:limit, source:{type:'dynamic', parent:currentList.id, sortby:sortby }};
            props.onChange({...data, content:[[]],source:{sourceType:'dynamic',sourceData:currentList},settings:{...data.settings,...settings}});
            console.log("dynamic data",{...data, content:[[]],source:{sourceType:'dynamic',sourceData:currentList},settings:{...data.settings,...settings}});
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
        setCurrentList({id:'',parent_id:''})
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
      let idsArray:Array<any> = [];
      for(var item of currentListM){
        idsArray.push(item.id);
      }
      // setIds(idsArray)
      fetchHtml(idsArray,'fixed')
      setAdding(false);
      // setisChange(!isChange);
    }

    const onConfirmDynamic = ()=>{
      if(!((currentList.id??'')!=='')){
        Util.error('Please select a file  before confirm')
        return;
      }
      let idsArray:Array<any> = [];
      idsArray.push(currentList.id);
      // setIds(idsArray)
      // setLimit(limitInputRef.current.firstChild.firstChild.value)
      fetchHtml(idsArray,'dynamic')
      setAdding(false);
      // setisChange(!isChange);
     
    }

    // const getList = ()=>{
    //   if( ids.length > 0 ){
    //     if(sourceType=='fixed'){
    //       FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/article?id='+ids.join(',')).then(data=>{
    //           setList(data.data.list);
    //       });
    //     }else{
    //       FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/article?parent='+ids.join(',')+'&limit='+limit+'&sortby='+sortby+'&level='+level).then(data=>{
    //         setList(data.data.list);
    //       });
    //     }
    //   }
    // }
    // useEffect(()=>{
    //   getList();
    // },[isChange]);


    const handleChange = (val:any,index:any,type:string) => {
      let sortbys=[...sortby]
      sortbys[index]=type==='type1'?val+' '+sortbys[index].split(' ')[1]:sortbys[index].split(' ')[0]+' '+val
      setSortby([...sortbys])
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setSourceType(newValue);
    };

    useEffect(()=>{
      if(isChange){
        if(selectSourceType==='fixed'){
          let list = props.data;
          props.onChange({...list, settings:{...list.settings, columns: columns,space:space,viewMode:viewMode}});
          setIsChange(false)
          console.log("fixed settings",{...list, settings:{...list.settings, columns: columns,space:space,viewMode:viewMode}})
        }
      }
    },[isChange])
    

    if(isServer()){
        return <div className={"dm-columns columns-"+props.data.settings.columns}>        
            {Object.keys(props.data.data).map(index=><div style={{paddingLeft:space, paddingTop: space}}>
              <div dangerouslySetInnerHTML={{ __html:props.data.data[index]}} />
              </div>)}
          </div>;
    }

    return <div>
    <BlockProperty title="Content grid" active={props.active}>
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
                  onChange={(e)=>{setViewMode(e.target.value);setIsChange(true)}}
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
    </BlockProperty>
    {/* <Dialog/> */}
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
            <Browse  inline={true} multi={false} trigger={true} selected={currentList.id==''?'':currentList} contenttype={['folder']} onCancel={props.onCancel} onConfirm={(value:any)=>{onConfirmSelect(value,'one')}}/>
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
              {/* ref={limitInputRef} */}
              <TextField  sx={{marginLeft:'10px'}} size="small" variant="outlined" defaultValue={limit} onChange={(event:any)=>setLimit(event.target.value)} />
            </div>
          </div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} autoFocus> Confirm</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>}
      
    {(Object.keys(html).length===0&&html.constructor===Object)?<div className="empty-message">Please select Content</div>
    :<div className={"dm-columns columns-"+columns}>
        {Object.keys(html).map(id=>
          <div style={{paddingLeft:space, paddingTop: space}}>
            <div dangerouslySetInnerHTML={{__html: (html?html[id]:'') }} />
          </div>
        )}
      </div>
    }
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

export const toolContentGrid =   { 
    type: "content_grid",
    menu: {
      text: "Content grid",
      category: "content",
      icon: <GridViewOutlined />,
    },
initData: {type:'content_grid', data:[], settings:{contentType:'article', columns:3, space:5}},
onServerLoad: serverLoad,
view: (props:{data:Array<any>})=><ContentGrid view={true} data={props.data} active={false} onChange={()=>{}} />,
render: (props:ToolRenderProps)=> <ContentGrid {...props} /> }