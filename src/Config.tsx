import { ElevatorSharp } from "@mui/icons-material";
import util from "digimaker-ui/util";
export const getcustomPropetryConfig = (type:any)=>{
  let customPropeyConfig:any={
    "image":["image"], 
    "text":["richtext"]
  }
  return customPropeyConfig[type]
}
export const getFileUrl = (path: any) => {
  if (process.env.REACT_APP_ASSET_URL) {
    return util.washVariables(process.env.REACT_APP_ASSET_URL as string, {imagepath:path})
  } else {
    return path
  }
  
}
export const getImageUrl = (path: any, isThumbnail?: boolean) => {
  if (isThumbnail) {
    if (process.env.REACT_APP_THUMB_PATH) {
      return util.washVariables(process.env.REACT_APP_THUMB_PATH as string, {imagepath:path})
    } else {
      return path
    }
  } else {
    if (process.env.REACT_APP_ASSET_URL) { 
      return util.washVariables(process.env.REACT_APP_ASSET_URL as string, {imagepath:path})
    } else {
      return path
    }
  }
}
