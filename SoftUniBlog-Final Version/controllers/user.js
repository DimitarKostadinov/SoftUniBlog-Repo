const User = require('mongoose').model('User');
const Role = require('mongoose').model('Role');
const Article = require('mongoose').model('Article');
const Category = require('mongoose').model('Category');
const Tag = require('mongoose').model('Tag');
const encryption = require('./../utilities/encryption');


module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost: (req, res) => {
        let registerArgs = req.body;

        User.findOne({email: registerArgs.email}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    email: registerArgs.email,
                    passwordHash: passwordHash,
                    fullName: registerArgs.fullName,
                    salt: salt
                };

                let roles = [];
                Role.findOne({name: 'User'}).then(role => {
                    roles.push(role.id);

                    userObject.roles = roles;
                    User.create(userObject).then(user => {
                        user.prepareInsert()
                        req.logIn(user, (err) => {
                            if (err) {
                                registerArgs.error = err.message;
                                res.redirect('user/register', registerArgs);
                                return;
                            }

                            res.redirect('/');
                        })

                    });
                });
            }
        });
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user || !user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                let returnUrl = '/';
                if (req.session.returnUrl) {
                    returnUrl = req.session.returnUrl;
                    delete req.session.returnUrl;
                }

                res.redirect(returnUrl);
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },



    detailsGet: (req, res) => {
        let user = req.user;
        let userId = user.id;
        Article.find({author: userId}).populate('author').then(article => {
            res.render('user/details', {user: user, articles: article});
        });
    },

    detailsPost: (req, res) => {
        let detailsArgs = req.body;
        let id = req.user.id;

        User.findOne({_id: id}).then(user => {
            //console.log(user);
            let errorMsg = '';
            if (detailsArgs.password !== detailsArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                detailsArgs.error = errorMsg;
                res.render('user/details', detailsArgs)
            } else {
                /*user.setPassword(detailsArgs.password, function() {
                 user.save();
                 });*/

                if (detailsArgs.password) {
                    let salt = encryption.generateSalt();
                    let passwordHash = encryption.hashPassword(detailsArgs.password, salt);
                    user.passwordHash = passwordHash;
                    user.salt = salt;
                }
                if (detailsArgs.fullName) {
                    user.fullName = detailsArgs.fullName;
                    user.save();
                    res.redirect('/');
                }
            }
        })
    }

};
