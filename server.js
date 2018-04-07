const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const{PORT,DATABASE_URL} = require('./config');
const{blogApp} = require('./models');

const app = express();
app.use(bodyParser.json()) ;

app.get('/posts',(req,res)=>{
  blogApp.find().then(posts=>{
    console.log(posts);
    res.json({posts: posts.map(post=>post.serialize())});
  }).catch(err=>{
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'});
  });
});

//get by ID
app.get('/posts/:id',(req,res)=>{
  blogApp.findById(req.params.id).then(post=>res.json(post.serialize())).catch(err=>{
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'});
  });
});

//post method

app.post('/posts',(req,res)=>{
  const reqFields = ['title','content','author'];
  for(let i=0;i<reqFields.length;i++){
    const field = reqFields[i];
    if(!(field in req.body)){
      const message = `required field ${field} is missing`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
})

blogApp
  .create({
    title: req.body.name,
    content: req.body.borough,
    author: req.body.cuisine,
  })
  .then(post => res.status(201).json(restaurant.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });
});


app.put('/posts/:id', (req, res) => {
// ensure that the id in the request path and the one in request body match
if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
  const message = (
    `Request path id (${req.params.id}) and request body id ` +
    `(${req.body.id}) must match`);
  console.error(message);
  return res.status(400).json({ message: message });
}

// we only support a subset of fields being updateable.
// if the user sent over any of the updatableFields, we udpate those values
// in document
const toUpdate = {};
const updateableFields = ['title', 'content', 'author'];

updateableFields.forEach(field => {
  if (field in req.body) {
    toUpdate[field] = req.body[field];
  }
});

blogApp
  // all key/value pairs in toUpdate will be updated -- that's what `$set` does
  .findByIdAndUpdate(req.params.id, { $set: toUpdate })
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/restaurants/:id', (req, res) => {
blogApp
  .findByIdAndRemove(req.params.id)
  .then(post => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
res.status(404).json({ message: 'Not Found' });
});


// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
   console.log(databaseUrl);
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
