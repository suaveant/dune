import React, {  useState } from 'react';
import {  useQuery } from '@tanstack/react-query';
import { TextField, Alert } from '@mui/material';
import { MyButton } from '../MyButton';

let host = window.location.hostname;
const fetchUsers = async () => {
    const res = await fetch(`http://${host}:3001/userList`,{ mode: 'cors' });
    let resp = await res.json();
    if(resp.status) {
        return resp.data;
    }
  };

export const UserList = (props) => {
    // const [userList,setUserList] = useState([]);
    const [error,setError] = useState();
    const [newUser,setNewUser] = useState('');

    const createUser = async () => {

        const resp = await fetch(`http://${host}:3001/createUser/`+newUser);
        let data = await resp.json();
        if(data.status) {
            props.setUser(data.data);
        }
        else {
            setError(data.error)
        }
    };

    const userList = useQuery({queryKey: ["users"], queryFn: fetchUsers});
    return <div style={{ marginLeft: '40%', marginTop: '5%', width: '20%' }}>
        
        { error && <Alert severity="error">{error}</Alert> }
        <MyButton disabled={!newUser || userList?.data?.includes(newUser) } onClick={createUser} variant="contained" title="Add User">Add User</MyButton> 
        <TextField variant="standard" style={{ border: 'solid 1px black'}} onInput={(e) => {
            setNewUser(e.target.value);
        }} value={newUser}/>
        <p/>
        <div>
        {userList.isLoading ? 'Loading users...' : userList?.data?.sort((a,b) => { return a.username.toLowerCase() <= b.username.toLowerCase() ? -1 : 1 }).map(u => {
            return <MyButton style={{ margin: '5px' }} variant="contained" onClick={e => props.setUser(u)} key={u.userid}>{u.username}</MyButton>;
        })}
    </div></div>
};