import { useEffect, useState } from "react";
import axios from 'axios';

export default function Dashboard(){
    const [state, setState] = useState({
        loading: true,
        connected: false,
        email: ''
    });

    useEffect(() => {
        axios.get('http://localhost:3000/email/account')
        .then(res => {
            setState({
                loading: false,
                connected: res.data.connected,
                email: res.data.email
            })
        })
        .catch(() => {
            setState({loading: false, connected: false, email: ''})
        })
    }, []);

    if(state.loading){
        return <p>Loading...</p>;
    }

    if(!state.connected){
        return(
            <div style={{padding: '32px'}}>
                <h1>No Gmail Connected</h1>
                <button onClick={() => window.location.href="http://localhost:3000/email/connect"}>
                    Connect Gmail
                </button>
            </div>
        )
    }

    return(
        <div style={{padding: '32px'}}>
            <h1>Connected Gmail</h1>
            <p>{state.email}</p>
            <button onClick={() => axios.get('http://localhost:3000/email/send-oauth')}>
                Send Test Email
            </button>
            <button onClick={() => {
                axios.post('http://localhost:3000/email/disconnect').then(()=> window.location.reload());
            }} style = {{marginLeft: '12px'}}>
                Disconnect Gmail
            </button>
        </div>
    )
}