// try to fix code
const express = require('express')
// new code
const { json } = require("body-parser");
bodyParser = require("body-parser"),
uuid = require("uuid");
//end new code
const { title, emitWarning } = require("process");
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'); 

//const app = express();// note to self look into  why i got error 
// populates log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

//New code

const app = express();

app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: "Dan",
        favoriteMovies: [],
    },
    {
        id: 2,
        name: "Sara",
        favoriteMovies: ["The End", "duh start"],
    },
];


let movies = [
    {
        Title: "The End",
        Description: "lol",
        Imgurl :"bsimgurl.com",
        Genre: {
            Name: "Comedy",
            Description: "Comedies make people laugh",
        },
        Director: {
            Name: "Ployni Almoni",
            Bio: "Bio is the same as all other humans",
            Born: "1985",
        },
    },

    {
        Title: "The beginning",
        Description: "amazing sight",
        Imgurl :"bsimgurl.com",
        Genre: {
            Name: "Drama",
            Description: "Can bring one to tears"
        },
        Director: {
            Name: "Almoni Ployni",
            Bio: "Bio is the same as all other humans 1",
            Born: 1650,
        },
    },
];
//get users

app.get("/users", (req, res) => {
    res.status(201).json(users)
    
 });

// CREATE new user not working as of now
app.post("/users", (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send("user is missing a name")
    }
    
 });

 app.delete("/users/:id", (req, res) => {
    res.status(200).send(`user Has been removed`);
   
    
 });



//UPDATE/PUT update exsisting user info 
app.put ("/users/:id", (req, res) =>{
    const id  = req.params.id;
    const updatedUser = req.body;

    let user = users.find (user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status (200).json(user);
    } else {
        res.status(400).send("User not found")
    }
});

//UPDATE/postadd/update users favorite movie and put out a message
app.post ("/users/:id/:movieTitle", (req, res) =>{
    const { id,  movieTitle } = req.params;
    const updatedUser = req.body;

    let user = users.find (user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} Has been added to user ${id}'s array`);
    } else {
        res.status(400).send("User not found")
    }
});

app.delete ("/users/:id/:movieTitle", (req, res) =>{
    const { id,  movieTitle } = req.params;
    const updatedUser = req.body;
    res.status(200).send(`${movieTitle} Has been removed for user ${id}'s array`);

});



//READ full movie list
app.get("/movies", (req, res) => {
    res.status(200).json(movies);
});

//READ  movie movie based on title
app.get("/movies/:title", (req, res) => {
    const title = req.params.title;
    const movie = movies.find((movie) => movie.Title == title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("movie not found");
    }
});

//READ  Find moives based on Genre
app.get("/movies/genre/:genreName", (req, res) => {
    const genreName = req.params.genreName;
    const foundMovies = movies.find(movie => movie.Genre.Name.toLowerCase() == genreName.toLowerCase());

    if (foundMovies) {
        res.status(200).json(foundMovies);
    } else {
        res.status(400).send("genre not found");
    }
});

//READ  Find based on director name
app.get("/movies/director/:directorName", (req, res) => {
    const directorName = req.params.directorName;
    const foundMovies = movies.find((movie) => movie.Director.Name == directorName);

    if (foundMovies) {
        res.status(200).json(foundMovies);
    } else {
        res.status(400).send("director not found");
    }
});


//port 808 listen
app.listen(8080, () => {
    console.log("Your app is listening on port 8080");
});



//old code
// let fantasticFilms = [
//   {
//     Title: 'A Few Good Men',
//     Director: 'Rob Reiner'
//   },
//   {
//     Title: 'Lucky Number Slevin',
//     Director: 'Andrew Hulme'
//   },
//   {
//     Title: 'Blazing Saddles',
//     Director: 'Mel Brooks'
//   },
//   {
//     Title: 'The Usual Suspects',
//     Director: 'Bryan Singer'
//   },
//   {
//     Title: 'The Godfather',
//     Director: 'Francis Ford Coppola'
//   },
//   {
//     Title: 'Die Hard',
//     Director: 'John McTiernan'
//   },
//   {
//     Title: 'Léon: The Professional',
//     Director: 'Luc Besson'
//   },
//   {
//     Title: 'Operation Finale',
//     Director: 'Chris Weitz'
//   },
//   {
//     Title: 'The Punisher (1989 film)',
//     Director: 'Mark Goldblatt'
//   },
//   {
//     Title: 'Scarface',
//     Director: 'Brian De Palma'
//   }

// ];

// // GET requests
// app.get('/documentation', (req, res) => {                  
//   res.sendFile('public/documentation.html', { root: __dirname });
// });

// app.get('/movies', (req, res) => {
//   res.json(fantasticFilms);
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Uh Oh Something Isnt Right!');
// });

// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });