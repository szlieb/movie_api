const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const models = require("./models.js");
mongoose.connect("mongodb://127.0.0.1:27017/myFlixDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
const { title, emitWarning } = require("process");
(morgan = require("morgan")), (fs = require("fs")), (path = require("path"));

//const app = express();// note to self look into  why i got error
// populates log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
    flags: "a",
});
const app = express();

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const movies = models.Movie;
const users = models.User;
const genre = models.Genre;
const director = models.Director;


// //create user
app.post("/users", (req, res) => {
    users.findOne({ Username: req.body.Username })
        .then((user) => {
            console.log(user);
            if (user) {
                return res
                    .status(400)
                    .send(req.body.Username + "already exists");
            } else {
                users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                })
                .then((user) => {
                    res.status(201).json(user);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send("Error: " + error);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
        });
});

// //get users
app.get("/users", (req, res) => {
    users.find().then((users) => {
        res.status(201).json(users);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
    });

})


// //UPDATE/PUT update exsisting user info
app.put("/users/:Username", (req, res) => {
    const { Username } = req.params;
    const filter = { Username: Username };
    const update = {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
    };
    const options = {new: true};
    users.findOneAndUpdate(filter, update, options)
        .then((updatedUser) => {
            res.json(updatedUser);
        }).catch((error) => {
            console.log("err = " + error);
            res.status(500).send('Error: ' + error);
        });
});


// Delete users favorite movie
app.delete("/users/:userName", (req, res) => {
    const { userName } = req.params;
    users.remove({Username: userName}, {justOne: true})
        .then((user) => {
            if(!user) {
                return res.status(500).send('Error: ' + userName + " does not exist");
            } else {
                return res.status(500).send(userName + " has been deleted");
            }
        });   
});

// //READ full movie list
app.get("/movies", (req, res) => {
    movies.find().then((movies) => {
        res.status(201).json(movies);
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
    });
})

// //READ  movie movie based on title
app.get("/movies/:title", (req, res) => {
    movies.findOne({ 'Title': req.params.title})
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });  
});

// //READ  Find moives based on Genre
app.get("/movies/genre/:genreName", (req, res) => {
    movies.find({ 'Genre.Name': req.params.genreName })
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });  
});

// //READ  Find based on director name
app.get("/movies/director/:directorName", (req, res) => {
    movies.find({ 'Director.Name': req.params.directorName })
    .then((movies) => {
        res.json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});


// //UPDATE/postadd/update users favorite movie and put out a message
app.post("/users/:userName/:movieTitle", (req, res) => {
    const { userName, movieTitle } = req.params;
    movies.findOne({Title: movieTitle})
        .then((movie) => {
            if(!movie) {
                return res.status(500).send('Error: ' + req.params.movieTitle + " does not exist");
            } else {
                const filter = { Username: userName };
                const update = {$addToSet: {FavoriteMovies: movie._id}};
                const options = {new: true};
                users.findOneAndUpdate(filter, update, options)
                    .then((updatedUser) => {
                        return res.json(updatedUser);
                    }).catch((error) => {
                        console.log("err = " + error);
                        return res.status(500).send('Error: ' + error);
                    });
            }
        });    
});

// Delete users favorite movie
app.delete("/users/:userName/:movieTitle", (req, res) => {
    const { userName, movieTitle } = req.params;
    movies.findOne({Title: movieTitle})
        .then((movie) => {
            if(!movie) {
                return res.status(500).send('Error: ' + req.params.movieTitle + " does not exist");
            } else {
                const filter = { Username: userName };
                const update = {$pull: {FavoriteMovies: movie._id}};
                const options = {new: true};
                users.findOneAndUpdate(filter, update, options)
                    .then((updatedUser) => {
                        return res.json(updatedUser);
                    }).catch((error) => {
                        console.log("err = " + error);
                        return res.status(500).send('Error: ' + error);
                    });
            }
        });   
});

//port 808 listen
app.listen(8080, () => {
    console.log("Your app is listening on port 8080");
});