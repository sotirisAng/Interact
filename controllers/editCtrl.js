/**
* @ngdoc controller
* @name myApp.controller:editCtrl
* @description:
*
*This is the controller respnsible to create the forms and execute the requests 
*for posting and updating data to the api's resources. 
* 
**/

app.controller('editCtrl',['config','$http','$scope','$rootScope','$location','SignIn', 'YamlParse', 'Notification','CurrentOb', 
	function(config, $http,$scope,$rootScope,$location, SignIn, YamlParse, Notification,CurrentOb){

		var vm = this;

		vm.actionbutton = "";
		vm.formObj = {};
		vm.formType = {};
		vm.formReq = {};
		vm.currentObject = $rootScope.currentObject;

		/**
		* @ngdoc method
		* @name currentCheck
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called first when the controller is been referenced to check if 
		* there is an object for posting or editing. If the object is defined it calls getObj() 
		* else it redirects to main page.
		* 
		**/


		vm.currentCkeck = function(){
			if ($rootScope.currentObject.linkURI === undefined ){
				$location.path("/");
			}
			else {

				vm.getObj();
			}
		};

		// vm.currentCkeck = function(){
		// 	if (angular.isUndefined($rootScope.currentObject.linkURI) ){
		// 		$location.path("/");
		// 		console.log ("redirected");
		// 	}
		// 	else {

		// 		vm.getObj();
		// 	}
		// };

		/**
		* @ngdoc method
		* @name getObj
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from  currentCkeck() and setCurrentObj(). It sends an HTTP GET request
		* to retrieve data of the current object, which is going to be edited, or the resource to whom 
		* the user is going to create a new object. Then it stores the response data to the variable 
		* objs and calls the functions find() and findReturnUri().
		**/

		vm.getObj = function(){
			
			$http({
				method : 'get',
				url : $rootScope.currentObject.linkURI,
				headers : SignIn.headers
			})
			.then(function(response){
				vm.objs = response.data;
				vm.find();
				vm.findReturnUri();
			});
		
		};

		
		
		vm.parsedTable=YamlParse.parsedTable;
		// vm.parsedTable=YamlParse.parsejson();

		/**
		* @ngdoc method
		* @name find
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from getObj() and request() functions. It uses the uri of the current
		* resource and the parsedTable, which has the information from the yaml file in a json format. 
		* S-case generates apis whose uris end with the name of the current resourse or with its id.
		* So after comparing the uri ending whith the information f the parsedTable, it can recognize 
		* the resourse an its properties. After that it creates a form object which is used to generate 
		* the form and will contain the values of the current resource. Then formType and formReq arrays 
		* are created to store the information about the type of the resource's properties and if they are 
		* required. Finally it calls the function passArguments().
		**/

		vm.find = function(){
			for (i = 0 ; i<vm.parsedTable.length; i++){
				var y = vm.parsedTable[i].Name;
				var k =new RegExp( y +'\/\\d{1,4}$');
				if (k.test(vm.currentObject.linkURI) || vm.currentObject.linkURI.endsWith(y) ){
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
					if (vm.parsedTable[i].Features.embededObjects){
				// console.log(vm.parsedTable[i].Features.embededObjects)
						vm.embeded = true;
						vm.embededType = vm.parsedTable[i].Features.embededType.trim();
						vm.embededProperty = vm.parsedTable[i].Features.embededProperty.trim();
						console.log(vm.embededType);
						vm.setEmbededMessage();
					}
					vm.passArguments ();
				}
			}
		};

		vm.setEmbededMessage= function(){
			// vm.viewObj = vm.objs;
			angular.forEach(vm.formObj, function(key,atr){
				// console.log(atr+" , '" + vm.embededProperty+"'")
				// if (vm.embeded){
					console.log(atr + ", " + vm.embededProperty)
					if (atr === vm.embededProperty){
						switch(vm.embededType.trim()){
							case 'image': 
								$scope.embededMessage = "Fill in the Image's Url ";
								break;
							case 'video':
								$scope.embededMessage = "Fill in the Video's Url ";
								break;
							case 'code':
								$scope.embededMessage = "Fill in the Code File's Url or path";
								break;
							case 'map':
								$scope.embededMessage = "Fill in the comma separated values for Latitude and Longitude (Lat,Long) ";

							}

					}
			// }

			});
		};

		/**
		* @ngdoc method
		* @name passArguments
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from the find() function. It creates a loop for every attribute 
		* of the form object and checks if the current object has the same. If it does the attribute's
		* value passes to corresponding one of the formObj.
		*
		**/

		vm.passArguments = function(){
			
  			for (var key in vm.formObj) {
  				
			    if(vm.objs.hasOwnProperty(key) ) {
			      vm.formObj[key] = vm.objs[key];
			    }
			  }

					 
		};

		/**
		* @ngdoc method
		* @name setCurrentObj
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from request() and return() functions. It stores the current object 
		* to the rootScope as previousObj so it will be able to redirect back after the submission of the form. 
		* Then it stores the new object to the current of the rootScope. Finaly it calls the getObj() function.
		**/

		vm.setCurrentObj= function(obj){
			$rootScope.previusObj = vm.currentObject;
			$rootScope.currentObject = obj;
			CurrentOb.set(obj);
			// vm.objUrl = $rootScope.currentObject.linkURI;
			// vm.getObj();
		};


		/**
		* @ngdoc method
		* @name request
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from the user when he clicks the submit button of the form at the edit.html file.
		* It uses the current object of the rootScope to define the http method and the uri, to make the request.
		* After a successful request it stores the response data to the variable objs , shows a notification based on 
		* the method type and finaly redirects to /view page. 
		* If there is an error response ocode of 401 or 403 it shows a notification for the user to sign in and logs the error.
		**/
	
		vm.request = function(){
			$http({
				method : $rootScope.currentObject.linkVerb,
				url : $rootScope.currentObject.linkURI,
				headers : SignIn.headers,
				data: vm.formObj
			})
			.then(function(response){
				vm.objs = response.data;
				// vm.find();
				if($rootScope.currentObject.linkVerb == 'POST'){
					Notification("Succesfully Created! ");
				}
				else if($rootScope.currentObject.linkVerb == 'PUT'){
					Notification("Succesfully Updated! ");
				}
				vm.setCurrentObj(vm.returnObj);
				// $location.path("/view");
				vm.return();
			console.log(vm.formObj);
			})
			.catch(function(error){
				console.log(error);
				if (error.status == '403' || '401'){
					Notification.error({message: 'Please Sign In to complete this action'});
				}
			});
		};
		   
		/**
		* @ngdoc method
		* @name setAction
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from when the controller first runs and defines what it will be written 
		* on the submit button of the form, based on the linkVerb of the current object.
		*
		**/


		vm.setAction = function(linkVerb){
			if (linkVerb == "POST") { vm.actionbutton = "create"; }
			else if (linkVerb == "PUT") { vm.actionbutton = "update" ;}
			else if (linkVerb == "DELETE") { vm.actionbutton = "delete" ;}
			else if (linkVerb == "GET") { vm.actionbutton = "" ;}
		};


		/**
		* @ngdoc method
		* @name findReturnUri
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from the getObj() function after the current object is defined, to find the uri 
		* of the parent in case the user wants to return to it. if the resource uri ends with the id it passes the 
		* uri to the returnUri variable else if ends with the resources name it passes the previousObj of the 
		* rootScope.
		**/

		vm.findReturnUri=function(){
			angular.forEach(vm.objs.linklist, function(obj){
				if (obj.linkVerb == "GET" ){
					if (obj.linkType == 'Parent'){
						var uri = obj.linkURI.split("/");
						var uriEnding = uri[uri.length-1];
						if (!isNaN(uriEnding)){
							vm.returnUri = obj.linkURI;	
							vm.returnObj = obj;		
							return;
						}
						else if (obj.linkURI == config.apiUrl){
							vm.returnUri = obj.linkURI;	
							vm.returnObj = obj;	
						}
						else if (isNaN(uriEnding)){
							vm.returnUri = $rootScope.previusObj.linkURI;	
							vm.returnObj = $rootScope.previusObj;	
							// console.log(returnUri)
						}
					}
					else if (obj.linkType == 'Sibling'){
						if (obj.linkURI == config.apiUrl){
							vm.returnUri = obj.linkURI;	
							vm.returnObj = obj;
						}	
					}
				}
			});
		};

		/**
		* @ngdoc method
		* @name return
		* @methodOf myApp.controller:editCtrl
		* @description
		*
		*This method is called from the user when he clicks the cancel button and wants to return back to the 
		* view of the previous object. It sets the object to which it going to redirect as current and redirects.
		**/

		vm.return= function(){
					if (vm.returnObj.linkURI == config.apiUrl){
						vm.setCurrentObj(vm.returnObj);
						$location.path( "/" );
					}
					else {
						vm.setCurrentObj(vm.returnObj);
						// vm.children2 = [];
						//  	$scope.embededUri = '';
						// 	vm.embededType ='';
						// 	vm.embeded = false;
						// 	vm.embededProperty ='';
						$location.path( "/view" );
					}
				};
		vm.currentCkeck();
		vm.setAction(vm.currentObject.linkVerb);
	}]);