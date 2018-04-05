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
    res.json({posts: posts.map(post=>post.serialize())});
  }).catch(err=>{
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'});
  });
});

//get by ID
app.get('/posts/:id',(req,res)=>{
  blogApp.findById(req.params.id).then(post=>post.serialize()).catch(err=>{
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


// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

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
