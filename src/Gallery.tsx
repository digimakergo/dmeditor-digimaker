import { BrowseGalleryOutlined, CollectionsOutlined, Grid4x4Outlined } from "@mui/icons-material";

import { ToolRenderProps, BlockProperty } from "dmeditor";
import {PropertyGroup, PropertyItem, Ranger} from 'dmeditor/utils';

import Radio from '@mui/material/Radio';

import {Browse} from 'digimaker-ui';
import {FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState } from "react";
import { Button, FormControlLabel, RadioGroup } from "@mui/material";


const Gallery = (props:ToolRenderProps) =>{
    const [ids, setIds] = useState(props.data.source? props.data.source.contentId:[]);
    const [space, setSpace] = useState(props.data.settings.space);    
    const [selectsource, setSelectsource] = useState([] as any);
    const [sourceType, setSourceType] = useState('fixed');
    const [columns, setColumns] = useState(props.data.settings.columns);
    const [adding, setAdding] = useState(props.adding);
    const [isChange,setIsChange] = useState(false);

    const handleClickOpen = () => {
      setAdding(true);
      setAdding(false);
      setTimeout(()=>{setAdding(true);},10)
    };

    const onConfirm = (list:any)=>{
        let ids:Array<any> = [];
        let imgs:Array<any> = [];
        for(var item of list){
            ids.push(item.id);
            imgs.push(item.image)
        }
        setIds(ids)
        setSelectsource(list);
        setAdding(false);
        let data = props.data;
        props.onChange({...data, data: imgs,source:{contentType:"image",contentId:ids}});
    }

    useEffect(()=>{
        if( ids.length > 0){
            FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/image?cid='+ids.join(',')).then(data=>{
              setSelectsource(data.data.list);
            });
        }
    },[]);

    useEffect(()=>{
      if(isChange){
        if(sourceType==='fixed'){
          let propsData = props.data;
          props.onChange({...propsData, settings:{...propsData.settings, columns: columns,space:space}});
          setIsChange(false)
        }
      }
    },[isChange])

    return <div>
    {props.active&&<BlockProperty inBlock={props.inBlock} blocktype="gallery">
        <PropertyGroup header='Settings'>
            <PropertyItem label='Columns'>
                <Ranger min={1} max={6} defaultValue={columns} onChange={v=>{setColumns(v);setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='Space'>
                <Ranger min={1} max={20} defaultValue={space} onChange={v=>{setSpace(v);setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='Source'>
              {/* <RadioGroup value={sourceType} onChange={e=>setSourceType(e.target.value)}>
                <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed" />
                <FormControlLabel value="dynamic" control={<Radio size="small" />} label="Dynamic" />
              </RadioGroup> */}
              <Button onClick={handleClickOpen}>Choose</Button>
            </PropertyItem>
        </PropertyGroup>
    </BlockProperty>}
    {adding&&<div>
        <Browse parent={461} multi={true} trigger={true} selected={selectsource} contenttype={['image']} onCancel={props.onCancel} onConfirm={onConfirm} />
        </div>}

    {Object.keys(selectsource).length===0?<div className="empty-message">Please select images</div>:
    <div className={"dm-columns columns-"+columns}>
        {selectsource.map(item=><div style={{display:'inline-block', paddingLeft:space, paddingTop: space}} className='gallery-image'><img src={process.env.REACT_APP_ASSET_URL+'/'+item.image}></img></div>)}
    </div>
    }
    </div>
}

export const  toolContentGallery =   { 
    type: "content_gallery",
    name: "Gallery",
menu: {
  category: "content",
  icon: <CollectionsOutlined />,
},
initData: {type:'content_gallery', data:[], settings:{contentType:'image', columns:3, space:5}},
view: (props:{data:Array<any>})=><Gallery data={props.data} active={false} onChange={()=>{}} />,
render: (props:ToolRenderProps)=> <Gallery {...props} /> }