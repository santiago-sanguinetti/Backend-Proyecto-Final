import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { userModel } from "../dao/models/users.model.js";
import bcrypt from "bcrypt";
const LocalStrategy = local.Strategy;
function isAdmin(email, password) {
    const adminEmail = "adminCoder@coder.com";
    const adminPassword = "123"; //"adminCod3r123";
    //Devuelve un booleano si coinciden los datos
    return email === adminEmail && password === adminPassword;
}
const initializePassport = () => {
    passport.use(
        "register",
        new LocalStrategy(
            { passReqToCallback: true, usernameField: "email" },
            async (req, username, password, done) => {
                try {
                    const user = await userModel.findOne({ email: username });

                    if (user) {
                        console.log("User already exists");
                        return done(null, false);
                    }
                    const { first_name, last_name, age, email } = req.body;
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = {
                        first_name,
                        last_name,
                        age,
                        email,
                        password: hashedPassword,
                    };
                    console.log(newUser);
                    const result = await userModel.create(newUser);
                    return done(null, result);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email" },
            async (username, password, done) => {
                try {
                    if (isAdmin(username, password)) {
                        console.log(username);
                        return done(null, {
                            _id: "42",
                            first_name: "Admin",
                            last_name: "",
                            Age: 42,
                            email: username,
                            role: "admin",
                        });
                    } else {
                        const user = await userModel.findOne({
                            email: username,
                        });
                        if (
                            !user ||
                            !(await bcrypt.compare(password, user.password))
                        ) {
                            return done(null, false, {
                                message: "Invalid username or password",
                            });
                        }

                        return done(null, user);
                    }
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.use(
        "github",
        new GitHubStrategy(
            {
                clientID: "Iv1.dcfbbf30c8e9e024",
                clientSecret: "1c855aa3f2fa9dbbe7586cabf084ab2f3fa0a8de",
                callbackURL:
                    "http://localhost:8080/api/sessions/githubcallback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile);
                    let user = await userModel.findOne({
                        email: profile._json.email,
                    });
                    if (!user) {
                        let newUser = {
                            //En caso que tenga perfil privado, usa el nombre de usuario en lugar del nombre
                            first_name:
                                profile._json.name || profile._json.login,
                            last_name: "",
                            age: 18,
                            email: profile._json.email,
                            password: "",
                        };
                        let result = await userModel.create(newUser);
                        done(null, result);
                    } else {
                        done(null, user);
                    }
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    });
};

export default initializePassport;