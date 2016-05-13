// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ngCookies', 'angular-toArrayFilter', 'ionic', 'backand', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngImgCrop', 'ngLodash', 'restangular', 'ngStorage', 'angular-loading-bar'])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
}])
.config(function ($provide, BackandProvider,  $stateProvider, $urlRouterProvider, $httpProvider, RestangularProvider) {
    BackandProvider.setAppName('nidolife');
    BackandProvider.setSignUpToken('a1435da8-9411-46b1-897a-77623eb9599c');
    BackandProvider.setAnonymousToken('589837be-36cf-4ec0-8871-5d947dcd670a');
    $httpProvider.interceptors.push('APIInterceptor');

    RestangularProvider.setBaseUrl('https://api.backand.com/1/objects');
    RestangularProvider.setDefaultHeaders({'AnonymousToken': '589837be-36cf-4ec0-8871-5d947dcd670a'});
    // add a response intereceptor
    RestangularProvider.setResponseExtractor(function(response, operation) {
        return response.data;
    });


   $provide.decorator('$state', function($delegate, $stateParams) {
        $delegate.forceReload = function() {
            return $delegate.go($delegate.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
            });
        };
        return $delegate;
    });
    /*
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      // .. to look for getList operations
      if (operation === "getList") {
        // .. and handle the data and meta data
        extractedData = data.data;
        //extractedData.meta = data.data.meta;
      } else {
        extractedData = data.data;
      }
      //console.log(data.data);
      return extractedData;
    });
*/
    
})

.run(function($ionicPlatform, $rootScope, $state, LoginService, Backand) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    var isMobile = !(ionic.Platform.platforms[0] == "browser");
    Backand.setIsMobile(isMobile);
    Backand.setRunSignupAfterErrorInSigninSocial(true);

    function unauthorized() {
        console.log("user is unauthorized, sending to login");
        $state.go('login');
    }

    function signout() {
        LoginService.signout();
    }

    $rootScope.$on('unauthorized', function () {
        unauthorized();
    });

    $rootScope.$on('authorized', function(){
        //$state.go('nido.activityFeed', {}, {reload: "true"});
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        if (toState.name == 'login') {
            signout();
        }
        else if (toState.name != 'login' && Backand.getToken() === undefined) {
            unauthorized();
        }
    });
  });
})

