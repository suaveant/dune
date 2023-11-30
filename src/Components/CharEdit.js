import React, { Fragment, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { TextField, Button } from '@mui/material';
import { useCookies } from 'react-cookie';

let host = window.location.hostname;

const CharEditor = ({children,updateHandler,data,orig}) => {
  console.log('CharEditor',children,updateHandler,data,orig);
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      return React.cloneElement(child, {
        updateHandler: updateHandler,
        data: data,
        orig: orig,
      });
    });
  };
  
  return <div>{renderChildren()}</div>;
}

const CharInput = ({field, left, top, width, className, data, orig, updateHandler}) => {
  console.log('CharEditor2',field, left, top, width, className, data, orig, updateHandler,{ left: left+'%', top: top+'%', width: width+'%' });
  if(data?.[field] !== orig?.[field]) {
    className += ' changed';
  }
  console.log('CharEditor3',className,data?.[field], orig?.[field]);
  return (
  <span><input
    placeholder=""
    onChange={(e) => updateHandler(field, e.target.value)}
    value={data?.[field]}
    style={{ left: left+'%', top: top+'%', width: width+'%' }}
    className={"cleanInput "+className} /></span>);
}

export const CharEdit = (props) => {
  const [initialized, setInitialized] = useState(false);

  const [charOrig, setCharOrig] = useState();
  const [character, setCharacter] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(['duneCharEdits']);
  // const [userList,setUserList] = useState([]);
  const updateCharacter = (field, value) => {
    let D = new Date().getTime();
    setCookie('duneCharEdits',{ ...character, [field]: value, changeTime: D }, { maxAge: 100000000 });
    setCharacter(character => {
      return { ...character, [field]: value, changeTime: D };
    });

  };

  const fetchCharacter = async ({ queryKey }) => {
    const res = await fetch(`http://${host}:3001/fetchCharacter/` + queryKey[1]);
    let resp = await res.json();
    console.log('data1',resp);
    if(resp.status) {
         resp.data.data.id = resp.data.id;
      console.log('data',resp,'>>',resp.data);
      setCharOrig(resp.data.data);
      if(cookies.duneCharEdits?.id == resp.data.id) {
        setCharacter(cookies.duneCharEdits);
      }
      else {
        setCharacter(resp.data.data);
      }
      setInitialized(true);
      return resp.data.data;
    }
  };

  const saveChanges = () => {
    console.log('update', character, initialized);
    if (initialized) {
      fetch(`http://${host}:3001/update`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(character),
      });
      removeCookie('duneCharEdits');
      setCharOrig(character);
    }
  };

  console.log('character', character, props.characterId);
  const userInfo = useQuery({ queryKey: ["character", props.characterId.id], queryFn: fetchCharacter  });
  console.log('char', userInfo.isLoading, userInfo['data']);
  useEffect(() => {console.log('change!')},[userInfo]);
  // if(!userInfo.isLoading) {
  //   setCharacter((c) => setCharacter(userInfo['data']));
  // }
  // const createCharacter = async () => {
  //     const resp = await fetch(`http://${host}:3001/createCharacter/`+newCharacter+'/user/'+props.user);
  //     let data = await resp.text();
  //     if(data === 'user created') {
  //         props.setUser(newCharacter);
  //     }
  // };

  return <Fragment>
    <div className="App">
      <CharEditor updateHandler={updateCharacter} data={character} orig={charOrig}>
      <div style={{ position: 'absolute', left: 30, top: 10 }}>
        {character?.name}
        <br />
        User: {props.user.username || ''}
        <br/>
        <Button onClick={() => { props.setUser(''); props.setCharacterId(undefined); }} variant="contained">Switch User</Button>
        <Button onClick={() => { saveChanges() }} variant="contained">Save</Button>
      </div>
      <CharInput field='name' left={12} top={20.6} width={34} className="cleanInput small"/>
      {/* <input placeholder="" onChange={(e) => updateCharacter('name', e.target.value)} value={character?.name || 'Fred'} style={{ left: '12%', top: '20.4%', width: '34%' }} className="cleanInput small"></input> */}
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('house', e.target.value)} value={character?.house} style={{ left: '12%', top: '24.4%', width: '34%' }} className="cleanInput small"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('role', e.target.value)} value={character?.role} style={{ left: '12%', top: '28.1%', width: '34%' }} className="cleanInput small"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('faction', e.target.value)} value={character?.faction} style={{ left: '12%', top: '31.7%', width: '34%' }} className="cleanInput small"></input>
      <input placeholder="" onChange={(e) => updateCharacter('ambition', e.target.value)} value={character?.ambition} style={{ left: '54.8%', top: '34.3%', width: '34%' }} className="cleanInput smallerer"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('duty', e.target.value)} value={character?.duty} style={{ left: '25.5%', top: '43.2%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('faith', e.target.value)} value={character?.faith} style={{ left: '25.5%', top: '47.6%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <textarea placeholder="" onChange={(e) => updateCharacter('dutyStatement', e.target.value)} value={character?.dutyStatement} style={{ left: '30.2%', top: '42.5%', height: '3.6%', width: '25.5%' }} className="duty cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('faithStatement', e.target.value)} value={character?.faithStatement} style={{ left: '30.2%', top: '47.1%', height: '3.6%', width: '25.5%' }} className="faith cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('justiceStatement', e.target.value)} value={character?.justiceStatement} style={{ left: '30.2%', top: '51.6%', height: '3.6%', width: '25.5%' }} className="justice cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('powerStatement', e.target.value)} value={character?.powerStatement} style={{ left: '30.2%', top: '56.2%', height: '3.6%', width: '25.5%' }} className="power cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('truthStatement', e.target.value)} value={character?.truthStatement} style={{ left: '30.2%', top: '60.7%', height: '3.6%', width: '25.5%' }} className="truth cleanArea" />

      <textarea placeholder="" onChange={(e) => updateCharacter('traits', e.target.value)} value={character?.traits} style={{ left: '54.8%', top: '23.2%', height: '8.8%', width: '34%' }} className="traits cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('talents', e.target.value)} value={character?.talents} style={{ left: '65.7%', top: '42.8%', height: '18.5%', width: '26%' }} className="talents cleanArea" />

      <br />
      <input placeholder="" onChange={(e) => updateCharacter('justice', e.target.value)} value={character?.justice} style={{ left: '25.5%', top: '52.2%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('power', e.target.value)} value={character?.power} style={{ left: '25.5%', top: '56.8%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('truth', e.target.value)} value={character?.truth} style={{ left: '25.5%', top: '61.4%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('battle', e.target.value)} value={character?.battle} style={{ left: '25.5%', top: '72.8%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('communicate', e.target.value)} value={character?.communicate} style={{ left: '25.5%', top: '77.4%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('discipline', e.target.value)} value={character?.discipline} style={{ left: '25.5%', top: '81.9%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('move', e.target.value)} value={character?.move} style={{ left: '25.5%', top: '86.5%', width: '2%' }} className="cleanInput large"></input>
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('understand', e.target.value)} value={character?.understand} style={{ left: '25.5%', top: '91%', width: '2%', textAlign: 'center' }} className="cleanInput large"></input>
      <br />
      <textarea placeholder="" onChange={(e) => updateCharacter('focusBattle', e.target.value)} value={character?.focusBattle} style={{ left: '30.2%', top: '72.5%', height: '3.6%', width: '25.5%' }} className="battle cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('focusCommunicate', e.target.value)} value={character?.focusCommunicate} style={{ left: '30.2%', top: '76.8%', height: '3.6%', width: '25.5%' }} className="communicate cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('focusDiscipline', e.target.value)} value={character?.focusDiscipline} style={{ left: '30.2%', top: '81.3%', height: '3.6%', width: '25.5%' }} className="discipline cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('focusMove', e.target.value)} value={character?.focusMove} style={{ left: '30.2%', top: '85.9%', height: '3.6%', width: '25.5%' }} className="move cleanArea" />
      <textarea placeholder="" onChange={(e) => updateCharacter('focusUnderstand', e.target.value)} value={character?.focusUnderstand} style={{ left: '30.2%', top: '90.5%', height: '3.6%', width: '25.5%' }} className="understand cleanArea" />
      <br />
      <input placeholder="" onChange={(e) => updateCharacter('asset1', e.target.value)} value={character?.asset1} style={{ left: '68.7%', top: '67.8%', width: '20%' }} className="cleanInput smaller"></input>
      <input placeholder="" onChange={(e) => updateCharacter('pot1', e.target.value)} value={character?.pot1} style={{ left: '73%', top: '70%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('qual1', e.target.value)} value={character?.qual1} style={{ left: '80.5%', top: '70%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('asset2', e.target.value)} value={character?.asset2} style={{ left: '68.7%', top: '72.6%', width: '20%' }} className="cleanInput smaller"></input>
      <input placeholder="" onChange={(e) => updateCharacter('pot2', e.target.value)} value={character?.pot2} style={{ left: '73%', top: '74.8%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('qual2', e.target.value)} value={character?.qual2} style={{ left: '80.5%', top: '74.8%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('asset3', e.target.value)} value={character?.asset3} style={{ left: '68.7%', top: '77.5%', width: '20%' }} className="cleanInput smaller"></input>
      <input placeholder="" onChange={(e) => updateCharacter('pot3', e.target.value)} value={character?.pot3} style={{ left: '73%', top: '79.6%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('qual3', e.target.value)} value={character?.qual3} style={{ left: '80.5%', top: '79.6%', width: '2%' }} className="cleanInput smallerer"></input>
      <input placeholder="" onChange={(e) => updateCharacter('advpoints', e.target.value)} value={character?.advpoints} style={{ left: '71%', top: '90.2%', width: '2%' }} className="cleanInput large"></input>
      <input placeholder="" onChange={(e) => updateCharacter('determination', e.target.value)} value={character?.determination} style={{ left: '84.3%', top: '90.2%', width: '2%' }} className="cleanInput large"></input>
      </CharEditor>
    </div>
    <pre>{JSON.stringify(character)}</pre>
  </Fragment>;
}

