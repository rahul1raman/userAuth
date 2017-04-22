angular.module('userService', [])

.factory('User', function($http){
	var	userFactory = {};

	userFactory.create = function(regData){
		return $http.post('/api/users', regData);
	}

	userFactory.checkUsername = function(regData){
		return $http.post('/api/checkusername', regData);
	}

	userFactory.checkEmail = function(regData){
		return $http.post('/api/checkemail', regData);
	}
	 userFactory.activateAccount = function(token) {
        return $http.put('/activate/' + token);
    }

    userFactory.checkCredentials = function(loginData){
    	return $http.post('/resend', loginData);
    }
    
    userFactory.resendLink = function(username){
    	return $http.put('/resend', username)
    }

    userFactory.sendPassword = function(resetData) {
    	return $http.put('/resetpassword', resetData);
    };

    userFactory.resetUser = function(token){
    	return $http.get('/resetpassword/' + token);
    };

    userFactory.renewSession = function(username) {
        return $http.get('/api/renewToken/' + username);
    };


	return userFactory;
});

