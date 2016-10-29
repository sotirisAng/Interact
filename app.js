/**
* @ngdoc object
* @name myApp
* @description 
*
* myApp is a tool that automatically creates genereric grafical user interfaces for restful services 
* produced by S-case. The application is basically based in the restful nature of the services, where 
* every returnig resource, exept it's properties, carries a list with all the resources tha could be reached
* from it. In addition to that, each one of the listed resources is bounded with one CRUD action. This means
* that the application will know in every step what kind of action the user wills to make. Alongside with the
* actual service the application uses a yaml file which has a detailed description af every resource. 
* The combination of the current resource and the information storded in the yaml file, makes the application
* able to visualize the resource's data and implement every available CRUD action. 
*/
	var app = angular.module('myApp',	['ngMaterial','ngRoute', 'ui-notification','ngSanitize']);

    app.config(function($routeProvider){
		$routeProvider
		.when('/', {
			// templateUrl:'templates/main.html'})
			templateUrl:'templates/dashboard.html'})
		.when('/list', {
			templateUrl:'templates/list.html'})
		.when('/view', {
			// templateUrl:'templates/view.html'})
			templateUrl:'templates/view_dashboard.html'})
		.when('/edit', {
			templateUrl:'templates/edit.html'})
		.when('/signin', {
			templateUrl:'templates/signin.html'})
		.otherwise({redirectTo:'/'});
	})

	.config(function($mdThemingProvider ){
            $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey');
    })

	.config(function(NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 2000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'center',
            positionY: 'top'
        });
    });

	app.run(['YamlParse', function(YamlParse){
		YamlParse.parsejson();
	}]);

	




	
