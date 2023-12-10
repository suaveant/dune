import React, { Fragment, useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Popover, InputLabel, Tooltip } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useCookies } from 'react-cookie';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ReactEditList, * as REL from "react-edit-list";
import { MyButton } from '../MyButton';
import { ReactSortable } from "react-sortablejs";
import ContentEditable from 'react-contenteditable'
import Info from '@mui/icons-material/Info';
import DragHandle from '@mui/icons-material/DragHandle';
import { Delete } from '@mui/icons-material';

let host = window.location.hostname;

const CharEditor = ({ children, updateHandler, data, orig }) => {
  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      //  console.log('clone', child);
      if (child && (child.props.field)) {
        return React.cloneElement(child, {
          updateHandler: updateHandler,
          data: data,
          orig: orig,
        });
      }
      return child;
    });
  };



  return <div>{renderChildren()}</div>;
}

const CharArea = ({ field, left, top, width, height, className, data, orig, updateHandler }) => {
  if (data?.[field] !== orig?.[field]) {
    className += ' changed';
  }
  return <textarea
    onChange={(e) => updateHandler(field, e.target.value)}
    value={data?.[field]}
    style={{ left: left + '%', top: top + '%', width: width + '%', height: height + '%' }}
    className={"cleanArea clean " + className} />

}

const CharInput = ({ field, left, top, width, className, data, orig, updateHandler }) => {
  if (data?.[field] !== orig?.[field]) {
    className += ' changed';
  }
  return (
    <span><input
      placeholder=""
      onChange={(e) => updateHandler(field, e.target.value)}
      value={data?.[field]}
      style={{ left: left + '%', top: top + '%', width: width + '%' }}
      className={className+" cleanInput clean"} /></span>);
}

export const CharEdit = (props) => {
  const [initialized, setInitialized] = useState(false);
  const [anchor, setAnchor] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [revertConfirm, setRevertConfirm] = useState(false);
  const [charOrig, setCharOrig] = useState();
  const [character, setCharacter] = useState();
  const [test, setTest] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(['duneCharEdits']);
  // const [userList,setUserList] = useState([]);
  const updateCharacter = (field, value) => {
    let D = new Date().getTime();
    setTest('hello '+field+" "+JSON.stringify(value));
    console.log('data5', field, value);
    setCookie('duneCharEdits', { ...character, [field]: value, changeTime: D }, { maxAge: 100000000 });
    setCharacter(character => {
      return { ...character, [field]: value, changeTime: D };
    });

  };

  const fetchCharacter = async ({ queryKey }) => {
    const res = await fetch(`http://${host}:3001/fetchCharacter/` + queryKey[1]);
    let resp = await res.json();
    console.log('data1', resp);
    if (resp.status) {
      resp.data.data.id = resp.data.id;
      // console.log('data',resp,'>>',resp.data);
      setCharOrig(resp.data.data);
      let data;
      if (cookies.duneCharEdits?.id == resp.data.id) {
        setCharacter(cookies.duneCharEdits);
        data = cookies.duneCharEdits;
      }
      else {
        setCharacter(resp.data.data);
        data = resp.data.data;
      }
      setInitialized(true);
      if (typeof data['talents'] === 'string') {
        let talents = data['talents'];
        data['talents'] = [];
        talents.split(/[\r\n]+/).forEach(t => data['talents'].push({ name: t }));
        // resp.data.data['talents'] = ;
      }
      if(!data['assets'] && data['asset1']) {
        console.log('data2b')
        data['assets'] = [1,2,3].map(i => {
          let ret = { name: data['asset'+i], pot: data['pot'+i], quality: data['qual'+i]};
          return ret;
        })
      }
      let data2 = [];
      Object.keys(data).forEach(d => {
        // if(d === 'assets' || !d.startsWith('asset'))
        if(!d.match(/^(asset|qual|pot)\d/))
          data2[d] = data[d];
      })
      console.log('data2',  data2);
      return data2;
    }
  };

  const revertChanges = () => {
    setCharacter(charOrig);
  }

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

  // console.log('character', character, props.characterId);
  const userInfo = useQuery({ queryKey: ["character", props.characterId.id], queryFn: fetchCharacter });
  console.log('char', userInfo.isLoading, userInfo['data']);
  useEffect(() => { console.log('change!') }, [userInfo]);
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
  const isChanged = () => {
    let changed = false;
    if (character && charOrig) {
      return Object.keys(character).find(k => {

        // console.log('change!', character[k], charOrig[k], character[k] !== charOrig[k]);
        return k == 'changeTime' ? false : character[k] !== charOrig[k];
      }) ? true : false;
    }
    return changed;
    // Object.keys(character).forEach(k => {

    // })
  };

  const schema: REL.Schema = [
    { name: "name", type: "string" },
  ];

  // console.log(JSON.stringify(charOrig), JSON.stringify(character))
  return (
   <Fragment>
    <div className="App">
      <CharEditor updateHandler={updateCharacter} data={character} orig={charOrig}>
        <div style={{ position: 'absolute', left: '3%', top: 10 }}>
          <MyButton onClick={() => { props.setUser(''); props.setCharacterId(undefined); }} variant="contained">Switch User</MyButton>
          <MyButton onClick={() => { props.setCharacterId(undefined); }} variant="contained">Switch Char</MyButton>

          &nbsp;
          Character: {character?.name}
          &nbsp;
          User: {props.user.username || ''}
        </div>
        {isChanged() &&
          <div style={{ position: 'absolute', right: '3%', top: 10 }}>
            <MyButton onClick={(e) => { setAnchor(e.currentTarget); setRevertConfirm(true) }} variant="contained">Revert</MyButton>
            &nbsp;
            <MyButton onClick={(e) => { setAnchor(e.currentTarget); setSaveConfirm(true) }} variant="contained">Save</MyButton>
          </div>
        }
        <Popover anchorEl={anchor} open={revertConfirm} onClose={() => setRevertConfirm(false)}>
          <Typography sx={{ p: 2 }}>Clear all current changes?<p />
            <span style={{ float: 'right' }}><Button onClick={() => { revertChanges(); setRevertConfirm(false); }}>Yes</Button>
              <Button onClick={() => { setRevertConfirm(false); }}>No</Button></span>
          </Typography>
        </Popover>

        <Popover anchorEl={anchor} open={saveConfirm} onClose={() => setSaveConfirm(false)}>
          <Typography sx={{ p: 2 }}>Write character changes to database?<p />
            <span style={{ float: 'right' }}><Button onClick={() => { saveChanges(); setSaveConfirm(false); }}>Yes</Button>
              <Button onClick={() => { setSaveConfirm(false); }}>No</Button></span>
          </Typography>
        </Popover>

        <CharInput field='name' left={12} top={20.6} width={34} className="cleanInput clean small" />
        {/* <input placeholder="" onChange={(e) => updateCharacter('name', e.target.value)} value={character?.name || 'Fred'} left={12} top={20.4} width={34} className="small"/> */}
        <br />
        <CharInput field="house" left={12} top={24.4} width={34} className="small" />
        <br />
        <CharInput field="role" left={12} top={28.1} width={34} className="small" />
        <br />
        <CharInput field="faction" left={12} top={31.7} width={34} className="small" />
        <CharInput field="ambition" left={54.8} top={34.3} width={34} className="smallerer" />
        <br />
        <CharInput field="duty" left={25.5} top={43.2} width={2} className="large" />
        <br />
        <CharInput field="faith" left={25.5} top={47.6} width={2} className="large" />
        <br />
        <CharArea field='dutyStatement' left={30.2} top={42.5} height={3.6} width={25.5} className="duty" />
        <CharArea field='faithStatement' left={30.2} top={47.1} height={3.6} width={25.5} className="faith" />
        <CharArea field='justiceStatement' left={30.2} top={51.6} height={3.6} width={25.5} className="justice" />
        <CharArea field='powerStatement' left={30.2} top={56.2} height={3.6} width={25.5} className="power" />
        <CharArea field='truthStatement' left={30.2} top={60.7} height={3.6} width={25.5} className="truth" />

        <CharArea field='traits' left={54.8} top={23.2} height={8.8} width={34} className="traits" />
        {/* <CharArea field='talents' left={65.7} top={42.8} height={18.5} width={26} className="talents" />
       */}
        {/* <div style={{ position: 'absolute', left: '65.7%',top: '42.8%', height:'18.5%', width:'26%', border: 'solid 1px red'  }}>
<ReactEditList
        schema={schema}
        onLoad={() => [{name: 'a'},{name: 'b'}]}
        ref={ref}
        onUpdate={(item) => {
          // Call your API here
          console.log("UPDATE", item);
        }}
        onDelete={(item) => {
          // if (!confirm("Are you sure you want to delete it?")) return false;
          // Call your API here
          console.log("DELETE", item);
        }}
        onInsert={(item) => {
          // Call your API here
          console.log("INSERT", item);
        }}
        className="table table-dark table-rounded table-fixed align-middle"
        headClassName="table-light"
        inputClassName="w-100"
        thClassName={{
          // These allow to fix the column widths
          product: "col-4",
          type: "col-3",
          price: "col-2",
          stock: "col-2",
          buttons: "col-1",
        }}
        bodyClassName="sortable-items"
        btnValidateClassName="btn btn-success p-0 m-0"
        btnDeleteClassName="btn btn-danger py-0 px-1 m-0 mx-1"
        btnCancelClassName="btn btn-secondary py-0 px-1 m-0 mx-1"
        rowClassName="draggable"
        insertClassName="not-draggable"
        filler={<React.Fragment>&#8230;</React.Fragment>}
      /></div> */}
        <CharList field='talents' left={65.7} top={42.8} height={18.5} width={26}/>
        <br />
        <CharInput field="justice" left={25.5} top={52.2} width={2} className="large" />
        <br />
        <CharInput field="power" left={25.5} top={56.8} width={2} className="large" />
        <br />
        <CharInput field="truth" left={25.5} top={61.4} width={2} className="large" />
        <br />
        <br />
        <CharInput field="battle" left={25.5} top={72.8} width={2} className="large" />
        <br />
        <CharInput field="communicate" left={25.5} top={77.4} width={2} className="large" />
        <br />
        <CharInput field="discipline" left={25.5} top={81.9} width={2} className="large" />
        <br />
        <CharInput field="move" left={25.5} top={86.5} width={2} className="large" />
        <br />
        <CharInput field="understand" left={25.5} top={91} width={2} className="large" />
        <br />
        <CharArea field='focusBattle' left={30.2} top={72.5} height={3.6} width={25.5} className="battle" />
        <CharArea field='focusCommunicate' left={30.2} top={76.8} height={3.6} width={25.5} className="communicate" />
        <CharArea field='focusDiscipline' left={30.2} top={81.3} height={3.6} width={25.5} className="discipline" />
        <CharArea field='focusMove' left={30.2} top={85.9} height={3.6} width={25.5} className="move" />
        <CharArea field='focusUnderstand' left={30.2} top={90.5} height={3.6} width={25.5} className="understand" />
        <br />
        <AssetList field="assets" left={68.7} top={67.8} width={20} height={16}></AssetList>
        {/* <CharInput field="asset1" left={68.7} top={67.8} width={20} className="smaller" />
        <CharInput field="pot1" left={73} top={70} width={2} className="smallerer" />
        <CharInput field="qual1" left={80.5} top={70} width={2} className="smallerer" />
        <CharInput field="asset2" left={68.7} top={72.6} width={20} className="smaller" />
        <CharInput field="pot2" left={73} top={74.8} width={2} className="smallerer" />
        <CharInput field="qual2" left={80.5} top={74.8} width={2} className="smallerer" />
        <CharInput field="asset3" left={68.7} top={77.5} width={20} className="smaller" />
        <CharInput field="pot3" left={73} top={79.6} width={2} className="smallerer" />
        <CharInput field="qual3" left={80.5} top={79.6} width={2} className="smallerer" /> */}
        <CharInput field="advpoints" left={70} top={90.2} width={4} className="large advpoints" />
        <CharInput field="determination" left={84.3} top={90.2} width={2} className="large" />
      </CharEditor>
    </div>  
    <div className="Extra">
      <CharEditor updateHandler={updateCharacter} data={character} orig={charOrig}>
        
      

       <CharList extended={true} field='talents' left={6.2} top={11.4} width={54} height={40} className="" />
       <AssetList field="assets" extended left={68.7} top={8.2} width={20} height={50}></AssetList>
       <CharArea field="notes" left={5.5} top={62} height={32.7} width={54.1}/>
       </CharEditor>
     </div>

 </Fragment>
);
}

const ConfirmButton = ({icon, onConfirm, params}) => {
  const [show,setShow] = useState(false);
  const [anchor,setAnchor] = useState();
  
  
  return <Fragment>
    <Popover anchorEl={anchor} open={show} onClose={() => setShow(false)}>
          <Typography sx={{ p: 2 }}>Confirm?<p />
            <Button onClick={() => {  onConfirm(params); setShow(false); }}>Yes</Button>
              <Button onClick={() => { setShow(false); }}>No</Button>
          </Typography>
        </Popover>
    
      <IconButton onClick={(e) => { setAnchor(e.currentTarget); setShow(true) } }><Delete/></IconButton>
  </Fragment>
};

const CharList = ({ field, left, top, width, height, className, data, orig, updateHandler, extended = false }) => {

  const [anchor, setAnchor] = useState();
  const [showInfo, setShowInfo] = useState(undefined);

  console.log('data3', extended, data, field, data?.[field]);
  let i = -1;


  return <div style={{ overflowY: 'auto', left: left + '%', top: top + '%', width: width + '%', height: height + '%' }} className={"cleanArea sortable-items-" + field + " " + className}>
    {Array.isArray(data?.[field]) &&
    <React.Fragment>
      <Popover anchorEl={anchor} open={showInfo != undefined} style={{ maxWidth: '90%'}} onClose={() => setShowInfo(undefined)}>
        <Typography sx={{ p: 2 }}>{showInfo?.description}</Typography>
      </Popover>
      <ReactSortable list={data[field]} setList={(d) => updateHandler(field, d)} handle=".dragHandle" onStart={(e,a) => console.log('start',e,a)}>
      
        {
          data[field].map((item) => {
            i++;
            let changed = data[field][i]['name'] != orig[field]?.[i]?.['name'] ? 'changed' : '';
            let changedDesc = data[field][i]['description'] != orig[field]?.[i]?.['description'] ? 'changed' : '';
            return <div id={i} key={i} className={className}>
              <div className="smallerer" style={{ display: 'flex', alignItems: 'center' }}>
                {extended && <IconButton className="dragHandle sortIcons"><DragHandle/></IconButton> }
                <input 
                  style={{ flexGrow: '0', fontWeight: 'bold', minHeight: 0, width: '90%' }} 
                  className={"clean  " + changed} 
                  autoFocus={item.name.length === 1}
                  value={item.name} onChange={(e) => {
                    console.log('data7',field,e.target.parentNode.id,e.target.parentNode.parentNode.id)
                    data[field][e.target.parentNode.parentNode.id]['name'] = e.target.value;
                    updateHandler(field, data[field])
                  }}/>
              {extended ?
                    <ConfirmButton params={i} onConfirm={(idx) => {
                      data[field].splice(idx,1);
                      updateHandler(field, data[field]);
                    }}/>
                :
                  // <span style={{ border: 'solid 1px green', flex: 'none' }}>
                  <IconButton className="sortIcons" onClick={(e) => { setAnchor(e.currentTarget); setShowInfo(item); } }><Info/></IconButton>
                  // </span>
              }
              </div>
              {extended && (
                <div style={{ paddingLeft: '3%', width: '97%' }}>
                <ContentEditable 
                  
                  className={"cetext clean " + changedDesc}
                  html={item?.description || ''} // innerHTML of the editable div
                  disabled={false}       // use true to disable editing
                  onChange={(e) => {
                    console.log('data5', e.currentTarget.parentNode.parentNode)
                    data[field][e.currentTarget.parentNode.parentNode.id]['description'] = e.target.value;
                    updateHandler(field, data[field]);
                  }}
                />
                </div>
                // <React.Fragment><br/><span class="textarea" role="textbox" contenteditable={true}
                // style={{ marginLeft: '3%', width: '97%'}}
                // className={"clean "+changedDesc} >{item?.description}</span></React.Fragment>
              )}
            </div>
          })}
      
      </ReactSortable>
      {extended &&
      <div><input style={{ width: "10%"}} placeholder='...' value="" onChange={e => {
        data[field].push({name: e.target.value});
        console.log('data2c',data);

        updateHandler(field, data[field]);
      }}></input></div> }
      </React.Fragment>
    }
  </div>
}

const AssetList = ({ field, left, top, width, height, className, data, orig, updateHandler, extended = false }) => {

  const [anchor, setAnchor] = useState();
  const [showInfo, setShowInfo] = useState(undefined);

  console.log('data3', extended, data, field, data?.[field]);
  let i = -1;


  return <div style={{ display: 'flex', flexFlow: 'column wrap', overflowY: 'auto', left: left + '%', top: top + '%', width: width + '%', height: height + '%' }} className={"cleanArea sortable-items-" + field + " " + className}>
    {Array.isArray(data?.[field]) &&
    <React.Fragment>
      <Popover anchorEl={anchor} open={showInfo != undefined} style={{ maxWidth: '90%'}} onClose={() => setShowInfo(undefined)}>
        <Typography sx={{ p: 2 }}>{showInfo?.description}</Typography>
      </Popover>
      <ReactSortable list={data[field]} setList={(d) => updateHandler(field, d)} className="sortableDiv" handle=".dragHandle" onStart={(e,a) => console.log('start',e,a)}>
      
        {
          data[field].map((item) => {
            i++;
            let changed = data[field][i]['name'] != orig[field]?.[i]?.['name'] ? 'changed' : '';
            let changedDesc = data[field][i]['description'] != orig[field]?.[i]?.['description'] ? 'changed' : '';
            return <div style={{ position: 'relative', flex: '1 1 30px' }} id={i} key={i} className={className}>
              <div className="smallerer" style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  style={{ flexGrow: '0', fontWeight: 'bold', minHeight: 0, width: '90%' }} 
                  className={"clean  " + changed} 
                  autoFocus={item.name.length === 1}
                  value={item.name} onChange={(e) => {
                    console.log('data7',field,e.target.parentNode.id,e.target.parentNode.parentNode.id)
                    data[field][e.target.parentNode.parentNode.id]['name'] = e.target.value;
                    updateHandler(field, data[field])
                  }}/>
                  
              {extended ?
                    <ConfirmButton params={i} onConfirm={(idx) => {
                      data[field].splice(idx,1);
                      updateHandler(field, data[field]);
                    }}/>
                :
                ''
                  // <span style={{ border: 'solid 1px green', flex: 'none' }}>
                  // <IconButton className="sortIcons" onClick={(e) => { setAnchor(e.currentTarget); setShowInfo(item); } }><Info/></IconButton>
                  // </span>
              }
              </div>
                
              <div style={{ textAlign: 'right', fontSize: '1.5cqw'}}>
                {extended && <IconButton style={{ float: 'left' }} className="dragHandle sortIcons"><DragHandle/></IconButton> }
               Pot: <input className="clean" style={{width: '12%'}} value={item.pot}/> Qual: <input className="clean"  style={{width: '12%'}}value={item.quality}/><br clear="all"/></div>
              {extended == 2 && (
                <div style={{ paddingLeft: '3%', width: '97%' }}>
                <ContentEditable 
                  
                  className={"cetext clean " + changedDesc}
                  html={item?.description || ''} // innerHTML of the editable div
                  disabled={false}       // use true to disable editing
                  onChange={(e) => {
                    console.log('data5', e.currentTarget.parentNode.parentNode)
                    data[field][e.currentTarget.parentNode.parentNode.id]['description'] = e.target.value;
                    updateHandler(field, data[field]);
                  }}
                />
                </div>
                // <React.Fragment><br/><span class="textarea" role="textbox" contenteditable={true}
                // style={{ marginLeft: '3%', width: '97%'}}
                // className={"clean "+changedDesc} >{item?.description}</span></React.Fragment>
              )}
            </div>
          })}
      
      </ReactSortable>
          { extended &&
      <div><input style={{ width: "90%"}} placeholder='...' value='' onChange={e => {
        data[field].push({name: e.target.value});
        console.log('data2c',data);
        updateHandler(field, data[field]);
      }}></input></div> }
      </React.Fragment>
    }
  </div>
}
