import React, { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Popover } from '@mui/material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useCookies } from 'react-cookie';
import { MyButton } from '../MyButton';
import { ReactSortable } from "react-sortablejs";
import ContentEditable from 'react-contenteditable'
import Info from '@mui/icons-material/Info';
import DragHandle from '@mui/icons-material/DragHandle';
import { Delete } from '@mui/icons-material';
import update from 'immutability-helper';
import { ConfirmButton } from './ConfirmButton';

let host = window.location.hostname;

const CharEditor = ({ children, updateHandler, data, orig }) => {
  const renderChildren = () => {
    return React.Children.map(children, (child) => {

      if (child && (child?.props?.field)) {
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
    value={data?.[field] || ''}
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
      className={className + " cleanInput clean"} /></span>);
}

export const CharEdit = (props) => {
  const [initialized, setInitialized] = useState(false);
  const [charOrig, setCharOrig] = useState();
  const [character, setCharacter] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(['duneCharEdits']);
  
  const updateCharacter = (field, value) => {
    let D = new Date().getTime();

    setCookie('duneCharEdits', { ...character, [field]: value, changeTime: D }, { maxAge: 100000000 });
    setCharacter(character => {
      return { ...character, [field]: value, changeTime: D };
    });

  };

  const fetchCharacter = async ({ queryKey }) => {
    const res = await fetch(`http://${host}:3001/fetchCharacter/` + queryKey[1]);
    let resp = await res.json();
    if (resp.status) {
      resp.data.data.id = resp.data.id;
      setCharOrig(resp.data.data);
      let data;
      if (cookies.duneCharEdits?.id === resp.data.id) {
        // setCharacter(cookies.duneCharEdits);
        data = cookies.duneCharEdits;
      }
      else {
        // setCharacter(resp.data.data);
        data = resp.data.data;
      }
      setInitialized(true);
      if (typeof data['talents'] === 'string') {
        let talents = data['talents'];
        data['talents'] = [];
        talents.split(/[\r\n]+/).forEach(t => data['talents'].push({ name: t }));
      }
      if (!data['assets'] && data['asset1']) {
        data['assets'] = [1, 2, 3].map(i => {
          let ret = { name: data['asset' + i], pot: data['pot' + i], quality: data['qual' + i] };
          return ret;
        })
      }
      let data2 = [];
      Object.keys(data).forEach(d => {
        if (!d.match(/^(asset|qual|pot)\d/))
          data2[d] = data[d];
      });
      console.log('data',data2);
      setCharacter(data2);
      return data2;
    }
  };
 console.log('assets',character?.assets);
  const revertChanges = () => {
    let D = new Date().getTime();
    // character.assets = [...character.assets];
    // character.assets[2] = {...character.assets[2], pot: 6};
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
      removeCookie('duneCharEdits');
      setCharOrig(character);
    }
  };

  const charInfo = useQuery({ queryKey: ["character", props.characterId.id], queryFn: fetchCharacter });
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

  if(charInfo.isLoading) {
    return <div>Loading...</div>;
  }

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
              <ConfirmButton tag="MyButton" onConfirm={() => { console.log('revert');revertChanges() }}>Revert</ConfirmButton>
              &nbsp;
              <ConfirmButton tag="MyButton" onConfirm={() => { console.log('save');saveChanges() }}>Save</ConfirmButton>
            </div>
          }
          <CharInput field='name' left={12} top={20.6} width={34} className="cleanInput clean small" />
          <CharInput field="house" left={12} top={24.4} width={34} className="small" />
          <CharInput field="role" left={12} top={28.1} width={34} className="small" />
          <CharInput field="faction" left={12} top={31.7} width={34} className="small" />
          <CharInput field="ambition" left={54.8} top={34.3} width={34} className="smallerer" />
          <CharInput field="duty" left={25.5} top={43.2} width={2} className="large" />
          <CharInput field="faith" left={25.5} top={47.6} width={2} className="large" />
          <CharArea field='dutyStatement' left={30.2} top={42.5} height={3.6} width={25.5} className="duty" />
          <CharArea field='faithStatement' left={30.2} top={47.1} height={3.6} width={25.5} className="faith" />
          <CharArea field='justiceStatement' left={30.2} top={51.6} height={3.6} width={25.5} className="justice" />
          <CharArea field='powerStatement' left={30.2} top={56.2} height={3.6} width={25.5} className="power" />
          <CharArea field='truthStatement' left={30.2} top={60.7} height={3.6} width={25.5} className="truth" />
          <CharArea field='traits' left={54.8} top={23.2} height={8.8} width={34} className="traits smallerer" />
          <CharList field='talents' left={65.7} top={42.8} height={18.5} width={26} />
          <CharInput field="justice" left={25.5} top={52.2} width={2} className="large" />
          <CharInput field="power" left={25.5} top={56.8} width={2} className="large" />
          <CharInput field="truth" left={25.5} top={61.4} width={2} className="large" />
          <CharInput field="battle" left={25.5} top={72.8} width={2} className="large" />
          <CharInput field="communicate" left={25.5} top={77.4} width={2} className="large" />
          <CharInput field="discipline" left={25.5} top={81.9} width={2} className="large" />
          <CharInput field="move" left={25.5} top={86.5} width={2} className="large" />
          <CharInput field="understand" left={25.5} top={91} width={2} className="large" />
          <CharArea field='focusBattle' left={30.2} top={72.5} height={3.6} width={25.5} className="battle" />
          <CharArea field='focusCommunicate' left={30.2} top={76.8} height={3.6} width={25.5} className="communicate" />
          <CharArea field='focusDiscipline' left={30.2} top={81.3} height={3.6} width={25.5} className="discipline" />
          <CharArea field='focusMove' left={30.2} top={85.9} height={3.6} width={25.5} className="move" />
          <CharArea field='focusUnderstand' left={30.2} top={90.5} height={3.6} width={25.5} className="understand" />
          <AssetList field="assets" left={68.7} top={67.8} width={20} height={16}></AssetList>
          <CharInput field="advpoints" left={70} top={90.2} width={4} className="large advpoints" />
          <CharInput field="determination" left={84.3} top={90.2} width={2} className="large" />
        </CharEditor>
      </div>
      <div className="Extra">
        <CharEditor updateHandler={updateCharacter} data={character} orig={charOrig}>



          <CharList extended={true} field='talents' left={6.2} top={11.4} width={54} height={40} className="" />
          <AssetList field="assets" extended left={68.7} top={8.2} width={20} height={50}></AssetList>
          <CharArea field="notes" left={5.5} top={62} height={32.7} width={54.1} />
        </CharEditor>
      </div>

    </Fragment>
  );
}



const CharList = ({ field, left, top, width, height, className, data, orig, updateHandler, extended = false }) => {

  const [anchor, setAnchor] = useState();
  const [showInfo, setShowInfo] = useState(undefined);

  let i = -1;


  return <div style={{ overflowY: 'auto', left: left + '%', top: top + '%', width: width + '%', height: height + '%' }} className={"cleanArea sortable-items-" + field + " " + className}>
    {Array.isArray(data?.[field]) &&
      <React.Fragment>
        <Popover disableAutoFocus={true} anchorEl={anchor} open={showInfo !== undefined} style={{ maxWidth: '90%' }} onClose={() => setShowInfo(undefined)}>
          <Box className="modalBox">
            <Typography sx={{ p: 2 }}>{showInfo?.description}</Typography>
          </Box>
        </Popover>
        <ReactSortable list={data[field]} setList={(d) => updateHandler(field, d)} handle=".dragHandle">

          {
            data[field].map((item) => {
              i++;
              let changed = data[field][i]['name'] !== orig[field]?.[i]?.['name'] ? 'changed' : '';
              let changedDesc = data[field][i]['description'] !== orig[field]?.[i]?.['description'] ? 'changed' : '';
              return <div id={i} key={i} className={className}>
                <div className="smallerer" style={{ display: 'flex', alignItems: 'center' }}>
                  {extended && <IconButton className="dragHandle sortIcons"><DragHandle /></IconButton>}
                  <input
                    style={{ flexGrow: '0', fontWeight: 'bold', minHeight: 0, width: '90%' }}
                    className={"clean  " + changed}
                    autoFocus={item.name.length === 1}
                    value={item.name} onChange={(e) => {
                      data[field][e.target.parentNode.parentNode.id]['name'] = e.target.value;
                      updateHandler(field, data[field])
                    }} />
                  {extended ?
                    <ConfirmButton params={i} onConfirm={(idx) => {
                      data[field].splice(idx, 1);
                      updateHandler(field, data[field]);
                    }}><Delete /></ConfirmButton>
                    :
                    // <span style={{ border: 'solid 1px green', flex: 'none' }}>
                    <IconButton className="sortIcons" onClick={(e) => { setAnchor(e.currentTarget); setShowInfo(item); }}><Info /></IconButton>
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
                        data[field][e.currentTarget.parentNode.parentNode.id]['description'] = e.target.value;
                        updateHandler(field, data[field]);
                      }}
                    />
                  </div>
                  // <React.Fragment><span class="textarea" role="textbox" contenteditable={true}
                  // style={{ marginLeft: '3%', width: '97%'}}
                  // className={"clean "+changedDesc} >{item?.description}</span></React.Fragment>
                )}
              </div>
            })}

        </ReactSortable>
        {extended &&
          <div><input style={{ width: "10%" }} placeholder='...' value="" onChange={e => {
            data[field].push({ name: e.target.value });

            updateHandler(field, data[field]);
          }}></input></div>}
      </React.Fragment>
    }
  </div>
}

const AssetItem = ({idx, item, orig, className, extended, onUpdate}) => {
    return <div style={{ position: 'relative', flex: '1 1 30px' }} id={idx} key={idx} className={className}>
      <div className="smallerer" style={{ display: 'flex', alignItems: 'center' }}>
        <input
          style={{ flexGrow: '0', fontWeight: 'bold', minHeight: 0, width: '90%' }}
          className={"clean"+(item.name === orig?.name ? '' : ' changed')}
          autoFocus={item.name.length === 1}
          value={item.name} onChange={(e) => {
            onUpdate(idx, 'name', e.target.value);
            
          }} />

        {extended ?
          <ConfirmButton params={idx} onConfirm={(idx) => {
              onUpdate(idx, 'delete', null);
            
          }}><Delete/></ConfirmButton>
          : ''
        }
      </div>

      <div style={{ textAlign: 'right', fontSize: '1.5cqw' }}>
        {extended && <IconButton style={{ float: 'left' }} className="dragHandle sortIcons"><DragHandle /></IconButton>}
        Pot: 
          <input className={"clean"+(item.pot === orig?.pot ? '' : ' changed')} style={{ width: '12%' }} value={item.pot || ''} onChange={(e) => {
            onUpdate(idx, 'pot', e.target.value);
          }}/> 
        Qual: 
          <input className={"clean"+(item.quality === orig?.quality ? '' : ' changed')} style={{ width: '12%' }} value={item.quality || ''} onChange={(e) => {
            onUpdate(idx, 'quality', e.target.value);
          }} /><br clear="all" /></div>
    </div>
    ;
};

const AssetList = ({ field, left, top, width, height, className, data, orig, updateHandler, extended = false }) => {
  let i = -1;

  return <div style={{ display: 'flex', flexFlow: 'column wrap', overflowY: 'auto', left: left + '%', top: top + '%', width: width + '%', height: height + '%' }} className={"cleanArea sortable-items-" + field + " " + className}>
    {Array.isArray(data?.[field]) &&
      <React.Fragment>
        <ReactSortable list={data[field]} setList={(d) => updateHandler(field, d)} className="sortableDiv" handle=".dragHandle">

          {
            data[field].map((item) => {
              i++;
              return <AssetItem key={i} idx={i} item={item} orig={orig[field]?.[i]} className={className} extended={extended} onUpdate={(idx,f,v) => {
                if(f === 'delete') {
                 // data[field].splice(idx,i);
                  data = update(data, { [field]: { $splice: [[idx, 1]]} });
                } 
                else {
                  data = update(data, { [field]: { [idx]: { [f]: { $set: v }}}});
                
                }
                updateHandler(field, data[field]);
              }}/>
  })
}

        </ReactSortable>
        {extended &&
          <div><input style={{ width: "90%" }} placeholder='...' value='' onChange={e => {
            data[field].push({ name: e.target.value });
            updateHandler(field, data[field]);
          }}></input></div>}
      </React.Fragment>
    }
  </div>
}
