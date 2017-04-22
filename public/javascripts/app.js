angular.module('userApp', ['appRoutes', 'userController','mainController', 'emailController' ,'userService', 'authService','ngAnimate'])

/*.config(function(){
	console.log('testing user application')
});*/

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthIntercept');
});