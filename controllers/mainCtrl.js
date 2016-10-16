/**
* @ngdoc controller
* @name myApp.controller:mainCtrl
* @description:
*
*This is the controller respnsible to show the list of the resourse's options for the user. 
* It divides the the options in two lists, the first is the children of the resource and the other, 
* which can be found if user clicks the "More Options" button, is the list of the available CRUD actions.
* 
**/

app.controller('mainCtrl',['config','$http','$q','$scope','$rootScope','$location', 'YamlParse', 'Notification','SignIn','$mdSidenav','CurrentOb',
	 function(config, $http,$q,$scope,$rootScope,$location, YamlParse, Notification, SignIn,$mdSidenav,CurrentOb){
		
		var vm = this;
		
		
		vm.objs= {};
		// vm.formObj = {};
		// vm.formType = {};
		vm.children= [];
		$scope.serviceName = config.serviceName;
		// $rootScope.currentObject = {};


		/**
		* @ngdoc method
		* @name currentCheck
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called first when the controller is been referenced to check if 
		* the current object is defined. If the object is defined it calls getObj() 
		* else it defines the current object from the main resource uri (apiUrl) which is given in the conf.js file.
		* 
		**/

		vm.firstcall = function(){
			
				vm.currentObject = $rootScope.currentObject;
				vm.currentObject = CurrentOb.test();
				if( angular.isUndefined(vm.currentObject.linkURI)){

					vm.objUrl = config.apiUrl;

					// console.log(vm.objUrl);
					vm.getObj();
				}
				else {
					vm.objUrl= $rootScope.currentObject.linkURI;
					// console.log (vm.objUrl);
					// vm.find(vm.parsedTable);
					vm.getObj();
				}
		};
		 
		

		
		/**
		* @ngdoc method
		* @name getObj
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from  firstcall() and setCurrentObj(). It sends an HTTP GET request
		* to retrieve data of the current object. Then it stores the response data to the variable 
		* objs and calls the function getChildren().
		**/

		vm.getObj = function(){
			
			$http({
				method : 'get',
				url : vm.objUrl,
				headers : SignIn.headers
			})
			.then(function(response){
				
				vm.objs = response.data;

				// vm.find(vm.parsedTable);
				vm.getChildren(response.data.linklist);
			}).catch(function(error){
				console.log(error);
			});
		};

		/**
		* @ngdoc method
		* @name getChildren
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from  getObj() function. It creates a loop and sends an HTTP GET request
		*  for every child of the resource and then stores children to the children[] array. 
		* When the loop finishes, the childImg() function is called.
		*
		**/

		vm.getChildren = function(linklist){
			var promises = [];
			angular.forEach(linklist, function(link){
				if (link.linkType == "Child")
				{
				var deferred = $q.defer();
					$http({
						method : 'get',
							url : link.linkURI,
							headers : SignIn.headers
						})
					.then(function(response){
						var child=response.data;
						vm.children.push(child);
						deferred.resolve();
					});
					promises.push(deferred.promise);
				}
			});
			$q.all(promises).then(function(){
				vm.childImg();
			});
		};

		/**
		* @ngdoc method
		* @name childImg
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from  getChildren() function. It creates a loop and sends an HTTP GET request
		*  for every child in the children[] array. Then it creates another loop for the attributes of each child
		* and check if the attribute is an image. When the loops finsh it calls the objImage() function.
		*
		**/
			
		vm.childImg = function(children){
			
			var promises = [];
			angular.forEach(vm.children, function(child){
						var deferred = $q.defer();
				angular.forEach(child, function(key){
					if (typeof key == 'string'){
						var imgFormats = ['jpg','jpeg','gif','png','tif','bmp','ico'];
						for (i=0;i<imgFormats.length;i++){
							if(key.includes(imgFormats[i])){
								child.imageUrl2=key;
							}
						}
					}
				});
								deferred.resolve();
				promises.push(deferred.promise);
			});
			$q.all(promises).then(function(){
				vm.objImage();
			});
		};

		/**
		* @ngdoc method
		* @name objImage
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from  childImg() function. It creates a triple loop to pass to every child 
		* a new attribute which is the imageUrl and so it can preview the images. 
		**/

		vm.objImage= function(){
			angular.forEach(vm.objs.linklist, function(obj){
				angular.forEach(vm.children,function(child){
					angular.forEach(child,function(key){
						if (key == obj.linkRel)
							obj.imageUrl = child.imageUrl2;
					});
				});
			});
		};

		
		/**
		* @ngdoc method
		* @name setCurrentObj
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from the actionCheck() function. It stores the new object to the current of the rootScope.
		* and the uri of the current to the variable objUrl which is used from the getObj function to make the 
		* GET request. Finaly it calls the getObj() function.
		**/   

		vm.setCurrentObj= function(obj){
			$rootScope.previusObj = $rootScope.currentObject;
			$rootScope.currentObject = obj;
			CurrentOb.set(obj);
			// console.log(obj)
			vm.objUrl = $rootScope.currentObject.linkURI;
			// vm.find(vm.parsedTable);
			vm.getObj();
		};


		/**
		* @ngdoc method
		* @name actionCheck
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from the user when he chooses one of the options on the list of the given CRUD actions.
		* after the check for the CRUD action, it sets the chosen resource as current and selects
		* the page to which is going to redirect to complete the request.
		*
		**/   

		vm.actionCheck = function(obj){
			if (obj.linkVerb == "POST") { vm.setCurrentObj(obj); $location.path("/edit"); }
			else if (obj.linkVerb == "PUT") {vm.setCurrentObj(obj); $location.path("/edit"); }
			else if (obj.linkVerb == "DELETE") { vm.deleteWarn(obj);}
			else if (obj.linkVerb == "GET") { 
				var uri = obj.linkURI.split("/");
				var uriEnding = uri[uri.length-1];
				if (isNaN(uriEnding)){
					vm.setCurrentObj(obj);
					if (obj.linkURI ===  config.apiUrl ){ // add an if statement for an alternative of the main route
						$location.path("/") ;			  // for example if (obj.linkURI == "*/specificresource"){ 
					}									  // location.path("/specific") }
					else{								  // else {location.path("/")}
						$location.path("/list");		  // and add the route to the appYaml.config in the appYaml.js file
					}

				}
				else {
					vm.setCurrentObj(obj);       // add an if statement for an alternative of the view route
				 	vm.children2 = [];			 // for example if (obj.linkURI == "*/specificresource/id"){ 
				 	$scope.embededUri = '';	     // location.path("/otherroute") }
					vm.embededType ='';          // else {location.path("/view") }
					vm.embeded = false;          // and add the route to the appYaml.config in the appYaml.js file
					vm.embededProperty ='';
				 	$location.path("/view");
				}
			}
		};

		/**
		* @ngdoc method
		* @name deleteWarn
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from the actionCheck() function. It shows a warning message to the user and askes if 
		* he realy wants to delete the resource. If the user agrees it calls the delete() function to complete the action.
		*
		**/  

		vm.deleteWarn = function(obj){
			var confirm = $mdDialog.confirm()
	          .title('Are you sure you want to delete this ?')
	          .ok('Please do it!')
	          .cancel('Cancel');
		    $mdDialog.show(confirm).then(function() {
		      vm.closeSidebar();
		       vm.delete();
		    });
		};

		/**
		* @ngdoc method
		* @name delete
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from the deleteWarn() function after the user agrees to delete the selected resource. 
		* It sends an HTTP Delete request for the resource and redirect to the view of the previous resource.
		**/  

		vm.delete = function(){
			$http({
				method : 'delete',
				url : $rootScope.currentObject.linkURI,
				headers : SignIn.headers,
				data: vm.formObj
			})
			.then(function(response){
				vm.objs = response.data;
				vm.find($rootScope.currentObject.linkURI);
				vm.setCurrentObj($rootScope.previusObj);
				$location.path("/view");
			})
			.catch(function(error){
				console.log(error);
				if (error.status == '403' || '401'){
					Notification.error("Please Sign In to complete this action");
				}
			});
		};

		/**
		* @ngdoc method
		* @name openSidebar
		* @methodOf myApp.controller:mainCtrl
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
		* @methodOf myApp.controller:mainCtrl
		* @description
		*
		*This method is called from the user when he clicks the "Cancel" button of the sidebar and closes it. 
		**/ 
		vm.closeSidebar = function(){
			$mdSidenav('left').close();
		};

		$scope.$on('GoHome',function(event){
			vm.firstcall();
		});
	vm.firstcall();
}]	);