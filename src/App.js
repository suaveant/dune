import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { UserList} from './Components/UserList';
import { CharacterList} from './Components/CharacterList';
import { CharEdit} from './Components/CharEdit';
import { D6CharEdit } from './Components/D6Edit';
import { SWD6CharEdit } from './Components/SWD6Edit';
import { useQuery } from '@tanstack/react-query';

import './App.css';

let host = window.location.hostname;

function App() {
  const [characterId,setCharacterId] = useState();
  const [characterType,setCharacterType] = useState('');
  const [user,setUser] = useState('');
  const [cookies, setCookie, removeCookie ] = useCookies(['charSelection','charEdits']);
  const [character, setCharacter] = useState();
  const [charOrig, setCharOrig] = useState();
  const [initialized, setInitialized] = useState(false);


  useEffect(() => {
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

  const fetchCharacter = async ({ queryKey }) => {
    const res = await fetch(`http://${host}:3001/fetchCharacter/` + queryKey[1]);
    let resp = await res.json();
    if (resp.status) {
      resp.data.data.id = resp.data.id;
      setCharOrig(resp.data.data);
      let data;
      if (cookies.charEdits?.id === resp.data.id) {
        // setCharacter(cookies.duneCharEdits);
        data = cookies.charEdits;
      }
      else {
        // setCharacter(resp.data.data);
        data = {...resp.data.data};
      }
      console.log('character233',data,JSON.stringify(data));
      setInitialized(true);
    //   if (typeof data['talents'] === 'string') {
    //     let talents = data['talents'];
    //     data['talents'] = [];
    //     talents.split(/[\r\n]+/).forEach(t => data['talents'].push({ name: t }));
    //   }
    //   if (!data['assets'] && data['asset1']) {
    //     data['assets'] = [1, 2, 3].map(i => {
    //       let ret = { name: data['asset' + i], pot: data['pot' + i], quality: data['qual' + i] };
    //       return ret;
    //     })
    //   }
      let data2 = {};
      Object.keys(data).forEach(d => {
        if (!d.match(/^(asset|qual|pot)\d/))
          data2[d] = data[d];
      });
      console.log('data',data2);
      setCharacter(data2);
      return data2;
    }
  };

  // console.log('assets',character?.asses];
    // character.assets[2] = {...character.ats);
  const revertChanges = () => {
    let D = new Date().getTime();
    // character.assets = [...character.assetssets[2], pot: 6};
    let c = JSON.parse(JSON.stringify(charOrig));//{...charOrig};
    // c.assets = [...charOrig.assets]
    console.log('revert2',character,charOrig,c); 

    setCookie('duneCharEdits', c);
    setCharacter(c);//JSON.parse(JSON.stringify(charOrig)));
  }

  const saveChanges = () => {
    if (initialized) {
      fetch(`http://${host}:3001/update`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(character),
      });
      console.log('save2',typeof character,JSON.stringify(character));

      removeCookie('charEdits');
      setCharOrig(character);
    }
  };

  const isChanged = () => {
    let changed = false;
    if (character && charOrig) {
      console.log('change',character,charOrig,Object.keys(character).find(k => {

        return k === 'changeTime' ? false : character[k] !== charOrig[k];
      }));
      return Object.keys(character).find(k => {

        return k === 'changeTime' ? false : JSON.stringify(character[k]) !== JSON.stringify(charOrig[k]);
      }) ? true : false;
    }
    return changed;
  };
    
  const updateCharacter = (field, value) => {
    let D = new Date().getTime();
    console.log('oi',typeof(field));
    let updCharacter;
    if(typeof(field) === 'function') {
      updCharacter = field(character);
      console.log('uuucharacter2',updCharacter);
    } else {
      updCharacter = { ...character, [field]: value, changeTime: D };
    }

    setCookie('charEdits', updCharacter, { maxAge: 100000000 });
    setCharacter(updCharacter);

  };

  const charInfo = useQuery({ queryKey: ["character", characterId?.id], enabled: characterId !== undefined, queryFn: fetchCharacter });

console.log('charchar',character);
  if(user && character) {
    return <div>
      { character.type == 'dune' ? 
    <CharEdit user={user} characterId={characterId} setUser={setUser} setCharacterId={setCharacterId}/>
    : character.type == 'swd6' ? 
    <SWD6CharEdit user={user} revertChanges={revertChanges} saveChanges={saveChanges} isChanged={isChanged} updateCharacter={updateCharacter} character={character} setUser={setUser} setCharacter={setCharacter} charOrig={charOrig} setCharOrig={setCharOrig} />
    :
    <D6CharEdit user={user} characterId={characterId} setUser={setUser} setCharacterId={setCharacterId}/>
  }
    </div>
  
  }

  return (<div>
    { !user ? <UserList setUser={setUser}/> :
      <CharacterList user={user} setCharacterId={setCharacterId} setCharacterType={setCharacterType} setUser={setUser}/> 
      
}
</div>
  );
}

export default App;
