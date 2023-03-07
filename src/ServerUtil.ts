
import axios from 'axios';

const getApiKeyHeader = ()=>{
    const apiKey = process.env.REACT_APP_DMEDITOR_CONTENT_VIEW_SERVER_APIKEY;
    if(apiKey){
        return {
            'apiKey': apiKey
        }
    }else{
        return {};
    }
    
}


export const serverUtil = {
    get: (url:string)=>{
        return axios.get(
                process.env.REACT_APP_DMEDITOR_CONTENT_VIEW_SERVER+url,
                {
                headers: {
                    ...getApiKeyHeader()
                }
                }
            )
    }
}
