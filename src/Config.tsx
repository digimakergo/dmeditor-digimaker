export const getcustomPropetryConfig = (type:any)=>{
  let customPropeyConfig:any={
    "image":["image"], 
    "text":["richtext"]
  }
  return customPropeyConfig[type]
}
