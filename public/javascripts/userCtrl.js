angular.module('userController', ['userService'])

.controller('regCtrl', function($http, $location, $timeout, User){
	var app = this;
	this.regUser = function(regData, valid){
		app.loading = true;
		app.errorMsg = false;
        app.disabled = true;
		if(valid){
			User.create(app.regData).then(function(data){
				if(data.data.success){
					app.loading = false;

				//create success message
				app.successMsg = data.data.message + '...redirecting';
				//redirect to home page
				$timeout(function(){
					$location.path('/');
				}, 2000);
			}else{
				app.loading = false;
                app.disabled = false;
				//create error message
				app.errorMsg = data.data.message;
			}
		});
		}else{
			app.loading = false;
            app.disabled = false;
				//create error message
			app.errorMsg = 'Please ensure form is filled properly';
		}
	};

	  this.checkUsername = function(regData) {
        app.checkingUsername = true;
        app.usernameMsg = false;
        app.usernameInvalid = false; 

        // Runs custom function that checks if username is available for user to use
        User.checkUsername(app.regData).then(function(data) {
            // Check if username is available for the user
            if (data.data.success) {
                app.checkingUsername = false; 
                app.usernameMsg = data.data.message; 
            } else {
                app.checkingUsername = false; 
                app.usernameInvalid = true; 
                app.usernameMsg = data.data.message; 
            }
        });
    };

     
    this.checkEmail = function(regData) {
        app.checkingEmail = true; 
        app.emailMsg = false;
        app.emailInvalid = false; 

        // Runs custom function that checks if e-mail is available for user to use          
        User.checkEmail(app.regData).then(function(data) {
           
            if (data.data.success) {
                app.checkingEmail = false; 
                app.emailMsg = data.data.message; 
            } else {
                app.checkingEmail = false; 
                app.emailInvalid = true; 
                app.emailMsg = data.data.message;
            }
        });
    };
}) //end of userCtrl


 // Custom directive to check matching passwords 
.directive('match', function() {
    return {
        restrict: 'A', 
        controller: function($scope) {
            $scope.confirmed = false; 

                          
            $scope.doConfirm = function(values) {
                
                values.forEach(function(ele) {
                  
                    if ($scope.confirm === ele) {
                        $scope.confirmed = true; 
                    } else {
                        $scope.confirmed = false;
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);   
            });
         
            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches);  
            });
        }
    }
  })


.controller('facebookCtrl', function($stateParams, Auth, $location, $window){
	//console.log($stateParams.token);
	var app = this;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

	if($window.location.pathname === '/facebookerror'){
		//error
		app.errorMsg = 'Facebook Email not found in database';
	}else if($window.location.pathname === '/facebook/inactive/error'){
        app.expired = true;
        app.errorMsg = 'Account not active yet. Please check your email';
    }else{
		Auth.facebook($stateParams.token);
		$location.path('/');
	}
})

.controller('twitterCtrl', function($stateParams, Auth, $location, $window){
	//console.log($stateParams.token);
	var app = this;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

	if($window.location.pathname === '/twittererror'){
		//error
		app.errorMsg = 'Twitter Email not found in database';
	}else if($window.location.pathname === '/twitter/inactive/error'){
        app.expired = true;
        app.errorMsg = 'Account not active yet. Please check your email';
    }else{
		Auth.facebook($stateParams.token);
		$location.path('/');
	}
})

.controller('googleCtrl', function($stateParams, Auth, $location, $window){
	//console.log($stateParams.token);
	var app = this;
    app.errorMsg = false;
    app.expired = false;
    app.disabled = true;

	if($window.location.pathname === '/googleerror'){
		//error
		app.errorMsg = 'Google Email not found in database';
	}else if($window.location.pathname === '/google/inactive/error'){
        app.expired = true;
        app.errorMsg = 'Account not active yet. Please check your email';
    }else{
		Auth.facebook($stateParams.token);
		$location.path('/');
	}
})