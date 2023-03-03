import util from "digimaker-ui/util";
export const getcustomPropetryConfig = (type:any)=>{
  let customPropeyConfig:any={
    "image":["image"], 
    "text":["richtext"]
  }
  return customPropeyConfig[type]
}
export const getFileUrl = (path:any)=>{
  return util.washVariables(process.env.REACT_APP_ASSET_URL as string, {imagepath:path})
}
