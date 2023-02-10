const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const models = require("./models.js");

//bcrypt
const bcrypt = require("bcrypt");
// end bcrypt

mongoose.connect(
    "mongodb+srv://admin:Mydb123@myFlixDB.1fpv2cv.mongodb.net/myFlixDB?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

// allowing origns for corrs
let allowedOrigins = [
    "http://localhost:8080",
    "https://zalmy-myflix.herokuapp.com",
    "http://zalmy-myflix.herokuapp.com",
];

const db = mongoose.connection;
const { title, emitWarning } = require("process");
(morgan = require("morgan")), (fs = require("fs")), (path = require("path"));

// populates log.txt
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
    flags: "a",
});
const app = express();

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// cors access conrol
const cors = require("cors");
// app.use(cors());

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                // If a specific origin isn’t found on the list of allowed origins
                let message =
                    "The CORS policy for this application doesnt allow access from origin" +
                    origin;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        },
    })
);
//cors end

//authorization for login
let auth = require("./auth")(app);
const passport = require("passport");
const http = require("http");
require("./passport");

const movies = models.Movie;
const users = models.User;
const genre = models.Genre;
const director = models.Director;

const { check, validationResult } = require("express-validator");

app.get("/", (req, res) => {
    res.send("Welcome To The number One Place For Film & Movie Enthusists");
});

//Create user new with hashing
app.post(
    "/users",
    [
        check("Username", "Username is required.").isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non alphanumeric characters - not allowed."
        ).isAlphanumeric(),
        check("Password", "Password is required.").not().isEmpty(),
        check("Email", "Email does not appear to be valid").isEmail(),
    ],
    (req, res) => {
        //Check validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = users.hashPassword(req.body.Password);
        users
            .findOne({ Username: req.body.Username })
            .then((user) => {
                console.log(user);
                if (user) {
                    return res
                        .status(400)
                        .send(req.body.Username + "already exists");
                } else {
                    users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
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
    }
);

// //get users
app.get(
    "/users",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        users
            .find()
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("Error: " + error);
            });
    }
);

//UPDATE/PUT update exsisting user info
app.put(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { Username } = req.params;
        const filter = { Username: Username };
        const update = {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
        };
        const options = { new: true };
        users
            .findOneAndUpdate(filter, update, options)
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((error) => {
                console.log("err = " + error);
                res.status(500).send("Error: " + error);
            });
    }
);

// Delete users favorite movie
app.delete(
    "/users/:userName",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { userName } = req.params;
        users.remove({ Username: userName }, { justOne: true }).then((user) => {
            if (!user) {
                return res
                    .status(500)
                    .send("Error: " + userName + " does not exist");
            } else {
                return res.status(500).send(userName + " has been deleted");
            }
        });
    }
);

//READ full movie list
app.get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        movies
            .find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("Error: " + error);
            });
    }
);

// //READ  movie movie based on title
app.get(
    "/movies/:title",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        movies
            .findOne({ Title: req.params.title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//READ  Find moives based on Genre
app.get(
    "/movies/genre/:genreName",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        movies
            .find({ "Genre.Name": req.params.genreName })
            .then((movies) => {
                res.json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//READ  Find based on director name
app.get(
    "/movies/director/:directorName",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        movies
            .find({ "Director.Name": req.params.directorName })
            .then((movies) => {
                res.json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//UPDATE/postadd/update users favorite movie and put out a message
app.post(
    "/users/:userName/:movieTitle",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { userName, movieTitle } = req.params;
        movies.findOne({ Title: movieTitle }).then((movie) => {
            if (!movie) {
                return res
                    .status(500)
                    .send(
                        "Error: " + req.params.movieTitle + " does not exist"
                    );
            } else {
                const filter = { Username: userName };
                const update = { $addToSet: { FavoriteMovies: movie._id } };
                const options = { new: true };
                users
                    .findOneAndUpdate(filter, update, options)
                    .then((updatedUser) => {
                        return res.json(updatedUser);
                    })
                    .catch((error) => {
                        console.log("err = " + error);
                        return res.status(500).send("Error: " + error);
                    });
            }
        });
    }
);

// Delete users favorite movie
app.delete(
    "/users/:userName/:movieTitle",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { userName, movieTitle } = req.params;
        movies.findOne({ Title: movieTitle }).then((movie) => {
            if (!movie) {
                return res
                    .status(500)
                    .send(
                        "Error: " + req.params.movieTitle + " does not exist"
                    );
            } else {
                const filter = { Username: userName };
                const update = { $pull: { FavoriteMovies: movie._id } };
                const options = { new: true };
                users
                    .findOneAndUpdate(filter, update, options)
                    .then((updatedUser) => {
                        return res.json(updatedUser);
                    })
                    .catch((error) => {
                        console.log("err = " + error);
                        return res.status(500).send("Error: " + error);
                    });
            }
        });
    }
);

//port listen
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
    console.log("Listening on Port " + port);
});

// port 808 listen
// app.listen(8080, () => {
//     console.log("Your app is listening on port 8080");
// });
