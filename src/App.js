import React, { Fragment, useEffect, useState } from 'react';
import { Button } from 'react-native';
import { useCookies } from 'react-cookie';
import { UserList} from './Components/UserList';
import { CharacterList} from './Components/CharacterList';
import { CharEdit} from './Components/CharEdit';
import './App.css';

let host = window.location.hostname;


function App() {
  const [characterId,setCharacterId] = useState();
  const [user,setUser] = useState('');
  // const [charId,setCharId] = useState('');
  const [cookies, setCookie] = useCookies(['charSelection']);
  
  useEffect(() => {
    console.log('cookies',cookies);
    if(cookies.charSelection?.user) {
      setUser(cookies.charSelection.user)
    }
    if(cookies.charSelection?.characterId) {
      setCharacterId(cookies.charSelection.characterId)
    }
  },[]);

  useEffect(() => {
    setCookie('charSelection', { user: user, characterId: characterId });
  }, [user,characterId]);


  console.log('userfoo',user,characterId);
  return (<div>
    { !user ? <UserList setUser={setUser}/> :
      !characterId ? <CharacterList user={user} setCharacterId={setCharacterId} setUser={setUser}/> :
    <CharEdit user={user} characterId={characterId} setUser={setUser} setCharacterId={setCharacterId}/>
}
</div>
  );
}

export default App;
