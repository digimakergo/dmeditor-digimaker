import { CollectionsOutlined} from "@mui/icons-material";
import { ToolRenderProps, BlockProperty } from "dmeditor";
import {PropertyGroup, PropertyItem, Ranger} from 'dmeditor/utils';
import {Browse} from 'digimaker-ui';
import {FetchWithAuth} from 'digimaker-ui/util'
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { getImageUrl } from "./Config"


const Gallery = (props:ToolRenderProps) =>{
    const [ids, setIds] = useState(props.blockdata.source?.contentId||[]);
    const [space, setSpace] = useState(props.blockdata.settings?.space);    
    const [selectsource, setSelectsource] = useState([] as any);
    const [sourceType, setSourceType] = useState('fixed');
    const [columns, setColumns] = useState(props.blockdata.settings?.columns);
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
        let data = props.blockdata;
        props.onChange({...data, data: imgs,source:{contentType:"image",contentId:ids}});
    }
    const showTrueImage = (image:any)=>{
      let  w:any=window.open('about:blank')
      w.location.href=getImageUrl(image)
    }

    useEffect(()=>{
        if( ids.length > 0){
            FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/image?parent=461&cid='+ids.join(',')).then((data:any)=>{
              setSelectsource(data.data.list);
            });
        }
    },[]);

    useEffect(()=>{
      if(isChange){
        if(sourceType==='fixed'){
          let propsData = props.blockdata;
          props.onChange({...propsData, settings:{...propsData.settings, columns: columns,space:space}});
          setIsChange(false)
        }
      }
    },[isChange])

    return <div>
    {props.active&&<BlockProperty inBlock={props.inBlock} blocktype="content_gallery">
        <PropertyGroup header='Settings'>
            <PropertyItem label='Columns'>
                <Ranger min={1} max={6} defaultValue={columns} onChange={v=>{setColumns(v);setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='Space'>
                <Ranger min={1} max={20} defaultValue={space} onChange={v=>{setSpace(v);setIsChange(true)}} />
            </PropertyItem>
            <PropertyItem label='Source'>
              <Button onClick={handleClickOpen}>Choose</Button>
            </PropertyItem>
        </PropertyGroup>
    </BlockProperty>}
    {adding&&<div>
        <Browse parent={461} multi={true} trigger={true} selected={selectsource} contenttype={['image']} onCancel={props.onCancel} onConfirm={onConfirm} />
        </div>}

    {Object.keys(selectsource).length===0?<div className="empty-message">Please select images</div>:
    <div className={"dm-columns columns-"+columns}>
        {selectsource.map((item:any)=><div style={{display:'inline-block', paddingLeft:space, paddingTop: space}} className='gallery-image'><img onClick={()=>{showTrueImage(item.image)}} src={getImageUrl(item.image,true)}></img></div>)}
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
initData: ()=>{
  return {type:'content_gallery', data:[], settings:{contentType:'image', columns:3, space:5}};
},
render: (props:ToolRenderProps)=> <Gallery {...props} /> }