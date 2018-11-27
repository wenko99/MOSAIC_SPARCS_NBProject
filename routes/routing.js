module.exports = function(app, User) {
    app.get('/', (req, res) => {
        res.render('login.html');
    });

    app.get('/create_account', (req, res) => {
        res.render('create_account.html');
    });
    
    app.get('/main', (req, res) => {
        let sess = req.session;
        if(sess.id_val) {
            console.log('correct access to main : access with login');

            User.findOne({id: sess.id_val}, function(err, user) {
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

                // correct access >>> render main
                res.render('main.ejs', {
                    id : user.id,
                    image : user.image
                });
            });
        }
        else {
            console.log('wrong access : access without login');
            // wrong access (accessing main page without login) >>> redirect to login
            res.redirect('http://localhost:8000/');
        }
    });

    app.get('/view', (req, res) => {
        let sess = req.session;
        if(sess.id_val) {
            console.log('correct access to view : access with login');

            User.findOne({id: req.query.search}, function(err, user) {
                if(err) {
                    console.log(err);
                    // error >>> redirect to login
                    return res.redirect('http://localhost:8000');
                }
                if(!user) {
                    console.log('user not found');
                    // user not found >>> redirect to main
                    return res.redirect('http://localhost:8000/');
                }

                // correct access >>> render view
                res.render('view.ejs', {
                    id: sess.id_val,
                    search_id : user.id,
                    search_image : user.image
                })
                
            });
        }
        else {
            console.log('wrong access : access without login');
            // wrong access (accessing view page without login) >>> redirect to login
            res.redirect('http://localhost:8000/');
        }
    });
}