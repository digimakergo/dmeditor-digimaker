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
    props.data.settings.indicators
  );
  const [height, setHeight] = useState<number>(props.data.settings.height);
  const [fade, setFade] = useState<boolean>(props.data.settings.fade);
  const [controls, setControls] = useState<boolean>(
    props.data.settings.controls
  );
  const [slide, setSlide] = useState<boolean>(props.data.settings.slide);
  const [interval, setInterval] = useState(() => {
    return props.data.settings.interval ? 5000 : null;
  });
  const [list, setList] = useState<any[]>(() => {
    return props.data.content;
  });
  useEffect(() => {
    if (list.length > 0) {
      FetchWithAuth(
        process.env.REACT_APP_REMOTE_URL +
          "/content/list/image?cid=" +
          list.join(",")
      ).then((data: any) => {
        setList(data.data.list);
      });
    }
  }, []);
  const onConfirm = (list: any) => {
    setList(list);
  };
  const changeInterval = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterval(e.target.checked ? 5000 : null);
  };
  return (
    <>
      <BlockProperty title='Carousel' active={props.active}>
        <PropertyGroup header="Settings">
          <PropertyItem label="Height">
            <Ranger
              min={1}
              max={500}
              step={1}
              value={height}
              onChange={(v) => setHeight(v)}
            />
          </PropertyItem>
          <PropertyItem label="Indicators">
            <IOSSwitch
              checked={indicators}
              onChange={(e) => {
                setIndicators(e.target.checked);
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Slide">
            <IOSSwitch
              checked={slide}
              onChange={(e) => {
                setSlide(e.target.checked);
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Fade">
            <IOSSwitch
              checked={fade}
              onChange={(e) => {
                setFade(e.target.checked);
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Controls">
            <IOSSwitch
              checked={controls}
              onChange={(e) => {
                setControls(e.target.checked);
              }}
              sx={{ m: 1 }}
            />
          </PropertyItem>
          <PropertyItem label="Autoplay">
            <IOSSwitch
              onChange={(event) => {
                changeInterval(event);
              }}
              checked={!!interval}
              sx={{ m: 1 }}
            />
          </PropertyItem>
        </PropertyGroup>
      </BlockProperty>
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
        {list.map((item, index) => {
          return (
            <CarouselItem key={index}>
              <img
                className="d-block w-100"
                src={process.env.REACT_APP_ASSET_URL + "/" + item.image}
                alt={`First slide ${index}`}
                style={{ height: height }}
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
  menu: {
    text: "Carousel",
    category: "content",
    icon: <CollectionsOutlined />,
  },
  initData: {
    type: "carousel",
    content: [],
    settings: {
      height: 300,
      indicators: true,
      fade: false,
      slide: true,
      controls: true,
      interval: true,
    },
  },
  view: (props:{data:Array<any>})=><BlockCarousel data={props.data} active={false} onChange={()=>{}} />,
  render: (props: ToolRenderProps) => <BlockCarousel {...props} />,
};
