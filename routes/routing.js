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
            console.log('correct access : access with login');

            // temporary code
            // should access to image via db later
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
                    id: sess.id_val,
                    image : user.image
                });
            });
            
            /*
            // correct access >>> render main
            res.render('main.ejs', {
                id: sess.id_val
            });
            */
        }
        else {
            console.log('wrong access : access without login');
            // wrong access (accessing main page without login) >>> redirect to login
            res.redirect('http://localhost:8000/');
        }
    });
}