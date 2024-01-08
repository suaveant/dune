import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TextField,  Alert } from '@mui/material';
import { MyButton } from '../MyButton';
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
    
    const [error,setError] = useState();
    const [newCharacter,setNewCharacter] = useState('');
    const createCharacter = async () => {
        const resp = await fetch(`http://${host}:3001/createCharacter/`+newCharacter+'/user/'+props.user.userid);
        let data = await resp.json();
        if(data.status) {
            props.setCharacterId(data.data);
        }
        else {
            setError(data.error)
        }
    };



    const userList = useQuery({queryKey: ["Characters",props.user.userid], queryFn: fetchCharacters});

    useEffect(()=>{console.log('change2')},[userList]);
    useEffect(()=>{console.log('change3')},[props.user.userid]);

    return <div style={{ 'margin-left': '35%', marginTop: '5%', width: '30%' }}><div style={{ position: 'absolute', left: '3%', top: 10 }}>
        <MyButton onClick={() => { props.setUser(''); props.setCharacterId(undefined); }} variant="contained">Switch User</MyButton></div>
    { error && <Alert severity="error">{error}</Alert> }
    <MyButton variant="contained" disabled={!newCharacter || Object.keys(userList?.data || {}).includes(newCharacter) } onClick={createCharacter}>New Character</MyButton> 
    
        <TextField variant="standard"  onInput={(e) => {
        setNewCharacter(e.target.value);
    }} value={newCharacter}/>
    <p/>
        {userList.isLoading ? 'Loading users...' : userList.data.map(u => {
            return <MyButton style={{ margin: '5px' }} variant="contained" onClick={e => {
                props.setCharacterId(u);
            }} key={u.id}>{u.character_name}</MyButton>;
        })}
    </div>
};