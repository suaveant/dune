import express from 'express';
const app = express();
import cors from 'cors';
import { v4 as uuid } from 'uuid';
app.use(cors());
import bodyParser from "body-parser";
const port = 3001;
console.log(uuid());

import Pkg from 'pg';
const { Client } = Pkg;

const client = new Client({
  user: 'dune',
  host: 'localhost',
  database: 'dune',
  password: 'duneBuddy1#',
  port: 5432,
});

await client.connect();

console.log(await client.query('SELECT NOW()'));

app.use(bodyParser.json({ }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  let D = new Date;

  let value;
  try {
    // value = await db.get('date');
    // console.log(value);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
  }
  res.send('Hello World! '+value.date);
  //if(!value)
    await db.put('date',{ date: D.toLocaleString(), test: 1 });

})

app.get('/userList', async (req, res) => {
  try {
    const qry = await client.query("SELECT * FROM users");
    res.send({status: true, data: qry.rows});
    // const user = await userdb.get(req.params.user);
  } catch(err) { console.log('ERR',err); res.send({ status: false })}
});

app.get('/characterList/:user', async (req, res) => {
  try {
    const qry = await client.query("SELECT id,character_name FROM characters WHERE userid = $1",[req.params.user]);
    console.log(qry.rows);
    res.send({status: true, data: qry.rows});
    // const user = await userdb.get(req.params.user);
  } catch(err) { console.log('ERR',err); res.send({ status: false })}
});

app.get('/fetchCharacter/:characterId', async (req, res) => {
  console.log('characterId',req.params.characterId);
  try {
    console.log('test');
    const qry = await client.query("SELECT * FROM characters WHERE id = $1",[req.params.characterId]);
    console.log(qry.rows);
    res.send({status: true, data: qry.rows[0]});
    // const userInfo = await db.get(req.params.characterId);
  } catch (err) {
    console.log(err.code) // 'LEVEL_ITERATOR_BUSY'
    res.send('ERROR');
  }
});

app.get('/createUser/:user', async (req, res) => {
  console.log('new user',req.params);
  try {
    const qry = await client.query("INSERT INTO users(username) VALUES($1)", [req.params.user]);
    console.log("RES",qry)
    // const user = await userdb.get(req.params.user);
    return res.send('already exists');
  } catch(err) { console.log('ERR',err)}

  // console.log(await userdb.put(req.params.user,{}));
  res.send('user created');
});

app.get('/createCharacter/:character/user/:user', async (req, res) => {
  console.log('new character',req.params);
  try {
    let charId = uuid();
    const qry = await client.query("INSERT INTO characters(userid, character_name, data) VALUES($1,$2,$3)", 
      [req.params.user, req.params.character,{ user: req.params.user, name: req.params.character }]);
    console.log("RES",qry)
    // const user = await userdb.get(req.params.user);
    return res.send('already exists');
  } catch(err) { console.log('ERR',err)}

  // console.log(await userdb.put(req.params.user,{}));
res.send('character created');

  // console.log('new character',req.params);
  // try {
  //   // const character = await db.get(req.params.character);
  //   return res.send('already exists');
  // } catch {}
  // let charId = uuid();
  // // await db.put(charId,{ user: req.params.user, name: character, characterId: charId });
  // // const user = await userdb.get(req.params.user);
  // user[req.params.character] = charId;
  // // await userdb.put(req.params.user,user);
  // console.log('char!',charId,user);
  
});


app.post('/update', async (req, res) => {
   console.log('Update',req.body);
   try {
   if(req.body['id']) {
    const qry = await client.query("update characters set character_name = $1, data = $2 where id = $3", 
      [req.body.name, req.body, req.body.id]);
    console.log("RES",qry)
    // const user = await userdb.get(req.params.user);
    return res.send('updated');
    //  db.put(req.body['characterId'], req.body);
   }
  } catch(err) { console.log('ERR',err)}
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})