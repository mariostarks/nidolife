angular.module('app.controllers', [])

.controller('mainCtrl', function($rootScope) {
    $rootScope.bodyClass = "";
})

.controller('addPostUploadCtrl', function ($state, AuthService, $rootScope, $scope, Restangular, $localStorage, $http, Backand, PhotosModel) {
    var _self = this; 

    $rootScope.post_caption = '';

    var post = {}; //object for new post being created 

    $rootScope.bodyClass = "";
    $rootScope.post = {
       originalImage: '',
       croppedImage: ''
    };

    var baseUrl = '/1/objects/';
    var baseActionUrl = baseUrl + 'action/'
    var objectName = 'photos';
    var filesActionName = 'files';

    // Upload & Crop Image Functionality
    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $rootScope.$apply(function($rootScope){
          $rootScope.post.originalImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#post-fileInput')).on('change',handleFileSelect);
    
    // File Storage Save & DB CREATE 
    $rootScope.save = function() {
        var post_filename = $localStorage.user.id + '-post-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6) + '.png';
        upload(post_filename, $rootScope.post.croppedImage).then(function(res) {
            $scope.imageUrl = res.data.url;
            console.log($scope.imageUrl);

            // Construct Post Object 
            post.data = $scope.imageUrl;
            post.caption = $rootScope.post_caption;
            post.created = Date.now().toString(); 
            post.user = $localStorage.user.id;  
    
            create(post);

        }, function(err){
            console.log(err.data);
        });


    };

    function create(object) {
        PhotosModel.create(object)
            .then(function (result) {
                console.log(result);
                $state.go('nido.activityFeed', {}, {reload: true}); 
            });
    }
    
    function upload(filename, filedata) {
        return $http({
          method: 'POST',
          url : Backand.getApiUrl() + baseActionUrl + objectName,
          params:{
            "name": filesActionName
          },
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "filename": filename,
            "filedata": filedata.substr(filedata.indexOf(',') + 1, filedata.length) //need to remove the file prefix type
          }
        });
    };

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

.controller('uploadPhotoCtrl', function ($state, AuthService, $rootScope, $scope, Restangular, $localStorage, $http, Backand) {
    console.log(JSON.stringify($localStorage.userQuery));
    $rootScope.bodyClass = "";
    var baseUrl = '/1/objects/';
    var baseActionUrl = baseUrl + 'action/'
    var objectName = 'photos';
    var filesActionName = 'files';
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
            var photoname = 'profile-photo-' + $rootScope.user.id + '.png';
            upload(photoname, $rootScope.image.croppedImage).then(function(res) {
                $scope.imageUrl = res.data.url + "?" + Date.now();
                $rootScope.user.photo = $scope.imageUrl; 
                $localStorage.user.photo = $scope.imageUrl;
                console.log($scope.imageUrl);
            }, function(err){
                console.log(err.data);
            });

            $rootScope.user.save().then( function(resp) {
                console.log(resp);
                $state.go('nido.account', {}, {reload: true});
            }, function() {
                console.log('There was an error saving.');
            }); 
        };

        function upload(filename, filedata) {
            // By calling the files action with POST method in will perform 
            // an upload of the file into Backand Storage
            return $http({
              method: 'POST',
              url : Backand.getApiUrl() + baseActionUrl +  objectName,
              params:{
                "name": filesActionName
              },
              headers: {
                'Content-Type': 'application/json'
              },
              // you need to provide the file name and the file data
              data: {
                "filename": filename,
                "filedata": filedata.substr(filedata.indexOf(',') + 1, filedata.length) //need to remove the file prefix type
              }
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
            $rootScope.user = $localStorage.user; 
            console.log($rootScope.user.photo);
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
   
.controller('accountCtrl', function (Backand, $scope, $rootScope, $localStorage, Restangular, UsersModel) {
    var _self = this;
    var user = {}; 

    getUser(); 

    //console.log($scope.user);

    $rootScope.bodyClass = "";
    $scope.getPhoto = function() {
        return $localStorage.user.photo;
    };

    function getUser() {
        UsersModel.fetch($localStorage.user.id)
            .then(function (result) {
                $scope.user = result.data;
                if ($scope.user.birthdate) {
                    $scope.user.birthdate = new Date($scope.user.birthdate);
                }
                console.log($scope.user); 
            });
    }

    $scope.updateAccount = function() {
        UsersModel.update($scope.user.id, $scope.user)
            .then(function (result) {
                console.log(result); 
            });
    };

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
 