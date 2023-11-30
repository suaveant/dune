import React, { Fragment, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { TextField, Button } from '@mui/material';
let host = window.location.hostname;


const fetchCharacters = async ({ queryKey }) => {
    const res = await fetch(`http://${host}:3001/characterList/`+queryKey[1]);
    // return res.json();
    let resp = await res.json();
    if(resp.status) {
        return resp.data;
    }
  };


export const CharacterList = (props) => {
    // const [userList,setUserList] = useState([]);
    
    const [newCharacter,setNewCharacter] = useState('');
    const createCharacter = async () => {
        const resp = await fetch(`http://${host}:3001/createCharacter/`+newCharacter+'/user/'+props.user.userid);
        let data = await resp.text();
        if(data === 'character created') {
            props.setCharacter({ name: newCharacter });
        }
    };



    const userList = useQuery({queryKey: ["Characters",props.user.userid], queryFn: fetchCharacters});
    console.log('change4',userList);

    useEffect(()=>{console.log('change2')},[userList]);
    useEffect(()=>{console.log('change3')},[props.user.userid]);

    console.log('moo',userList.isLoading,props,userList.data);
    return <div>
        <Button  variant="contained" disabled={!newCharacter || Object.keys(userList?.data || {}).includes(newCharacter) } onClick={createCharacter}>New Character</Button> 
        <TextField style={{ border: 'solid 1px black'}} onInput={(e) => {
        setNewCharacter(e.target.value);
    }} value={newCharacter}/>
    <p/>
        {userList.isLoading ? 'Loading users...' : userList.data.map(u => {
            console.log('uuu',u);
            return <Button variant="contained" onClick={e => {
                console.log('uu',u,u.character_name);
                props.setCharacterId(u);
            }} key={u.id}>{u.character_name}</Button>;
        })}
    </div>
};