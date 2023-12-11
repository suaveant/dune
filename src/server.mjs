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

app.use('/', express.static('./'))


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
    const qry = await client.query("INSERT INTO users(username) VALUES($1) RETURNING userid", [req.params.user]);
    console.log("RES",qry)
    // const user = await userdb.get(req.params.user);
    res.send({ status: true, data: { username: req.params.user, userid: qry.rows[0].userid }});
  } catch(err) { 
    console.log('ERR',err);
    res.send({ status: false, error: err });
  }

  // console.log(await userdb.put(req.params.user,{}));
  
});

app.get('/createCharacter/:character/user/:user', async (req, res) => {
  console.log('new character',req.params);
  try {
    let charId = uuid();
    const qry = await client.query("INSERT INTO characters(userid, character_name, data) VALUES($1,$2,$3) RETURNING id", 
      [req.params.user, req.params.character,{ user: req.params.user, name: req.params.character }]);
    console.log("RES",qry);
    res.send({ status: true, data: { name: req.params.character, id: qry.rows[0].id }});
    // const user = await userdb.get(req.params.user);
  } catch(err) { 
    console.log('ERR',err);
    return res.send({ status: false, error: err });
  }
  
});


app.post('/update', async (req, res) => {
   console.log('Update',req.body);
   try {
   if(req.body['id']) {
    const qry = await client.query("update characters set character_name = $1, data = $2 where id = $3", 
      [req.body.name, req.body, req.body.id]);
    console.log("RES",qry)
    client.query('insert into character_history(id,userid,character_name,data,time_stamp) SELECT id,userid,character_name,data,current_timestamp FROM characters WHERE id = $1',[req.body.id]);
    // const user = await userdb.get(req.params.user);
    return res.send('updated');
    //  db.put(req.body['characterId'], req.body);
   }
  } catch(err) { console.log('ERR',err)}
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})