/**
 * @ngdoc object
 * @name APP_CONFIG
 * @description
 * 
 * The user is able to  configure the application through 'config'. APP_CONFIG is injectable as constant.
 * apiUrl is the base url of the application
 * signInUrl is the url of the resource that the application sends the request to authenticate the user
 * yaml is the path to the yaml file
 * serviceName is the name of the running service
 */

app.constant('config', {
    // apiUrl: 'http://localhost:8080/wapoAdminToolApi2/api/accounts',
    // apiUrl: 'http://109.231.121.89:8080/reviews/api/account',
    apiUrl: 'http://109.231.121.89:8080/reviews/api/product',
    // signInUrl : 'http://localhost:8080/wapoAdminToolApi2/api/accounts/2/users',
    signInUrl : 'http://109.231.121.89:8080/reviews/api/account',
    // yaml : 'yaml/service2.yml',
    yaml : 'yaml/RestReviews.yaml',
    serviceName : 'Rest Reviews'
    // serviceName : 'wapoAdminTool'
});