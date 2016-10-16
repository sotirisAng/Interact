/**
* @ngdoc controller
* @name myApp.controller:SignInCtrl
* @description:
*
*This is the controller respnsible for the authentication of the service and also for the navbar which is 
*visble in every view.
*
**/

	app.controller('SignInCtrl',['config','$scope','$http','$rootScope','$location','YamlParse', 'Notification','SignIn','$mdSidenav', 
		function(config,$scope, $http,$rootScope,$location,YamlParse, Notification, SignIn,$mdSidenav){
		
		var vm = this;
		vm.formType = {};
		vm.formObj = {};
		vm.formReq = {};
		vm.objUrl = config.signInUrl;
		vm.signup = false;
		$scope.serviceName = config.serviceName;


		/**
		* @ngdoc method
		* @name signIn
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called when the user tries to authenticate. It sends an HTTP GET request 
		* with the user's credentials to the server. If the response is positive the given credentials are
		* stored to the credentials variable of the SignIn service so it can create the headers for enery
		* other request. Until the user signs in all the request are either forbbiden or sent without 
		* headers. Then it shows a "welcome" message to the user, marks the signedIn variable of the rootScope
		* as true, clears the current resource an redirects to the main page. If the response has an error, 
		* it informs the user that he entered wrong credentials and log the error.
		**/   

		
		vm.signIn = function(username, password){
			vm.credentials = btoa(username + ':' + password);

			$http({
				method : 'get',
				url : vm.objUrl,
				headers: {
					'Authorization': 'Basic ' + vm.credentials,
					'Content-Type': 'application/json'}
			})
			.then(function(response){
				$rootScope.credentials = vm.credentials;
				SignIn.credentials = vm.credentials;
				SignIn.createHeader();
				Notification.success("Login successful. Welcome " + username);
				// console.log('signedIn!');
				$rootScope.signedIn = true;
				vm.clearCurrent();
				$location.path( "/" );
			}).catch(function(error){
				console.log(error);
				Notification.error("Wrong credentials ");
			});
		};

		/**
		* @ngdoc method
		* @name actionCheck
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called when the user chooses to sign out. It clears the credentials and the headers
		* and markes the signedIn variable to flase.
		**/   

		vm.signOut = function(){
			$rootScope.credentials = "";
			$rootScope.signedIn = false;
			SignIn.headers = {};
		};


		// vm.parsedTable=YamlParse.parsejson();
		vm.parsedTable=YamlParse.parsedTable;


		/**
		* @ngdoc method
		* @name find
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called when the controller is referenced. It uses the uri of the current
		* resource and the parsedTable, which has the information from the yaml file in a json format. 
		* S-case generates apis whose uris end with the name of the current resourse or with its id.
		* So after comparing the uri ending whith the information f the parsedTable, it can recognize 
		* the resourse an its properties. After that it creates a form object which is used to generate 
		* the form that will be posted to the server to create a new user. Then formType array 
		* is created to store the information about the type of the resource's properties.
		*
		**/

		vm.find = function(){
			for (i = 0 ; i<vm.parsedTable.length; i++){
				var y = vm.parsedTable[i].Name;
				var k =new RegExp( y +'\/\\d{1,4}$');
				if (k.test(vm.objUrl) || vm.objUrl.endsWith(y) ){
					vm.name = y;
					vm.formObj = {};
					for(j=0; j<vm.parsedTable[i].Properties.length; j++){
						var key = vm.parsedTable[i].Properties[j].Name;
						var type = vm.parsedTable[i].Properties[j].Type;
						var required = vm.parsedTable[i].Properties[j].Required;
						vm.formObj[key] = "" ;
						vm.formType[key] = type;
						vm.formReq[key] = required;
					}
				}
			}
		};

		/**
		* @ngdoc method
		* @name signUp
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called when the user fills the form to create a new user resource and presses the 
		* submit button. To create a new user it sends an HTTP POST request to the server with the data 
		* filled in the form as a form object.
		**/

		vm.signUp = function(){
			$http({
				method : 'POST',
				url : vm.objUrl,
				data : vm.formObj
			})
			.then(function(response){
				Notification("Registration succesful. Welcome " + vm.formObj.username);
				$location.path( "/signin" );
			}).catch(function(error){
				console.log(error);
				Notification("Try again ");
			});
		};
		
		/**
		* @ngdoc method
		* @name clearCurrent
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called when the user clicks the "Home" button. It clears the cuurent object of the 
		* rootScope, trigers an event to inform the mainCtrl to reload and redirects to the main page.
		**/

		vm.clearCurrent = function(){
			$rootScope.currentObject = {};
			$scope.$broadcast('GoHome');
			$location.path("/");
		};

		/**
		* @ngdoc method
		* @name openSidebar
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called from the user when he clicks the "More Options" button and opens the sidebar 
		**/ 

		vm.openSidebar = function(){
			$mdSidenav('left').open();
		};

		/**
		* @ngdoc method
		* @name closeSidebar
		* @methodOf myApp.controller:SignInCtrl
		* @description
		*
		*This method is called from the user when he clicks the "Cancel" button of the sidebar and closes it. 
		**/ 
		vm.closeSidebar = function(){
			$mdSidenav('left').close();
		};


		vm.showMoreOptions= function(){
			if ($location.path() == "/signin" ){
				return false;
			}
			else if ($location.path() == "/edit"){
				return false;
			}
			return true;

		};

		vm.find();

	}]);