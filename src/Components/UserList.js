import React, { Fragment, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {  TextInput } from 'react-native';
import { TextField, Button } from '@mui/material';
let host = window.location.hostname;

const fetchUsers = async () => {
    const res = await fetch(`http://${host}:3001/userList`);
    let resp = await res.json();
    if(resp.status) {
        return resp.data;
    }
  };

export const UserList = (props) => {
    // const [userList,setUserList] = useState([]);
    const [newUser,setNewUser] = useState('');
    const getUsers = () => {
        fetch(`http://${host}:3001/userList`);
    }

    const createUser = async () => {

        const resp = await fetch(`http://${host}:3001/createUser/`+newUser);
        let data = await resp.text();
        if(data === 'user created') {
            props.setUser(newUser);
        }
    };

    const userList = useQuery({queryKey: ["users"], queryFn: fetchUsers});
    console.log(userList.data,props);
    return <div>
        <Button disabled={!newUser || userList?.data?.includes(newUser) } onClick={createUser} variant="contained" title="Add User">Add User</Button> 
        <TextField style={{ border: 'solid 1px black'}} onInput={(e) => {
            setNewUser(e.target.value);
        }} value={newUser}/>
        <p/>
        {userList.isLoading ? 'Loading users...' : userList?.data?.map(u => {
            return <Button variant="contained" onClick={e => props.setUser(u)} key={u.userid}>{u.username}</Button>;
        })}
    </div>
};