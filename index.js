// try to fix code
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path');

const app = express();
// populates log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

let fantasticFilms = [
  {
    Title: 'A Few Good Men',
    Director: 'Rob Reiner'
  },
  {
    Title: 'Lucky Number Slevin',
    Director: 'Andrew Hulme'
  },
  {
    Title: 'Blazing Saddles',
    Director: 'Mel Brooks'
  },
  {
    Title: 'The Usual Suspects',
    Director: 'Bryan Singer'
  },
  {
    Title: 'The Godfather',
    Director: 'Francis Ford Coppola'
  },
  {
    Title: 'Die Hard',
    Director: 'John McTiernan'
  },
  {
    Title: 'Léon: The Professional',
    Director: 'Luc Besson'
  },
  {
    Title: 'Operation Finale',
    Director: 'Chris Weitz'
  },
  {
    Title: 'The Punisher (1989 film)',
    Director: 'Mark Goldblatt'
  },
  {
    Title: 'Scarface',
    Director: 'Brian De Palma'
  }

];

// GET requests
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(fantasticFilms);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Uh Oh Something Isnt Right!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});