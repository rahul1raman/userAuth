angular.module('emailController', ['userService'])

 
.controller('emailCtrl', function($stateParams, User, $timeout, $location){

    app = this;
    

    User.activateAccount($stateParams.token).then(function(data) {
        app.errorMsg = false;
        app.successMsg= false;

        if(data.data.success){
        	app.successMsg = data.data.message + '...redirecting';
        	$timeout(function(){
        		$location.path('/login');
        	}, 2000);
        } else{
        	app.errorMsg = data.data.message+ '...redirecting';
        	$timeout(function(){
        		$location.path('/login');
        	}, 2000);
        }
    });
})


.controller('resendCtrl', function(User){

    app = this;

    app.checkCredentials = function(loginData){
        app.disabled = true;
        app.errorMsg = false;
        app.successMsg = false;
        User.checkCredentials(app.loginData)
            .then(function(data){
                if(data.data.success){
                    User.resendLink(app.loginData).then(function(data){
                        if(data.data.success){
                            app.successMsg = data.data.message;
                        }
                    });
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            })
    };

})

.controller('passwordCtrl', function(User, $scope) {

    app = this;
    app.sendPassword = function(resetData, valid) {
        app.errorMsg = false;
        app.disabled = true;
        if (valid) {
            User.sendPassword(app.resetData).then(function(data) {
                app.loading = false; 
                if (data.data.success) {
                    $scope.alert = 'alert alert-success';
                    app.successMsg = data.data.message;
                } else {
                    $scope.alert = 'alert alert-danger';
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        } else {
            app.disabled = false; 
            app.loading = false;
            $scope.alert = 'alert alert-danger';
            app.errorMsg = 'Please enter a valid username';
        }
    };
})

.controller('resetCtrl', function(User, $routeParams, $scope, $timeout, $location) {

    app = this;
    app.hide = true; 

    User.resetUser($routeParams.token).then(function(data) {
        if (data.data.success) {
            app.hide = false;
            $scope.alert = 'alert alert-success';
            app.successMsg = 'Please enter a new password'; 
            $scope.username = data.data.user.username;
        } else {
            $scope.alert = 'alert alert-danger'; 
            app.errorMsg = data.data.message; 
        }
    });

    app.savePassword = function(regData, valid, confirmed) {
        app.errorMsg = false; 
        app.successMsg = false;
        app.disabled = true;
        app.loading = true; 

        if (valid && confirmed) {
            app.regData.username = $scope.username;
            User.savePassword(app.regData).then(function(data) {
                app.loading = false;
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; 
                    app.successMsg = data.data.message + '...Redirecting'; 
              
                    $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; 
                    app.disabled = false; 
                    app.errorMsg = data.data.message;
                }
            });
        } else {
            $scope.alert = 'alert alert-danger';
            app.loading = false; 
            app.disabled = false; 
            app.errorMsg = 'Please ensure form is filled out properly';
        }
    };
});

