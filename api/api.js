module.exports = function(app, upload, User) {
    // login
    app.post('/api/v1/login', (req, res) => {
        console.log('attempt login');
        
        // find DB with id
        User.findOne({id : req.body.id}, function(err, user) {
            if(err) {
                console.log(err);
                // error >>> redirect to login
                return res.redirect('http://localhost:8000/');
            }
            if(!user) {
                console.log('user not found');
                // user not found >>> redirect to login
                return res.redirect('http://localhost:8000/');
            }

            if(user.pw === req.body.pw) {
                console.log('login successful');
                // login successful >>> redirect to main
                let sess = req.session;
                sess.id_val = req.body.id;
                return res.redirect(`http://localhost:8000/main`);
            }
            else {
                console.log('login failed : wrong password');
                // login failed >>> redirect to login
                return res.redirect('http://localhost:8000/');
            }
        });
    });

    // create account
    app.post('/api/v1/create_account', (req, res) => {
        console.log('attempt create_account');

        // check validity of idpw
        if(req.body.id.length === 0 || req.body.pw.length === 0) {
            console.log('invalid idpw');
            // invalid idpw >>> redirect to create_account
            return res.redirect('http://localhost:8000/create_account');
        }
        User.findOne({id : req.body.id}, function(err, user) {
            if(err) {
                console.log(err);
                // error >>> redirect to create_account
                return res.redirect('http://localhost:8000/create_account');
            }
            if(user) {
                console.log('there already exists an id');
                // duplicate exists >>> redirect to create_account
                return res.redirect('http://localhost:8000/create_account');
            }
            else {
                // create user
                const user = new User();
                user.id = req.body.id;
                user.pw = req.body.pw;

                user.save(err => {
                    if(err) {
                        console.log(err);
                        // error >>> redirect to create_account
                        return res.redirect('http://localhost:8000/create_account');
                    }
                    console.log('user DB successfully created');
                    // successful >>> redirect to login
                    return res.redirect('http://localhost:8000/');
                });
            }
        });
    });

    // logout
    app.post('/api/v1/logout', (req, res) => {
        req.session.destroy();
        return res.redirect('http://localhost:8000/');
    });

    // search user
    app.get('/api/v1/search_user', (req, res) => {
        console.log('attempt search user');
        
        if(req.session.id_val === req.query.search_query) {
            // search for own account >>> redirect to main
            return res.redirect('http://localhost:8000/main');
        }
        
        User.findOne({id: req.query.search_query}, function(err, user) {
            if(err) {
                console.log(err);
                // error >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            }
            if(!user) {
                console.log('user not found');
                // user not found >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            }

            return res.redirect(`http://localhost:8000/view?search=${user.id}`)
        });
    });

    // search map ... should be implemented
    app.post('/api/v1/search_map', (req, res) => {
        console.log('attempt search map');

        User.find({}, function(err, users) {
            if(err) {
                console.log(err);
                // error >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            }
            if(!users) {
                console.log('user not found');
                // user not found >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            }

            for(let i = 0; i < users.length; i++) {
                for(let j = 0; j < users[i].image.length; j++) {
                    if(req.body.search_season === users[i].image[j].season && req.body.search_time === users[i].image[j].time) {
                        console.log(users[i].image[j]);
                    }
                }
            }

            return res.redirect('http://localhost:8000/main');
        });
    });

    // update map
    app.post('/api/v1/update_map', upload.single('img'), (req, res) => {
        console.log('attempt upload map');
        
        User.findOne({id: req.session.id_val}, function(err, user) {
            if(err) {
                console.log(err);
                // error >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            }
            if(!user) {
                console.log('user not found');
                // user not found >>> redirect to login
                return res.redirect('http://localhost:8000/');
            }
                
            // upload image to /uploads directory and to db
            if(req.body.check_type === "POST") {
                if(!req.file) {
                    console.log('image not submitted');
                    // image not submitted >>> redirect to main
                    return res.redirect('http://localhost:8000/main');
                }

                let filetype = req.file['mimetype'].split('/')[0];
                if(filetype !== 'image') {
                    // wrong type of file uploaded >>> redirect to main
                    return res.redirect('http://localhost:8000/main');
                }

                let coord_arr = merge_coordinates(req.body.x_coord, req.body.y_coord);
                // delete redundant coordinates
                for(let i = 0; i < user.image.length; i++) {
                    for(let j = 0; j < user.image[i].coord.length; j++) {
                        let index = coord_arr.indexOf(user.image[i].coord[j]);
                        if(index >= 0) {
                            coord_arr.splice(index, 1);
                        }
                    }
                }

                // update user
                //let ext = req.file['originalname'].split('.');
                user.image.push({img_path : req.file.filename, coord : coord_arr, season : req.body.season_update, time : req.body.time_update});
            }
            // delete selected coordinates in images that contains the coordinates
            else {
                // update user
                let coord_arr = merge_coordinates(req.body.x_coord, req.body.y_coord);
                let index_to_delete = new Array();
                for(let i = 0; i < user.image.length; i++) {
                    for(let j = 0; j < coord_arr.length; j++) {
                        let index = user.image[i].coord.indexOf(coord_arr[j])
                        if(index >= 0) {
                            user.image[i].coord.splice(index, 1);
                        }
                    }

                    if(user.image[i].coord.length === 0) {
                        index_to_delete.push(i);
                    }
                }
                for(let i = index_to_delete.length - 1; i >= 0; i--) {
                    user.image.splice(i, 1);
                }
            }

            // update user to db
            user.save(err => {
                if(err) {
                    console.log(err);
                    // error >>> redirect to main
                    return res.redirect('http://localhost:8000/main');
                }
                console.log('user DB successfully updated');
                // successful >>> redirect to main
                return res.redirect('http://localhost:8000/main');
            });
        });
    });

    // make String coordinate to an array of coordinates
    function merge_coordinates(x_coord, y_coord) {
        let x_coord_arr = x_coord.split(' ');
        let y_coord_arr = y_coord.split(' ');
        let coord_arr = new Array();
        for(let i = 0; i < x_coord_arr.length; i++) {
            coord_arr.push(x_coord_arr[i] + ',' + y_coord_arr[i]);
        }
        return coord_arr;
    }
}