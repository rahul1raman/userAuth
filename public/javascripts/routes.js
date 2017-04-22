var app = angular.module('appRoutes', ['ui.router'])

/*.config(function(){
	console.log('testing routes application')
});*/
.config([           							
	'$stateProvider',
	'$urlRouterProvider','$locationProvider',
	function($stateProvider, $urlRouterProvider,$locationProvider){

		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/pages/home.html'
		})

		.state('register',{
			url: '/register',
			templateUrl: '/pages/users/register.html',
			controller: 'regCtrl',
			controllerAs: 'register',
			authenticated: false
		})

		.state('about', {
			url: '/about',
			templateUrl: 'pages/about.html'
		})

		.state('login', {
			url: '/login',
			templateUrl: 'pages/users/login.html',
			authenticated: false
		})

		.state('logout',{
			url: '/logout',
			templateUrl: 'pages/users/logout.html',
			authenticated: true 
		})

		.state('profile',{
			url: '/profile',
			templateUrl: 'pages/users/profile.html',
			authenticated: true 
		})

		.state('facebook',{
			url: '/facebook/:token',
			templateUrl: 'pages/users/social/social.html',
			controller: 'facebookCtrl',
			controllerAs: 'facebook',
			authenticated: false 
		})

		.state('twitter',{
			url: '/twitter/:token',
			templateUrl: 'pages/users/social/social.html',
			controller: 'twitterCtrl',
			controllerAs: 'twitter',
			authenticated: false 
		})

		.state('facebookerror', {
			url: '/facebookerror',
			templateUrl: 'pages/users/login.html',
			controller: 'facebookCtrl',
			controllerAs: 'facebook',
			authenticated: false
		}) 

		.state('twittererror', {
			url: '/twittererror',
			templateUrl: 'pages/users/login.html',
			controller: 'twitterCtrl',
			controllerAs: 'twitter',
			authenticated: false
		})


		.state('google',{
			url: '/google/:token',
			templateUrl: 'pages/users/social/social.html',
			controller: 'googleCtrl',
			controllerAs: 'google',
			authenticated: false 
		})
		.state('googleerror', {
			url: '/googleerror',
			templateUrl: 'pages/users/login.html',
			controller: 'googleCtrl',
			controllerAs: 'google',
			authenticated: false
		})

		.state('facebookinactive', {
			url: '/facebook/inactive/error',
			templateUrl: 'pages/users/login.html',
			controller: 'facebookCtrl',
			controllerAs: 'facebook',
			authenticated: false
		})


		.state('googleinactive', {
			url: '/google/inactive/error',
			templateUrl: 'pages/users/login.html',
			controller: 'googleCtrl',
			controllerAs: 'google',
			authenticated: false
		})


		.state('twitterinactive', {
			url: '/twitter/inactive/error',
			templateUrl: 'pages/users/login.html',
			controller: 'twitterCtrl',
			controllerAs: 'twitter',
			authenticated: false
		})

		.state('activate', {
			url: '/activate/:token',
			templateUrl: 'pages/users/activation/activate.html',
			controller: 'emailCtrl',
			controllerAs: 'email',
			authenticated: false
		})

		.state('resend', {
			url: '/resend',
			templateUrl: 'pages/users/activation/resend.html',
			controller: 'resendCtrl',
			controllerAs: 'resend',
			authenticated: false
		})

		.state('resetpassword',{
			url:'/resetpassword',
			templateUrl: 'pages/users/reset/password.html',
			controller: 'passwordCtrl',
			controllerAs: 'password',
			authenticated: false
		})

		.state('reset',{
			url:'/reset/:token',
			templateUrl: 'pages/users/reset/newpassword.html',
			controller: 'resetCtrl',
			controllerAs: 'reset',
			authenticated: false
		})
		

		$urlRouterProvider.otherwise('/');


		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	}
	]);

app.run(['$rootScope', 'Auth','$state', function($rootScope,Auth, $state){
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
		if(toState.authenticated == true){
			//console.log('needs auth');
			if(!Auth.isLoggedIn()){
				event.preventDefault();
				$state.go('home'); }

		} else if(toState.authenticated == false){
			if(Auth.isLoggedIn()){
				event.preventDefault();
				$state.go('profile');
			}
		}
	});
}]);