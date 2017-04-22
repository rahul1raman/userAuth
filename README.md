# userAuth
A MEAN Stack Single Page Application with RESTful API


## Requirements

This application requires installation of NodeJS and MongoDB prior to running.


## Installation

- Install all dependencies in package.json file. This can be done by navigating to the root directory in the command prompt/terminal/console (I will refer to it as command prompt) and running the following command:

```
$ npm install
```

- You must enter your own MongoDB configuration settings in the server.js file:

```
mongoose.connect('mongodb://localhost:27017', function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB');
    }
});
```

- Enter your own Facebook, Twitter, and Google passport.js configuration settings in passport/passport.js:

``` 
passport.use(new FacebookStrategy({
        clientID: '', // Replace with your Facebook Developer App client ID
        clientSecret: '', // Replace with your Facebook Developer client secret
        callbackURL: "", // Replace with your Facebook Developer App callback URL
        profileFields: ['id', 'displayName', 'photos', 'email']
    }
```

```
passport.use(new TwitterStrategy({
        consumerKey: '', // Replace with your Twitter Developer App consumer key
        consumerSecret: '', // Replace with your Twitter Developer App consumer secret
        callbackURL: "", // Replace with your Twitter Developer App callback URL
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
    }
```

```
passport.use(new GoogleStrategy({
        clientID: '', // Replace with your Google Developer App client ID
        clientSecret: '', // Replace with your Google Developer App client ID
        callbackURL: "" // Replace with your Google Developer App callback URL
    }
```

- Enter your own sendgrid e-mail information (found in index.js file):

```
var options = {
    auth: {
        api_user: '', // Enter yourSendgrid username
        api_key: '' // Enter your Sendgrid password
    }
};
var client = nodemailer.createTransport(sgTransport(options));
```

- Also update all e-mail callbacks (links that users click for e-mail activation/password reset, etc.) according to the need.

```
var email = {
    from: 'MEAN Stack Staff, staff@localhost.com',
    to: user.email,
    subject: 'Reset Password Request',
    text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="localhost:3000/reset/' + user.resettoken,
    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="https://localhost:3000/reset/' + user.resettoken + '">https://localhost:3000/reset/</a>'
};

```

- Installation is complete. Navigate to folder where server.js file is located and enter the following into command prompt:

```
$ nodemon
```

## Contributors

Rahul Raman

## License

No license. 
