const express = require('express');
const app = express();
const cors = require('cors');
const uuid = require('uuid');
app.use(cors());
var bodyParser = require('body-parser');
const port = 3001;
const { Level } = require('level');
const db = new Level('./db', { valueEncoding: 'json' });
const userdb = new Level('./userdb', { valueEncoding: 'json' });
console.log(uuid.v4());
var rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

app.use(bodyParser.json({ }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  let D = new Date;

  let value;
  try {
    value = await db.get('date');
    console.log(value);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
  }
  res.send('Hello World! '+value.date);
  //if(!value)
    await db.put('date',{ date: D.toLocaleString(), test: 1 });

})

app.get('/userList', async (req, res) => {
  try {
    const keys = await userdb.keys({ }).all();
    console.log('keys',keys);
    res.send(keys);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
    res.send('ERROR');
  }
});

app.get('/characterList/:user', async (req, res) => {
  console.log('user',req.params.user);
  try {
    const userInfo = await userdb.get(req.params.user);
    console.log('keys',userInfo);
    res.send(userInfo);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
    res.send('ERROR');
  }
});

app.get('/fetchCharacter/:characterId', async (req, res) => {
  console.log('characterId',req.params.characterId);
  try {
    console.log('test');
    const userInfo = await db.get(req.params.characterId);
    console.log('keys',userInfo);
    res.send(userInfo);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
    res.send('ERROR');
  }
});

app.get('/createUser/:user', async (req, res) => {
  console.log('new user',req.params);
  try {
    const user = await userdb.get(req.params.user);
    return res.send('already exists');
  } catch {}
  
  console.log(await userdb.put(req.params.user,{}));
  res.send('user created');
});

app.get('/createCharacter/:character/user/:user', async (req, res) => {
  console.log('new character',req.params);
  try {
    const character = await db.get(req.params.character);
    return res.send('already exists');
  } catch {}
  let charId = uuid.v4();
  await db.put(charId,{ user: req.params.user, name: character, characterId: charId });
  const user = await userdb.get(req.params.user);
  user[req.params.character] = charId;
  await userdb.put(req.params.user,user);
  console.log('char!',charId,user);
  res.send('character created');
});


app.post('/update', (req, res) => {
   console.log('Update',req.body);
   if(req.body['characterId']) {
     db.put(req.body['characterId'], req.body);
   }
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})