import { CollectionsOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Block} from "dmeditor/Block";
import {BlockList} from 'dmeditor/BlockList';
import { ToolDefinition, ToolRenderProps } from "dmeditor/ToolDefinition";
import { Util } from "dmeditor/utils";
import {BlockProperty} from 'dmeditor';
import {CommonSettings} from 'dmeditor/CommonSettings';
import { Alert, Button, Form } from "react-bootstrap";

const FeedbackForm = (props:ToolRenderProps &{view?:boolean})=>{
    const [commonSettings, setCommonSettings] = useState(props.data.common);
    const [validated, setValidated] = useState(false);

    const [result, setResult] = useState('');

    useEffect(()=>{
        props.onChange({...props.data,common: commonSettings });
    },[commonSettings]);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();

        const valid = form.checkValidity();
        if ( valid === false) {
          event.stopPropagation();
        }
    
        setValidated(true);

        if( valid ){
            const formData = new FormData(event.target),
            formDataObj = Object.fromEntries(formData.entries())
            
            fetch('/api/form/feedback', {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(formDataObj)
            }).then(res=>res.text()).then(data=>{
                setResult(data);
            });
        }
      };
    

    return <div style={commonSettings}>
        {props.active&&<BlockProperty blocktype="dm_feedback_form" inBlock={props.inBlock}>
                <CommonSettings commonSettings={commonSettings} onChange={(settings)=>setCommonSettings(settings)} />
            </BlockProperty>}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Name:</Form.Label>
            <Form.Control name="name" required type="text" placeholder="Enter name" />
            <Form.Control.Feedback type="invalid">
              Please input name.
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Company:</Form.Label>
            <Form.Control  name="company" type="text" placeholder="Your company (optional)" />           
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Email:</Form.Label>
            <Form.Control  name="email" required type="email" placeholder="Enter your email" />            
            <Form.Control.Feedback type="invalid">
              Please input valid email.
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Phone:</Form.Label>
            <Form.Control name="phone" type="text" placeholder="Your phone number (optional)" />            
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Message:</Form.Label>
            <Form.Control  name="message" required as="textarea" rows={3} placeholder="How can we help you?" />
            <Form.Control.Feedback type="invalid">
              Please input message.
            </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
            Submit
        </Button> <br /> <br />

        {result&&<div>
            {result === '1'&&<Alert variant="success">Thanks for your message. We will contact you soon.</Alert>}
            {result !== '1'&&<Alert variant="danger">{result}</Alert>}
        </div>}
        </Form>
    </div>
}


export const toolFeedbackForm: ToolDefinition = {
    type: 'dm_feedback_form',
    isComposited: true,
    name:"Feedback form",
    menu:  {category:'basic',icon: <CollectionsOutlined /> },
    initData: ()=>{
        return {
        type:'dm_feedback_form',
        settings:{},
        data:'', 
        common:{}      
        }
    },
    view: (props:{data:any})=><FeedbackForm  view={true} data={props.data} active={false} onChange={()=>{}} inBlock={false} />,
    render:FeedbackForm    
}
