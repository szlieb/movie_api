const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    Models = require("./models.js"),
    passportJWT = require("passport-jwt");

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: "Username",
            passwordField: "Password",
        },
        (username, password, callback) => {
            console.log(username + "  " + password);
            Users.findOne({ Username: username }, (error, user) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }

                if (!user.validatePassword(password)) {
                    console.log("incorrect username");
                    return callback(null, false, {
                        message: "Username or Password Invalid.",
                    });
                }

                if (!user.validatePasswor) console.log("finished");
                return callback(null, user);
            });
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: "your_jwt_secret",
        },
        async (jwtPayload, callback) => {
            try {
                const user = await Users.findById(jwtPayload._id);
                return callback(null, user);
            } catch (error) {
                return callback(error);
            }
        }
    )
);
