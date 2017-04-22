var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = mongoose.model('User');
var path =require('path');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var secret = 'hariputtar';

var options = {
	auth: {
		api_user: 'sofake',
		api_key: 'What%5isit?'
	}
}

var client = nodemailer.createTransport(sgTransport(options));




/* GET home page. */

router.get('/', function(req, res, next) {
	res.render('index');
});
/*Resolve path*/
router.get('/*', function(req, res) {
	var url = path.resolve(__dirname + '/../views/index.ejs');
	res.render(url);
}); 

/*user registration*/
router.post('/api/users', function(req,res){
	var user = new User(req.body);
	user.temporarytoken = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '24h'}); 
	if(req.body.username!==null && req.body.email!==null && req.body.password!==null
		&& req.body.username!=='' && req.body.email!=='' && req.body.password!=='') {
		user.save(function (err) {
			if(err && (11000 === err.code || 11001 === err.code)) {
				res.json({success: false, message: 'Username or email already exists!'});
			}else if(err){
				if (err.errors !== null) {
					if (err.errors.name) {
						res.json({success: false, message: err.errors.name.message});
					} else if (err.errors.email) {
						res.json({success: false, message: err.errors.email.message}); 
					} else if (err.errors.username) {
						res.json({success: false, message: err.errors.username.message});
					} else if (err.errors.password) {
						res.json({success: false, message: err.errors.password.message}); 
					} else {
						res.json({success: false, message: err});
					}
				}
			}else{

				var email = {
					from: 'Localhost, localhost@localhost.com',
					to: user.email,
					subject: 'Your Activation Link',
					text: 'Hello ' + user.name + ', thank you for registering at localhost.com. Please click on the following link to complete your activation: http://localhost:3000/activate/' + user.temporarytoken,
					html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="http://localhost:3000/activate/' + user.temporarytoken + '">http://localhost:3000/activate/</a>'  
				};

				client.sendMail(email, function(err, info){
					if (err ){
						console.log(err);
					}
					else {
						console.log('Message sent: ' + info.response);
					}
				});


				res.json({success: true, 
					message: 'Account registerd. Please check your email for activation link.'});}
			});
}else{
	res.json({success: false, message:'Ensure all fields are filled.'});
}
});

/*user login route*/

router.post('/api/authenticate', function(req, res){
	User.findOne({username: req.body.username})
	.select('email username password active')
	.exec(function(err, user){
		if(err) throw err;

		if(!user){
			res.json({success: false, message: "User not found"});
		}else if(user){
			if(req.body.password){
				var compare = user.comparePassword(req.body.password);
			}else{
				res.json({success: false, message: 'Enter a password'});
			}
			if(!compare){
				res.json({success: false, message: 'Not a valid password'});
			} else if(!user.active){
        res.json({success: false, message: 'Account is not yet activated. Please check your email for activation link', expired:true});
      }else{
        var token = jwt.sign({username: user.username, email: user.email}, secret, {expiresIn: '24h'});
        res.json({success: true, message:'User Authenticated', token: token});
      }
    }
  });
});

  // Route to activate the user's account 
  router.put('/activate/:token', function(req, res) {
  	User.findOne({ temporarytoken: req.params.token }, function(err, user) {
  		if (err) {
  			var email = {
  				from: 'Localhost, localhost.com',
  				to: 'rahul1raman@gmail.com',
  				subject: 'Error Logged',
  				text: 'The following error has been reported in the MEAN Stack Application: ' + err,
  				html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
  			};
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                	if (err) {
                		console.log(err);
                	} else {
                		console.log(info);
                		console.log(user.email);
                	}
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed immediately. We apologize for this inconvenience!' });
              } else {
               var token = req.params.token; 
               jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                 res.json({ success: false, message: 'Activation link has expired.' });
               } else if (!user) {
                 res.json({ success: false, message: 'Activation link has expired.' });
               } else {
                 user.temporarytoken = false;
                 user.active = true;
                 user.save(function(err) {
                  if (err) {
                   console.log(err);
                 } else {

                   var email = {
                    from: 'Localhost, rahul1raman@gmail.com',
                    to: user.email,
                    subject: 'Account Activated',
                    text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'
                  };
                  client.sendMail(email, function(err, info) {
                    if (err) console.log(err);
                  });
                  res.json({ success: true, message: 'Account activated!' });
                }
              });
               }
             });
             }
           });
  });

  router.post('/resend', function(req, res) {
    User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user) {
      if (err) {
        var email = {
          from: 'Localhost, localhost.com',
          to: 'rahul1raman@gmail.com',
          subject: 'Error Logged',
          text: 'The following error has been reported in the MEAN Stack Application: ' + err,
          html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
        };

        client.sendMail(email, function(err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log(info);
            console.log(user.email);
          }
        });
        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
      } else {

        if (!user) {
          res.json({ success: false, message: 'Could not authenticate user' });
        } else if (user) {
          if (req.body.password) {
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
              res.json({ success: false, message: 'Could not authenticate password' });
            } else if (user.active) {
              res.json({ success: false, message: 'Account is already activated.' });
            } else {
              res.json({ success: true, user: user });
            }
          } else {
            res.json({ success: false, message: 'No password provided' });
          }
        }
      }
    });
  });

  router.put('/resend', function(req, res) {
    User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function(err, user) {
      if (err) {
        var email = {
          from: 'Localhost, rahul1raman@gmail.com',
          to: 'rahul1raman@gmail.com',
          subject: 'Error Logged',
          text: 'The following error has been reported in the MEAN Stack Application: ' + err,
          html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
        };
        client.sendMail(email, function(err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log(info); 
            console.log(user.email); 
          }
        });
        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
      } else {
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); 
        user.save(function(err) {
          if (err) {
            console.log(err); 
          } else {

            var email = {
              from: 'Localhost, rahul1raman@gmail.com',
              to: user.email,
              subject: 'Activation Link Request',
              text: 'Hello ' + user.name + ', You recently requested a new account activation link. Please click on the following link to complete your activation: http://localhost:3000/activate/' + user.temporarytoken,
              html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested a new account activation link. Please click on the link below to complete your activation:<br><br><a href="http://localhost:3000/activate/' + user.temporarytoken + '">http://localhost:3000/activate/</a>'
            };
                        // Function to send e-mail to user
                        client.sendMail(email, function(err, info) {
                          if (err) console.log(err); 
                        });
                        res.json({ success: true, message: 'Activation link has been sent to ' + user.email + '!' }); 
                      }
                    });
      }
    });
  });


  router.post('/api/checkusername', function(req, res) {
  	User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
  		if (err) throw err;
  		if (user) {
  			res.json({ success: false, message: 'That username is already taken' });
  		} else {
       res.json({ success: true, message: 'Valid username' });
     }
   });
  });

  router.post('/api/checkemail', function(req, res) {
  	User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
  		if (err) throw err;
  		if (user) {
  			res.json({ success: false, message: 'That e-mail is already taken' });
  		} else {
  			res.json({ success: true, message: 'Valid e-mail' });
  		}

  	});
  });

router.put('/resetpassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err, user) {
            if (err) {
             var email = {
              from: 'Localhost, rahul1raman@gmail.com',
              to: 'rahul1raman@gmail.com',
              subject: 'Error Logged',
              text: 'The following error has been reported in the MEAN Stack Application: ' + err,
              html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
            };
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' }); 
                } else if (!user.active) {
                    res.json({ success: false, message: 'Account has not yet been activated' }); 
                } else {
                    user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err }); 
                        } else {
                            var email = {
                                from: 'Localhost, rahul1raman@gmail.com',
                                to: user.email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://localhost:3000/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://localhost:3000/reset/' + user.resettoken + '">http://localhost:3000/reset/</a>'
                            };
                  
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(info);
                                    console.log('sent to: ' + user.email);
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); // Return success message
                        }
                    });
                }
            }
        });
    });

    router.get('/resetpassword/:token', function(req, res) {
        User.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                 var email = {
              from: 'Localhost, rahul1raman@gmail.com',
              to: 'rahul1raman@gmail.com',
              subject: 'Error Logged',
              text: 'The following error has been reported in the MEAN Stack Application: ' + err,
              html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
            };
            
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); 
                    } else {
                        console.log(info);
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                var token = req.params.token;
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' });
                        } else {
                            res.json({ success: true, user: user });
                        }
                    }
                });
            }
        });
    });

    router.put('/savepassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username email name password resettoken').exec(function(err, user) {
            if (err) {
               
                 var email = {
              from: 'Localhost, rahul1raman@gmail.com',
              to: 'rahul1raman@gmail.com',
              subject: 'Error Logged',
              text: 'The following error has been reported in the MEAN Stack Application: ' + err,
              html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
            };
                
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); 
                    } else {
                        console.log(info); 
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                if (req.body.password === null || req.body.password === '') {
                    res.json({ success: false, message: 'Password not provided' });
                } else {
                    user.password = req.body.password; 
                    user.resettoken = false; 
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            var email = {
                                from: 'Localhost, localhost@localhost.com',
                                to: user.email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                         
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); 
                            });
                            res.json({ success: true, message: 'Password has been reset!' });
                        }
                    });
                }
            }
        });
    });



//Middleware
    router.use(function(req, res, next) {
      var token = req.body.token || req.body.query || req.headers['x-access-token'];    
      if (token) {      
        jwt.verify(token, secret, function(err, decoded) {
          if (err) {
            res.json({ success: false, message: 'Token invalid' });
          } else {
            req.decoded = decoded; 
            next();
          }
        });
      } else {
        res.json({ success: false, message: 'No token provided' });
      }
    });

    router.post('/api/me', function(req, res){
     res.send(req.decoded);
   });

    router.get('/renewToken/:username', function(req, res) {
        User.findOne({ username: req.params.username }).select('username email').exec(function(err, user) {
            if (err) {
                var email = {
                    from: 'MEAN Stack Staff, localhost@localhost.com',
                    to: 'rahul1raman@gmail.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); 
                    } else {
                        console.log(info); 
                        console.log(user.email);
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
               
                if (!user) {
                    res.json({ success: false, message: 'No user was found' });
                } else {
                    var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken });
                }
            }
        });
    });

    module.exports = router;
