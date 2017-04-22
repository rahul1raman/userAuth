angular.module('authService', [])

.factory('Auth', function($http, AuthToken){
	var authFactory = {};

	authFactory.login = function(loginData){
		return $http.post('/api/authenticate', loginData).then(function(data){
			//console.log(data);
			AuthToken.setToken(data.data.token);
			return data;
		});
	};

	authFactory.isLoggedIn = function(){
		if(AuthToken.getToken()){
			return true;
		}else {
			return false;
		}
	};

	authFactory.facebook = function(token){
		AuthToken.setToken(token);
	};

	authFactory.getUser = function(){
		if(AuthToken.getToken()){
			return $http.post('/api/me');
		}else{
			$q.reject({message: 'User has no token'});
		}
	};

	authFactory.logout = function(){
		AuthToken.setToken();
	};

	return authFactory;
})

.factory('AuthToken', function($window){
	var authTokenFactory = {};

	authTokenFactory.setToken = function(token){
		if(token){
			$window.localStorage.setItem('token', token);	
		}else{
			$window.localStorage.removeItem('token');
		}
	};

	authTokenFactory.getToken = function(){
		return $window.localStorage.getItem('token');
	};

	return authTokenFactory;
})

.factory('AuthIntercept', function(AuthToken){
	var authInterceptFactory = {};
	authInterceptFactory.request = function(config){
		var token = AuthToken.getToken();
		if(token){
			config.headers['x-access-token'] = token;
		}
		return config;
	};

	return authInterceptFactory;
});