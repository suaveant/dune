const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
var bodyParser = require('body-parser');
const port = 3001;
const { Level } = require('level');
const db = new Level('./db', { valueEncoding: 'json' });

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

app.post('/update', (req, res) => {
  // console.log(req);
  console.log('req',req.rawBody);
  console.log('req',req.params);
  console.log('req',req.body.name);
  res.send('Update World!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})