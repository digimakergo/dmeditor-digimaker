import { GridViewOutlined, ArrowUpwardOutlined,ArrowDownwardOutlined} from "@mui/icons-material";
//@ts-ignore
import { ToolRenderProps } from "dmeditor/ToolDefinition";
import {BlockProperty} from 'dmeditor/BlockProperty';
import {PropertyGroup, PropertyItem} from 'dmeditor/utils/Property';
import { Ranger } from "dmeditor/utils/Ranger";

import Browse from 'digimaker-ui/Browse';
//@ts-ignore
import util,{FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState,useRef } from "react";
import {IconButton,TextField,Select,MenuItem, ToggleButtonGroup,ToggleButton, Button, Dialog,DialogActions,DialogContent,DialogTitle,Tabs ,Tab , Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const ContentGrid = (props:ToolRenderProps) =>{
    const [ids, setIds] = useState(props.data.data as any);
    const [sourceType, setSourceType] = useState('fixed');
    const [selectSourceType, setSelectSourceType] = useState('fixed');
    const [list, setList] = useState([] as any);
    const [space, setSpace] = useState(props.data.settings.space);    
    const [columns, setColumns] = useState(props.data.settings.columns);
    const [adding, setAdding] = useState(props.adding);

    const [limit, setLimit] = useState(10);
    const [sortby, setSortby] = useState(["priority desc", "published desc"]);
    const [isChange, setisChange] = useState(false);
    const [currentList, setCurrentList] = useState({id:'',parent_id:''});
    const [currentListM, setCurrentListM] = useState([] as any);
    const limitInputRef:any = useRef(null)
    let level=10;
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
        alert('Please select a file  before confirm')
       return  false    
      }
      let idsArray:Array<any> = [];
      for(var item of currentListM){
        idsArray.push(item.id);
      }
      setIds(idsArray)
      setAdding(false);
      setisChange(!isChange);
      let data = props.data;
      props.onChange({...data, data: idsArray});
    }

    const onConfirmDynamic = ()=>{
      if(!((currentList.id??'')!=='')){
        alert('This is a warning alert — check it out!')
        return;
      }
      let idsArray:Array<any> = [];
      idsArray.push(currentList.id);
      setIds(idsArray)
      setAdding(false);
      setisChange(!isChange);
      setLimit(limitInputRef.current.firstChild.firstChild.value)
      let data = props.data;
      let settings={contentType:'article', columns:3, max:limitInputRef.current.firstChild.firstChild.value, source:{type:'dynamic', parent:currentList.id, sortby:sortby }};
        props.onChange({...data, content:[[]],settings:{...data.settings,...settings}});
    }

    const getList = ()=>{
      if( ids.length > 0 ){
        if(sourceType=='fixed'){
          FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/article?id='+ids.join(',')).then(data=>{
              setList(data.data.list);
          });
        }else{
          FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/article?parent='+ids.join(',')+'&limit='+limit+'&sortby='+sortby+'&level='+level).then(data=>{
            setList(data.data.list);
          });
        }
      }
    }
    useEffect(()=>{
      getList();
    },[isChange]);


    const handleChange = (e:any,index:any) => {
      let sortbys=[...sortby]
      sortbys[index]=e.target.value+' '+sortbys[index].split(' ')[1]
      setSortby([...sortbys])
    };
    const handleSortChange =(e:any,val: any,index:any) => {
      let sortbys=[...sortby]
      sortbys[index]=sortbys[index].split(' ')[0]+' '+val
      setSortby([...sortbys])
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setSourceType(newValue);
    };
    return <div>
    <BlockProperty title="Content grid" active={props.active}>
        <PropertyGroup header='Settings'>
            <PropertyItem label='Columns'>
                <Ranger min={1} max={6} defaultValue={columns} onChange={v=>setColumns(v)} />
            </PropertyItem>
            <PropertyItem label='Space'>
                <Ranger min={1} max={20} defaultValue={space} onChange={v=>setSpace(v)} />
            </PropertyItem>
            <PropertyItem label='Source'>
                {selectSourceType}
                <div><Button onClick={handleClickOpen}>Choose</Button></div>
            </PropertyItem>
        </PropertyGroup>
    </BlockProperty>
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
                    <div style={{display:"flex",margin:'0  0 10px 10px'}}>
                      <Select
                        sx={{ minWidth: 300,marginRight:'10px'}}
                        size="small"
                        defaultValue={item.type1}
                        value={sortby.length>0?sortby[index].split(' ')[0]:item.type1}
                        onChange={(e)=>{handleChange(e,index)}}
                      >
                        <MenuItem value={"priority"}>priority</MenuItem>
                        <MenuItem value={'published'}>published</MenuItem>
                        <MenuItem value={'modified'}>modified</MenuItem>
                      </Select>
                      <ToggleButtonGroup
                        value={sortby.length>0?sortby[index].split(' ')[1]:item.type2}
                        exclusive
                        onChange={(e,val)=>handleSortChange(e,val,index)}
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
              <TextField ref={limitInputRef} sx={{marginLeft:'10px'}} size="small" variant="outlined" defaultValue={limit} />
            </div>
          </div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} autoFocus> Confirm</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>}

   
      
    {(ids.length===0||list.length==0)&&<div className="empty-message">Please select Content</div>}
    <div className={"dm-columns columns-"+columns}>
        {list.map(item=><div style={{display:'inline-block', paddingLeft:space, paddingTop: space}} className='gallery-image'>
          <div className={'title'}>{item.title}</div>
          <div dangerouslySetInnerHTML={{__html:item.coverimage}}></div>
          <div dangerouslySetInnerHTML={{__html:item.summary}}></div>
        </div>)}
    </div>
  </div>
}

export const  toolContentGrid =   { 
    type: "content_grid",
    menu: {
      text: "Content grid",
      category: "content",
      icon: <GridViewOutlined />,
    },
initData: {type:'content_grid', data:[], settings:{contentType:'article', columns:3, space:5}},
view: (props:{data:Array<any>})=><ContentGrid data={props.data} active={false} onChange={()=>{}} />,
render: (props:ToolRenderProps)=> <ContentGrid {...props} /> }