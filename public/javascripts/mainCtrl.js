angular.module('mainController', ['authService', 'ui.router', 'userService'])

.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, $window, $interval, User, AuthToken){
	var app = this;

	app.loadme = false;

    if (Auth.isLoggedIn()) {
     
        Auth.getUser().then(function(data) {
            if (data.data.username === undefined) {
                Auth.logout(); 
                app.isLoggedIn = false; 
                $location.path('/'); 
                app.loadme = true;
            }
        });
    }

    app.checkSession = function() {
        if (Auth.isLoggedIn()) {
            app.checkingSession = true;
            var interval = $interval(function() {
                var token = $window.localStorage.getItem('token'); 
                if (token === null) {
                    $interval.cancel(interval); 
                } else {
                    self.parseJwt = function(token) {
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        return JSON.parse($window.atob(base64));
                    };
                    var expireTime = self.parseJwt(token); 
                    var timeStamp = Math.floor(Date.now() / 1000); 
                    var timeCheck = expireTime.exp - timeStamp; 
                    if (timeCheck <= 1800) {
                        showModal(1); 
                        $interval.cancel(interval); 
                    }
                }
            }, 30000);
        }
    };

    app.checkSession(); 

   
    var showModal = function(option) {
        app.choiceMade = false; 
        app.modalHeader = undefined; 
        app.modalBody = undefined;
        app.hideButton = false; 

        if (option === 1) {
            app.modalHeader = 'Timeout Warning'; 
            app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?'; 
            $("#myModal").modal({ backdrop: "static" }); 
            $timeout(function() {
                if (!app.choiceMade) app.endSession();
            }, 10000);
        } else if (option === 2) {
            app.hideButton = true; 
            app.modalHeader = 'Logging Out'; 
            $("#myModal").modal({ backdrop: "static" }); 
            $timeout(function() {
                Auth.logout(); 
                $location.path('/logout'); 
                hideModal(); 
            }, 2000);
        }
    };

    app.renewSession = function() {
        app.choiceMade = true; 
        User.renewSession(app.username).then(function(data) {
            if (data.data.success) {
                AuthToken.setToken(data.data.token); 
                app.checkSession(); 
            } else {
                app.modalBody = data.data.message; 
            }
        });
        hideModal(); // Close modal
    };

    app.endSession = function() {
        app.choiceMade = true; 
        hideModal(); 
        $timeout(function() {
            showModal(2); 
        }, 1000);
    };

    var hideModal = function() {
        $("#myModal").modal('hide'); 
    };


	$rootScope.$on('$stateChangeStart', function(){
		if (!app.checkingSession) app.checkSession();
		if(Auth.isLoggedIn()){
			//console.log('user logged in');
			app.isLoggedIn = true;
			Auth.getUser().then(function(data){
				//console.log(data.data.username);
				app.username = data.data.username;
				app.email = data.data.email;
				app.loadme = true;
			})
		}else{
			//console.log('user not logged in');
			app.isLoggedIn = false;
			app.username = '';
			app.loadme = true;
		}

		if($location.hash() == '_=_' ) $location.hash(null);
	});

	this.facebook = function () {
		/* body... */
		app.disabled = true;
		console.log($window.location);
		$window.location = $window.location.protocol + "//" + $window.location.host + '/auth/facebook';
	}


	this.twitter = function () {
		/* body... */
		app.disabled = true;
		console.log($window.location);
		$window.location = $window.location.protocol + "//" + $window.location.host + '/auth/twitter';
	}

	this.google = function () {
		/* body... */
		app.disabled = true;
		console.log($window.location);
		$window.location = $window.location.protocol + "//" + $window.location.host + '/auth/google';
	}

	

	this.doLogin = function(loginData){
		app.loading = true;
		app.errorMsg = false;
		app.expired = false;
		app.disabled = true;

		Auth.login(app.loginData).then(function(data){
			if(data.data.success){
				app.loading = false;
				//create success message
				app.successMsg = data.data.message + '...redirecting';
				//redirect to home page
				$timeout(function(){
					$location.path('/profile');
					app.loginData = '';
					app.successMsg = false;
					app.checkSession();
				}, 2000);
			}else{
				if(data.data.expired){
					app.expired = true;
					app.loading = false;
					app.errorMsg = data.data.message;
				}else{
						app.loading = false;
						app.disabled = false;
						app.errorMsg = data.data.message;
				}
			}
		});
	};

	app.logout = function(){
		 showModal(2); 
    };

});
