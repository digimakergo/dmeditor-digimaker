import React, { useState, useEffect } from "react";
import { Carousel, CarouselItem } from "react-bootstrap";
import { styled, Switch, SwitchProps } from "@mui/material";
import { CollectionsOutlined } from "@mui/icons-material";
import { ToolRenderProps, ToolDefinition } from "dmeditor/ToolDefinition";
import { BlockProperty } from "dmeditor/BlockProperty";
import { PropertyGroup, PropertyItem } from "dmeditor/utils/Property";
import { Ranger } from "dmeditor/utils/Ranger";
import util, { FetchWithAuth } from "digimaker-ui/util";
import Browse from "digimaker-ui/Browse";
import { getImageUrl } from "./Config"

const IOSSwitch = styled((props: SwitchProps) => <Switch {...props}></Switch>)(
  ({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#33cf4d",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 22,
      height: 22,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  })
);

function BlockCarousel(props: ToolRenderProps) {
  const [adding, setAdding] = useState(props.adding);
  const [indicators, setIndicators] = useState<boolean>(
    props.blockdata.settings?.indicators||true
  );
  const [height, setHeight] = useState<number>(props.blockdata.settings?.height||300);
  const [fade, setFade] = useState<boolean>(props.blockdata.settings?.fade||false);
  const [controls, setControls] = useState<boolean>(
    props.blockdata.settings?.controls||true
  );
  const [slide, setSlide] = useState<boolean>(props.blockdata.settings?.slide||true);
  const [interval, setInterval] = useState((props.blockdata.settings?.interval)?5000:null);
  const [ids, setIds] = useState<any[]>(() => {
    return props.blockdata.source?.contentId||[]
  });
  const [selectsource, setSelectsource] = useState<any[]>(() => {
    return props.blockdata.data;
  });
  const [isChange,setIsChange] = useState(false);

  useEffect(() => {
    if( ids.length > 0){
      FetchWithAuth(process.env.REACT_APP_REMOTE_URL+'/content/list/image?parent=461&cid='+ids.join(',')).then((data:any)=>{
        setSelectsource(data.data.list);
      });
    }
  }, []);

  useEffect(()=>{
    if(isChange){
      let propsData = props.blockdata;
      let settings={
        height: height,
        indicators: indicators,
        fade: fade,
        slide: slide,
        controls: controls,
        interval: interval,
      };
      props.onChange({...propsData, settings:{...propsData.settings, ...settings}});
      setIsChange(false)
    }
  },[isChange])

  const onConfirm = (list: any) => {
    let ids:Array<any> = [];
    let imgs:Array<any> = [];
      for(var item of list){
          ids.push(item.id);
          imgs.push(item.image)
      }
      setIds(ids)
      setSelectsource(list);
    let propsData = props.blockdata;
    props.onChange({...propsData, data: imgs,source:{contentType:"image",contentId:ids}});
  };
  const changeInterval = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterval(e.target.checked ? 5000 : null);
  };

  return (
    <>
      {props.active&&<BlockProperty blocktype="carousel" inBlock={props.inBlock}>
        <PropertyGroup header="Settings">
          <PropertyItem label="Height">
            <Ranger
              min={1}
              max={500}
              step={1}
              value={height}
              onChange={(v) => {setHeight(v);setIsChange(true)}}
            />
          </PropertyItem>
          <PropertyItem label="Indicators">
            <IOSSwitch
              checked={indicators}
              onChange={(e) => {
                setIndicators(e.target.checked);
                setIsChange(true)
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Slide">
            <IOSSwitch
              checked={slide}
              onChange={(e) => {
                setSlide(e.target.checked);
                setIsChange(true)
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Fade">
            <IOSSwitch
              checked={fade}
              onChange={(e) => {
                setFade(e.target.checked);
                setIsChange(true)
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Controls">
            <IOSSwitch
              checked={controls}
              onChange={(e) => {
                setControls(e.target.checked);
                setIsChange(true)
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Autoplay">
            <IOSSwitch
              onChange={(event) => {
                changeInterval(event);
                setIsChange(true)
              }}
              checked={!!interval}
              sx={{ m: 1 }}
            />
          </PropertyItem>
        </PropertyGroup>
      </BlockProperty>}
      {adding && (
        <div>
          <Browse
            parent={461}
            multi={true}
            trigger={true}
            selected={[]}
            contenttype={["image"]}
            onCancel={props.onCancel}
            onConfirm={onConfirm}
          />
        </div>
      )}
      <Carousel
        interval={interval}
        fade={fade}
        indicators={indicators}
        controls={controls}
        slide={slide}
      >
        {selectsource.map((item, index) => {
          return (
            <CarouselItem key={index}>
              <img
                className="d-block w-100"
                src={getImageUrl(item.image)}
                alt={`First slide ${index}`}
                style={{ height: height, objectFit:'contain'}}
              />
            </CarouselItem>
          );
        })}
      </Carousel>
    </>
  );
}

export const toolCarousel: ToolDefinition = {
  type: "carousel",
  name: "Carousel",
  menu: {
    category: "content",
    icon: <CollectionsOutlined />,
  },
  initData: ()=>{
    return {
    type: "carousel",
    data: [],
    settings: {
      height: 300,
      indicators: true,
      fade: false,
      slide: true,
      controls: true,
      interval: true,
    },
  }},
  render: (props: ToolRenderProps) => <BlockCarousel {...props} />,
};
