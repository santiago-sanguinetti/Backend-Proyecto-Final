import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { userModel } from "../dao/models/users.model.js";
import bcrypt from "bcrypt";
import { adminUser, isAdmin } from "./admin.config.js";
import { cartModel } from "../dao/models/carts.model.js";
import { dotenvConfig } from "./config.js";
const LocalStrategy = local.Strategy;

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
                    const newCart = new cartModel();
                    newCart.save();
                    const newUser = {
                        first_name,
                        last_name,
                        age,
                        email,
                        password: hashedPassword,
                        cart: newCart._id,
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
                        return done(null, adminUser);
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
                clientID: dotenvConfig.githubClientId,
                clientSecret: dotenvConfig.githubClientSecret,
                callbackURL: dotenvConfig.githubCallbackUrl,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile);
                    let user = await userModel.findOne({
                        email: profile._json.email,
                    });
                    if (!user) {
                        const newCart = new cartModel();
                        let newUser = {
                            //En caso que tenga perfil privado, usa el nombre de usuario en lugar del nombre
                            first_name:
                                profile._json.name || profile._json.login,
                            last_name: "",
                            age: 18,
                            email: profile._json.email,
                            password: "",
                            cart: newCart._id,
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

    passport.deserializeUser(async (email, done) => {
        email !== adminUser.email
            ? await userModel
                  .findOne({ email: email })
                  .then((user) => done(null, user))
            : done(null, adminUser);
    });
};

export default initializePassport;
