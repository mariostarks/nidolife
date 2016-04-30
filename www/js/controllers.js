angular.module('app.controllers', [])

.controller('mainCtrl', function($rootScope) {
    $rootScope.bodyClass = "";
})

.controller('addPostUploadCtrl', function($rootScope) {
    $rootScope.bodyClass = "";
})

.controller('menuCtrl', function ($scope, $window, $localStorage) {
	//var devWidth = 0;
   // Set photo if exists
    $scope.getPhoto = function() {
        return $localStorage.user.photo;
    }; 
	$scope.devWidth = (($window.innerWidth > 0) ? $window.innerWidth : screen.width);
})

.controller('homeCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})

.controller('uploadPhotoCtrl', function ($state, AuthService, $rootScope, $scope, Restangular, $localStorage) {
    console.log(JSON.stringify($localStorage.userQuery));
    $rootScope.bodyClass = "";
    Restangular.all("users").getList({ filter: JSON.stringify($localStorage.userQuery) }).then(function (users) {
        $rootScope.user = users[0];
        $rootScope.image = {
           originalImage: '',
           croppedImage: ''
        };

        // Upload & Crop Image Functionality
        var handleFileSelect=function(evt) {
          var file=evt.currentTarget.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            $rootScope.$apply(function($rootScope){
              $rootScope.image.originalImage=evt.target.result;
            });
          };
          reader.readAsDataURL(file);
        };

        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
        
        // Save Photo
        $rootScope.savePhoto = function() {
            $rootScope.$watch('user', function(){
                $rootScope.user.photo = $rootScope.image.croppedImage;
                $localStorage.user.photo = $rootScope.image.croppedImage;
            });

            $rootScope.user.save().then( function(resp) {
                console.log(resp);
                $state.go('nido.account', {}, {reload: true});
            }, function() {
                console.log('There was an error saving.');
            }); 
        };

    });


})
      
.controller('loginCtrl', function (Backand, $state, $rootScope, LoginService, $localStorage, Restangular, $localStorage) {
    $rootScope.bodyClass = "";
    var login = this;

    function gotoSignup() {
    	$state.go('signup');
    }

    function signin() {
        LoginService.signin(login.email, login.password)
            .then(function () {
                onLogin();
            }, function (error) {
            	login.error = error.error_description;
                console.log(error)
            })
    }

    function anonymousLogin() {
        LoginService.anonymousLogin();
        onLogin();
    }

    function onLogin() {
        $rootScope.$broadcast('authorized');
        login.username = Backand.getUsername();
        /* Params used to query API */
        $localStorage.userQuery = {}; 
        $localStorage.userQuery['value'] = login.username;
        $localStorage.userQuery['fieldName'] = "email"; 
        $localStorage.userQuery['operator'] = "contains";

        Restangular.all("users").getList({ filter: JSON.stringify($localStorage.userQuery) }).then(function (users) {
            $localStorage.user = users[0];
        }); 

        $state.go('nido.activityFeed');
	}

    function signout() {
        LoginService.signout()
            .then(function () {
                //$state.go('tab.login');
                $rootScope.$broadcast('logout');
                $state.go($state.current, {}, {reload: true});
            })

    }

    function socialSignIn(provider) {
        LoginService.socialSignIn(provider)
            .then(onValidLogin, onErrorInLogin);

    }

    function socialSignUp(provider) {
        LoginService.socialSignUp(provider)
            .then(onValidLogin, onErrorInLogin);

    }

    onValidLogin = function(response){
        onLogin();
        login.username = response.data;
    }

    onErrorInLogin = function(rejection){
        login.error = rejection.data;
        $rootScope.$broadcast('logout');

    }


    login.username = '';
    login.error = '';
    login.signin = signin;
    login.signout = signout;
    login.anonymousLogin = anonymousLogin;
    login.socialSignup = socialSignUp;
    login.socialSignin = socialSignIn;

})
   
.controller('signupCtrl', function (Backand, $state, $rootScope, LoginService) {
    $rootScope.bodyClass = "";
    var vm = this;

    vm.signup = signUp;

    function signUp(){
        vm.errorMessage = '';

        LoginService.signup(vm.firstName, vm.lastName, vm.email, vm.password, vm.again)
            .then(function (response) {
                // success
                onLogin();
            }, function (reason) {
                if(reason.data.error_description !== undefined){
                    vm.errorMessage = reason.data.error_description;
                }
                else{
                    vm.errorMessage = reason.data;
                }
            });
    }


    function onLogin() {
        $rootScope.$broadcast('authorized');
        $state.go('nido.uploadPhoto');
    }


    vm.email = '';
    vm.password ='';
    vm.again = '';
    vm.firstName = '';
    vm.lastName = '';
    vm.errorMessage = '';
})
   
.controller('profileCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('buddyProfileCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('buddiesCtrl', function($scope) {

})
   
.controller('challengesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('messagesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('accountCtrl', function (Backand, $scope, $rootScope, $localStorage, Restangular) {
    $rootScope.bodyClass = "";
    $scope.getPhoto = function() {
        return $localStorage.user.photo;
    }; 
    /*
    Restangular.all("users").getList({ filter: JSON.stringify($localStorage.userQuery) }).then(function (users) {
        $scope.user = users[0];
    });
*/
    //console.log($scope.user.photo);
   // Set photo if exists
    //$rootScope.user = {};
    //$rootScope.user.photo = $localStorage.user.photo;
})
   
.controller('signoutCtrl', function($scope) {

})
   
.controller('addBuddyCtrl', function($scope) {

})
   
.controller('newMessageCtrl', function($scope) {

})
   
.controller('readMessageCtrl', function($scope) {

})
   
.controller('myPhotoCtrl', function($scope) {

})
   
.controller('createNewChallengeCtrl', function($scope) {

})
   
.controller('challengeGroupCtrl', function($scope) {

})
   
.controller('activityFeedCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "add-item";
})
 