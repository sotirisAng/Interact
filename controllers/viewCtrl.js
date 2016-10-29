/**
* @ngdoc controller
* @name myApp.controller:viewCtrl
* @description
*
* This is the controller responsible for visualising the properties of the current resource. 
* 
**/
app.controller('viewCtrl',['config','$http','$scope','$rootScope','$q','$location','$sce','$route','SignIn', 'YamlParse','$mdDialog' , '$mdSidenav','Notification', 'CurrentOb',
 function(config, $http,$scope,$rootScope,$q,$location,$sce,$route, SignIn, YamlParse, $mdDialog, $mdSidenav, Notification, CurrentOb){


		var vm = this;

		// vm.formObj = {};
		// vm.formType = {};
		// vm.table = [];
		// vm.currentObject = $rootScope.currentObject;
		vm.children=[];
		vm.children2=[];
		
		$scope.embededUri = '';
		vm.embededType ='';
		vm.embeded = false;
		vm.embededProperty ='';

		/**
		* @ngdoc method
		* @name currentCheck
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called first when the controller is been referenced to check if 
		* there is an object to be shown. If the object is defined it calls getObj() 
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
		// 	if (angular.isUndefined($rootScope.currentObject.linkURI)){
		// 		$location.path("/");
		// 	}
		// 	else {
		// 		vm.getObj();
		// 	}
		// };

		
		/**
		* @ngdoc method
		* @name getObj
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from  currentCkeck() and setCurrentObj(). It sends an HTTP GET request
		* to retrieve data of the current resource, which is going to be shown. 
		* Then it stores the response data to the variable objs and calls the functions find(), findReturnUri()
		* getChildrenList() and setEmbededObj(). If there is an error it is logs and redirect to main page.
		*
		**/

		vm.getObj = function(){
			$http({
				method : 'get',
				url : $rootScope.currentObject.linkURI,
				headers : SignIn.headers
			})
			.then(function(response){
				vm.objs = response.data;
				vm.find($rootScope.currentObject.linkURI);
				vm.embededCheck();
				vm.findReturnUri();
				vm.getChildrenList();
				// vm.setEmbededObj();
			}).catch(function(error){
				console.log(error);
				$location.path("/");
			});
		
		};

		// vm.request = function(){
		// 	$http({
		// 		method : $rootScope.currentObject.linkVerb,
		// 		url : $rootScope.currentObject.linkURI,
		// 		headers : SignIn.headers,
		// 		data: vm.formObj
		// 	})
		// 	.then(function(response){
		// 		vm.objs = response.data;
		// 		vm.find($rootScope.currentObject.linkURI);
		// 		vm.setCurrentObj($rootScope.previousObj);
		// 		$location.path("/view");
		// 	});
		// };

		/**
		* @ngdoc method
		* @name delete
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from the deleteWarn() function after the user agrees to delete the selected resource. 
		* It sends an HTTP Delete request for the resource and redirect to the view of the previous resource.
		**/  

		vm.delete = function(obj){
			$http({
				method : 'delete',
				url : obj.linkURI,
				headers : SignIn.headers,
				// data: vm.formObj
			})
			.then(function(response){
				vm.objs = response.data;
				vm.find($rootScope.currentObject.linkURI);
				
				vm.setCurrentObj(vm.returnObj);
				var uri = $rootScope.currentObject.linkURI.split("/");
				var uriEnding = uri[uri.length-1];
				if (isNaN(uriEnding)){
					if ($rootScope.currentObject.linkURI ===  config.apiUrl ){
						$location.path("/") ;
					}
					else{
						$location.path("/list");
					}

				}
				else {

				 	$location.path("/view");
				}
			})
			.catch(function(error){
				console.log(error);
				if (error.status == '403' || '401'){
					Notification.error("Please Sign In to complete this action");
				}
			});
		};

		
		// vm.parsedTable=YamlParse.parsejson();
		vm.parsedTable=YamlParse.parsedTable;


		/**
		* @ngdoc method
		* @name embededCheck
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from the getObj() function. It uses the uri of the current
		* resource and the parsedTable, which has the information from the yaml file in a json format. 
		* S-case generates apis whose uris end with the name of the current resourse or with its id.
		* So after comparing the uri ending whith the information f the parsedTable, it can recognize 
		* the resourse an its properties. After it finds the resource in the parsed table, it searches the properties 
		* of the resource for any embeded objects that as to be shown, and stores the the type and the spesific property
		* at the corresponding variables embededType and embededProperty.
		**/  
		
		vm.embededCheck = function(){
			var deferred = $q.defer();
			for (i = 0 ; i<vm.parsedTable.length; i++){
				var y = vm.parsedTable[i].Name;
				var k =new RegExp( y +'\/\\d{1,4}$');
				if (k.test($rootScope.currentObject.linkURI) || $rootScope.currentObject.linkURI.endsWith(y) ){
					if (vm.parsedTable[i].Features.embededObjects){
				// console.log(vm.parsedTable[i].Features.embededObjects)
						vm.embeded = true;
						vm.embededType = vm.parsedTable[i].Features.embededType.trim();
						vm.embededProperty = vm.parsedTable[i].Features.embededProperty.trim();
						// console.log(vm.embededType);
					}
				}
			}
			deferred.resolve();
			vm.setEmbededObj();
		};

		/**
		* @ngdoc method
		* @name find
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from getObj(),getChildrenList() and delete() functions. It uses the uri of the current
		* resource and the parsedTable, which has the information from the yaml file in a json format. 
		* S-case generates apis whose uris end with the name of the current resourse or with its id.
		* So after comparing the uri ending whith the information f the parsedTable, it can recognize 
		* the resourse an its properties. 
		*
		**/

		vm.find = function(linkURI){
			for (i = 0 ; i<vm.parsedTable.length; i++){
				var y = vm.parsedTable[i].Name;
				var k =new RegExp( y +'\/\\d{1,4}$');
				if (k.test(linkURI) || linkURI.endsWith(y) ){
					// $rootScope.previousState = linkURI.split(k)[0];
					vm.name = y;
					
				}
			}
		};

		
		/**
		* @ngdoc method
		* @name setCurrentObj
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from request() and return() functions. It stores the current object 
		* to the rootScope as previousObj so it will be able to redirect back after the submission of the form. 
		* Then it stores the new object to the current of the rootScope. Finaly it calls the getObj() function.
		**/

		vm.setCurrentObj= function(obj){
			var c= obj;
			$rootScope.previousObj = $rootScope.currentObject;
			$rootScope.currentObject = obj;
			CurrentOb.set(c);
			vm.objUrl = $rootScope.currentObject.linkURI;
			vm.getObj();

		};

		/**
		* @ngdoc method
		* @name getChildrenList
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from  getObj() function. The perpose of this function is to find the resource's 
		* children and divide them to categories. First it creates tow arrays, one for the children and one for the 
		* categories. Then it start a loop for every child of the current resource and fills the categories array
		* and adds a new attribute for the category to the children in the array. 
		*
		**/

		vm.getChildrenList =function(){
			var c = 0;
			vm.children2=[];
			vm.childCategories = [];
			// console.log("got children")
			// console.log(vm.objs)
			$scope.hasChildren = false;
			angular.forEach(vm.objs.linklist, function(link){
				if ( link.linkType == "Child" && link.linkVerb == "GET"){
					$scope.hasChildren = true;
					$http({
							method : 'get',
							url : link.linkURI,
							headers : SignIn.headers
						})
						.then(function(response){
							
							angular.forEach(response.data.linklist , function(child){
								if (child.idType !== '0'){
									vm.find(child.linkURI);
									var category = vm.name;
									child.category = category;
									vm.children2.push(child);

									if (vm.childCategories.length === 0){
										vm.childCategories.push(category);
									}
									if(vm.childCategories.indexOf(category) === -1) {
									  vm.childCategories.push(category);
									}
									
									if( vm.children.length === 0 ) {
										vm.children.push({'name': category, 'contents': []});
									}
									var newentry = true;
									for(i=0; i<vm.children.length; i++){
										if (vm.children[i].name == category){
											vm.children[i].contents.push(child);
											newentry = false;
										}
									}
									if(newentry){
										vm.children.push({'name': category, 'contents': []});
									}

								}
							});
							
						});
				}
			});
		};

		


		// vm.imgtest = function(src){
		// 	var imgFormats = ['jpg','jpeg','gif','png','tif','bmp','ico'];
		// 	for (i=0;i<imgFormats.length;i++){
		// 		if(src.endsWith(imgFormats[i])|| src.includes(imgFormats[i])){
		// 			vm.imageUrl=src;
		// 		}
		// 	}
		// };
		
		/**
		* @ngdoc method
		* @name setEmbededObj
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from  getObj() function. The perpose of this function is to declare
		* the type of the embeded object,if there is one, and add the the proper value to embededUri
		* varaible.
		*
		**/

		vm.setEmbededObj = function(){
			// vm.viewObj = vm.objs;
			angular.forEach(vm.objs, function(key,atr){
				// console.log(atr+" , '" + vm.embededProperty+"'")
				if (atr === vm.embededProperty.trim()){
				switch(vm.embededType.trim()){
					case 'image': 
						$scope.embededUri = key;
						break;
					case 'video':
						$scope.embededUri = $sce.trustAsResourceUrl(key);
						break;
					case 'code':
						
						// $scope.embededUri = $sce.trustAsResourceUrl(key);
						if(key){
						$http.get(key).then(function(response){
							$scope.embededUri = response.data;
						});
						}	
						break;
					case 'map':
						$scope.embededUri = $sce.trustAsResourceUrl("https://www.google.com/maps/embed/v1/view?zoom=12&center="+key+"&key=AIzaSyCKmqYCxEYZBk2mHtDCN95gcklDJm6RHlM");
				}
			}

			});
		};
		

		// vm.goBack = function () {
		//     window.history.back();
		// }

		/**
		* @ngdoc method
		* @name return
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from the user when he clicks the cancel button and wants to return back to the 
		* view of the previous object. It sets the object to which it going to redirect as current and redirects.
		**/

		vm.return= function(){
			if (vm.returnRoute === "main"){
				vm.setCurrentObj(vm.returnObj);
				$location.path( "/" );
			}
			else if(vm.returnRoute === "list"){
				vm.setCurrentObj(vm.returnObj);
				$location.path( "/list" );
			}
			else if(vm.returnRoute === "view") {
				vm.setCurrentObj(vm.returnObj);
				vm.children2 = [];
				 	$scope.embededUri = '';
					vm.embededType ='';
					vm.embeded = false;
					vm.embededProperty ='';
				$location.path( "/view" );
			}
		};

		/**
		* @ngdoc method
		* @name findReturnUri
		* @methodOf myApp.controller:viewCtrl
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
							vm.returnRoute= "view";
							// console.log(vm.returnUri)
							// break;
							return;
						}
						else if (obj.linkURI == config.apiUrl){
							vm.returnUri = obj.linkURI;	
							vm.returnObj = obj;
							vm.returnRoute = "main";
						}
						else if (isNaN(uriEnding)){
							if ($rootScope.previousObj.linkURI !== $rootScope.currentObject.linkURI){
								vm.returnUri = $rootScope.previousObj.linkURI;	
								vm.returnObj = $rootScope.previousObj;
								vm.returnRoute = "view";
							}
							// console.log(returnUri)
							else{
								vm.returnUri = obj.linkURI;	
								vm.returnObj = obj;
								vm.returnRoute = "list";
							}
						}
					}
					
				}
			});
		};

		// vm.urlCheck = function(obj){
		// 	if (obj.linkURI == config.apiUrl){
		// 		vm.setCurrentObj(obj);
		// 		$location.path( "/" );
		// 	}
		// 	else {
		// 		vm.setCurrentObj($rootScope.previousObj);
		// 		$location.path( "/view" );
		// 	}

		// };

		/**
		* @ngdoc method
		* @name actionCheck
		* @methodOf myApp.controller:viewCtrl
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
			else if (obj.linkVerb == "DELETE") {  vm.deleteWarn(obj);}
			else if (obj.linkVerb == "GET") { 
				var uri = obj.linkURI.split("/");
				var uriEnding = uri[uri.length-1];
				if (isNaN(uriEnding)){ 
					vm.setCurrentObj(obj);
					if (obj.linkURI ===  config.apiUrl ){ // add an if statement for an alternative of the main route
						$location.path("/") ;			  // for example if (obj.linkURI == "*/specificresource"){ 
					}									  // location.path("/specific") }
					else{								  // else {location.path("/")}
						$location.path("/list");		  // and add the route to the app.config in the app.js file
					}

				}
				else {
					vm.setCurrentObj(obj);       // add an if statement for an alternative of the view route
				 	vm.children2 = [];			 // for example if (obj.linkURI == "*/specificresource/id"){ 
				 	$scope.embededUri = '';	     // location.path("/otherroute") }
					vm.embededType ='';          // else {location.path("/view") }
					vm.embeded = false;          // and add the route to the app.config in the app.js file
					vm.embededProperty ='';
				 	$location.path("/view");  
				}
			}
			// vm.action = obj.linkVerb;
		};

		/**
		* @ngdoc method
		* @name deleteWarn
		* @methodOf myApp.controller:viewCtrl
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
		       vm.delete(obj);
		    });
		};

		/**
		* @ngdoc method
		* @name openSidebar
		* @methodOf myApp.controller:viewCtrl
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
		* @methodOf myApp.controller:viewCtrl
		* @description
		*
		*This method is called from the user when he clicks the "Cancel" button of the sidebar and closes it. 
		**/ 
		vm.closeSidebar = function(){
			$mdSidenav('left').close();
		};
		
		vm.currentCkeck();
	}]);