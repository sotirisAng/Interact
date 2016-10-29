	/**
	* @ngdoc service
	* @name myApp.service:YamlParse
	* @description:
	*
	*This is the service respnsible for reading and parsing the yaml files to json format, so the 
	* application would be able to detect the structure of the service, the available resources and 
	* their properties.
	**/

	app.service('YamlParse',function(config,$http,$q){

		var vm = this;
		
		vm.table = [];
		vm.parsedTable =[];

		/**
		* @ngdoc method
		* @name getschema
		* @methodOf myApp.service:YamlParse
		* @description
		*
		*This method sends an HTTP get request to retrieve the contents of the given yaml file and  
		* then calls calc() function to create a table with the json objects of the resources.
		* 
		**/ 

		vm.getschema = function(){
			return $http.get(config.yaml).then(function(response){
				var m =  vm.calc(response.data);
				for (i=0 ; i<m.length-1; i++){
				vm.table[i] = m[i+1];
				}
				// return vm.table;
			});
		};


		/**
		* @ngdoc method
		* @name calc
		* @methodOf myApp.service:YamlParse
		* @description
		*
		*This method is called from getschema function. It takes a string parameter with the contents 
		* of the yaml file. The contents of the yaml files produced by S-case have a specific structure
		* so this function is designed to parse only this specific type of yaml files. Each resource in 
		* the yaml starts with a specific string ("- !!eu.fp7.scase.inputParser.YamlResource"). Has 
		* a name, some features like if it is aalgorithmic or if it has a special attribute to be shown, 
		* lastly it's properties and related resources. Calc() first splits the string to resources divided 
		* by the string mentioned above, then each resource is splited to its rows and the name , features and
		* properties are defined. These three create an object for each resource and stored to the resources_table.
		**/ 

		vm.calc  = function(str){
			var resources = str.split("- !!eu.fp7.scase.inputParser.YamlResource");
			var resources_table = [];
			for (c=1; c<resources.length; c++){
				var resource_properties = resources[c].split("- ");
				var property_lines = [];
				var resource_name = resource_properties[0].split("\n");
				var resource_features = resource_properties[0].split("\n");
				var features =[]; 
				var featureTable= [];
				for (j=2; j<resource_features.length-3;j++){
					featureName = resource_features[j].split(": ")[0];
					featureValue = resource_features[j].split(": ")[1];
					featureTable +=  JSON.stringify(featureName.trim()) + ':' + JSON.stringify(featureValue) + ',';
				}
				featureName = resource_features[j].split(": ")[0];
				featureValue = resource_features[j].split(": ")[1];
				featureTable +=  JSON.stringify(featureName.trim()) + ':' + JSON.stringify(featureValue);
				var temp1 ;
				var prop_object;
				var i;
				var object_table ='{"Name": "' + resource_name[1].split(": ")[1].trim(); 
				object_table+= '",  "Properties" : [';
				if (resource_properties.length>1){
					for (j = 1 ; j< resource_properties.length-1; j++){
						property_lines = resource_properties[j].split("\n");
						prop_object = '{';
						for (i= 0; i < property_lines.length-2; i++){
							temp1 = property_lines[i].split(":");
							prop_object +=  JSON.stringify(temp1[0].trim()) + ":" + JSON.stringify(temp1[1].trim()) + ',';
						}
						temp1 = property_lines[i].split(":");
						prop_object +=  JSON.stringify(temp1[0].trim()) + ":" + JSON.stringify(temp1[1].trim()) + '}';
						object_table += prop_object + ',';

					}	
						property_lines = resource_properties[j].split("\n");
						prop_object = '{';
						for (i= 0; i < property_lines.length-4; i++){
							temp1 = property_lines[i].split(":");
							prop_object +=  JSON.stringify(temp1[0].trim()) + ":" + JSON.stringify(temp1[1].trim()) + ',';
						}
						temp1 = property_lines[i].split(":");
						prop_object +=  JSON.stringify(temp1[0].trim()) + ":" + JSON.stringify(temp1[1].trim());
						temp1 = property_lines[i+1].split(":");
						prop_object += '}],' + JSON.stringify(temp1[0].trim()) + ":" + JSON.stringify(temp1[1].trim()) ;
						object_table += prop_object +', "Features":{'+ featureTable+ '}}' ;
					}
					else { 
						object_table += '], "RelatedResources":' +'"'+ resource_properties[0].split("RelatedResources: ")[1].trim() + '"}';
					}
					resources_table[c] = object_table;
				}
			return resources_table;
		};

		/**
		* @ngdoc method
		* @name parsejson
		* @methodOf myApp.service:YamlParse
		* @description
		*
		*This method is called in .run() block when the application starts. It calls the getschema() function
		* and parses the given resource_table to json format so it can be uses from the rest of the application.
		*
		**/

		vm.parsejson= function(){
					// var deferred = $q.defer;
					vm.getschema().then(function(){
						for(i=0; i<vm.table.length; i++){
							// vm.initObject = vm.table[i];
							vm.parsedTable[i] = JSON.parse(vm.table[i]);
						}
						console.log(vm.parsedTable);
					});
				};
		});

	

	app.service('CurrentOb', function($rootScope){
		var vm=this;

		$rootScope.currentObject = {};
		$rootScope.previousObj = {};


		// vm.test = function(){
		// 	return $rootScope.currentObject;
		// };

		vm.set=function(obj){
			if(obj){
				$rootScope.currentObject = obj;
			}
		};
	});

	/**
	* @ngdoc service
	* @name myApp.service:SignIn
	* @description:
	*
	*This is the service is responsible for storing the user's credentials and create the headers for
	* the HTTP requests.
	**/

	app.service('SignIn',function($rootScope){
		var vm = this;

		// $rootScope.credentials = "" ;
		vm.credentials="";

		/**
		* @ngdoc method
		* @name createHeader
		* @methodOf myApp.service:SignIn
		* @description
		*
		*This method is called in the signIn function in the signInCtrl when the user is authenticated
		* and creates the header for further requests. 
		**/
		vm.createHeader = function(){
			vm.headers = {'Authorization': 'Basic ' + vm.credentials,
					'Content-Type': 'application/json'};
				};

		// vm.headers = {'Authorization': 'Basic ' + btoa('test' + ':' + '1234'),
					// 'Content-Type': 'application/json'};
		
		$rootScope.signedIn = false;
	});