angular.module('app.controllers', [])

.controller('mainCtrl', function($rootScope, $scope, $location) {
    $scope.addItemClass = function() {

        var bodyClasses = ''; 
        if ($location.path().replace("/", "").slice(0, -2)=='side-menu/activity') {
            bodyClasses = 'add-item'; 
        }
        if ($location.path().replace("/", "")=='side-menu/activity') {
            bodyClasses = 'add-item'; 
        }
        if ($location.path().replace("/", "")=='side-menu/activity/') {
            bodyClasses = 'add-item'; 
        }
        if ($location.path().replace("/", "")=='home') {
            bodyClasses = 'hide-nav-bar';
        }

        return bodyClasses;
    };
    $rootScope.bodyClass = "";
    $scope.$back = function() { 
        window.history.back();
    };
})

.controller('addPostUploadCtrl', function ($state, AuthService, $rootScope, $scope, Restangular, $localStorage, $http, Backand, PhotosModel) {
    var _self = this; 
    $scope.post = {}; //object for new post being created 
    $scope.post.caption = '';

    $rootScope.bodyClass = "";
    $scope.post = {
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
        $scope.$apply(function($scope){
          $scope.post.originalImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#post-fileInput')).on('change',handleFileSelect);
    
    // File Storage Save & DB CREATE 
    $rootScope.save = function() {
        var post_filename = $localStorage.user.id + '-post-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12) + '.png';
        upload(post_filename, $scope.post.croppedImage).then(function(res) {
            $scope.imageUrl = res.data.url;
            console.log($scope.imageUrl);

            // Construct Post Object 
            $scope.post.data = $scope.imageUrl;
            $scope.post.caption = $scope.post.caption;
            $scope.post.category = $scope.post.category;
            $scope.post.created = Date.now().toString(); 
            $scope.post.user = $localStorage.user.id;  
    
            create($scope.post);

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

.controller('menuCtrl', function ($scope, $window, $localStorage, $location) {
    var user_photo = '';
    $scope.user = $localStorage.user;
    console.log($localStorage.user); 
    $scope.getPhoto = function() {
        if($localStorage.user.photo) {
            user_photo = $localStorage.user.photo;
        }
        return user_photo;
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
      
.controller('loginCtrl', function (Backand, $state, $rootScope, LoginService, $localStorage, Restangular) {
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
            //console.log($rootScope.user.photo);
            $state.go('nido.activityFeed', {id: $localStorage.user.id}, {reload: true});

        }); 

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
   
.controller('signupCtrl', function (Backand, $state, $rootScope, LoginService, $localStorage, Restangular) {
    $rootScope.bodyClass = "";
    var vm = this;
    var login = this;

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
        login.username = Backand.getUsername();
        /* Params used to query API */
        $localStorage.userQuery = {}; 
        $localStorage.userQuery['value'] = login.username;
        $localStorage.userQuery['fieldName'] = "email"; 
        $localStorage.userQuery['operator'] = "contains";

        Restangular.all("users").getList({ filter: JSON.stringify($localStorage.userQuery) }).then(function (users) {
            $localStorage.user = users[0];
            $rootScope.user = $localStorage.user; 
            //console.log($rootScope.user.photo);
            $state.go('uploadphoto');
        }); 
        
    }


    vm.email = '';
    vm.password ='';
    vm.again = '';
    vm.firstName = '';
    vm.lastName = '';
    vm.errorMessage = '';
})
   
.controller('buddyProfileCtrl', function ($scope, $rootScope) {
    $rootScope.bodyClass = "";
})

   
.controller('challengesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('messagesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})

.controller('buddiesCtrl', function (Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel) {
    $scope.users = {}; 
    $scope.query = {};
    $scope.queryBy = '$';
    $scope.filter = {};
    $scope.buddyRequest = {};
    $scope.followStatus = "Follow";
    $scope.followClass = "";
    
    $scope.inviteBuddy = function(to_id) {
        $scope.buddyRequest.to_id = to_id;
        $scope.buddyRequest.from_id = $localStorage.user.id;
        $scope.buddyRequest.created = Date.now();
        $scope.buddyRequest.status = 'pending';
        $scope.updateAccount(); 
        console.log($scope.buddyRequest);
    };

    UsersModel.all()
        .then(function (result) {
            $scope.users = result.data.data;
            console.log($scope.users); 
        });

    $scope.orderProp="firstName"; 

    $scope.updateAccount = function() {
        BuddyRequestsModel.create($scope.buddyRequest)
            .then(function (result) {
                $scope.followStatus = "Invite sent";
                $scope.followClass = "button-dark";
                console.log(result); 
            });
    };

})
   
.controller('accountCtrl', function (Backand, $scope, $rootScope, $localStorage, Restangular, UsersModel) {
    var _self = this;
    var user = {}; 

    getUser(); 

    //console.log($scope.user);

    $rootScope.bodyClass = "";
    $scope.getPhoto = function() {
        console.log($localStorage);
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
   
.controller('createNewChallengeCtrl', function($scope) {

})
   
.controller('challengeGroupCtrl', function($scope) {

})

.controller('myPhotoCtrl', function ($stateParams, $scope, $rootScope, $state, Backand, PhotosModel, UsersModel, $http, $localStorage) {
    var photo_id = $stateParams.id; 
    PhotosModel.fetch(photo_id).then(function(result){
        $scope.photo = result.data; 
        console.log($scope.photo); 
    });

    $scope.editPhoto = function() {
        //unhide input text field
        //unhide Save button, hide Edit button
        //change button label from "Edit" to "Save"
        //fire DB save() on onclick on unhidden Save button 
        //reload myphoto/:photo_id page 
    };

    $scope.deletePhoto = function() {
        // install angular-modal: https://github.com/btford/angular-modal
        // in modal (pass id of photo): are you sure you want to delete?
        // onclick "YES" - fire db delete() on photo with ID
        // reload to profile page  
    };

    $scope.likePhoto = function() {
        //create object LIKES 
        //fields: id, userid, post_id 
        //grab likecounter -- add 1
        //reload timeline page 
    };

})

.controller('profileCtrl', function ($scope, $rootScope, $state, Backand, PhotosModel, UsersModel, $http, $localStorage) {
    $rootScope.bodyClass = "add-item";
    var _self = this; 
    $scope.user = {};
    UsersModel.fetch($localStorage.user.id).then(function(result){
        $scope.user = result.data; 
        getPhotos().then(function(results) {
            $scope.user.photos = results.data.data;
            $scope.user.postCount = results.data.data.length;
            console.log($scope.user.photos); 
        });
    });

    getPhotos = function() {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/objects/photos',
          params: {
            pageSize: 20,
            pageNumber: 1,
            filter: [
              {
                fieldName: 'user',
                operator: 'in',
                value: $localStorage.user.id,
              }
            ],
            sort: '[{fieldName:\'id\', order:\'desc\'}]'
          }
        });  
    }

    $scope.gotoPhoto = function(photo_id) {
        $state.go('nido.myPhoto', {id: photo_id});
    }

})

.controller('activityFeedCtrl', function ($state, $stateParams, $scope, $rootScope, Backand, PhotosModel, UsersModel, $http, $localStorage) {
    var _self = this; 
    $rootScope.bodyClass = "add-item";
    $scope.user = {};
    var user_photo = ''; 
    //$localStorage.user.id = $stateParams.id; 
    UsersModel.fetch($localStorage.user.id).then(function(result){
        $scope.user = result.data;
        $localStorage.user = $scope.user; 
        $rootScope.user = result.data; 
        getPhotos().then(function(results) {
            $scope.user.photos = results.data.data;
            console.log($scope.user.photos); 
        });
    });

    $scope.showPhotos = function() {
        return $scope.user.photos;
    };

    $scope.getUserPhoto = function() {
        if($localStorage.user.photo) {
            user_photo = $localStorage.user.photo;
        }
        return user_photo;
    }

    $scope.getPhoto = function() {
        if($localStorage.user.photo) {
            user_photo = $localStorage.user.photo;
        }
        return user_photo;
    }; 

    getPhotos = function() {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/objects/photos',
          params: {
            pageSize: 20,
            pageNumber: 1,
            filter: [
              {
                fieldName: 'user',
                operator: 'in',
                value: $localStorage.user.id,
              }
            ],
            sort: '[{fieldName:\'id\', order:\'desc\'}]'
          }
        });  
    }

    $scope.gotoPhoto = function(photo_id) {
        $state.go('nido.myPhoto', {id: photo_id});
    }
})
 