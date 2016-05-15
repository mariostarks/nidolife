angular.module('app.controllers', [])

.controller('mainCtrl', function($rootScope, $scope, $location) {
    $scope.showBodyClass = function() {

        var bodyClasses = ''; 
        if ($location.path().replace("/", "").slice(0, -2)=='side-menu/activity') {
            bodyClasses = 'page-timeline'; 
        }
        if ($location.path().replace("/", "")=='side-menu/activity') {
            bodyClasses = 'page-timeline'; 
        }
        if ($location.path().replace("/", "")=='side-menu/activity/') {
            bodyClasses = 'page-timeline'; 
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
        var post_filename = $localStorage.user.id + '-post-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12) + '.jpg';
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
    //console.log('scope user: ');
    //console.log($scope.user); 
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

.controller('uploadPhotoCtrl', function ($state, AuthService, $rootScope, $scope, $localStorage, $http, Backand, UsersModel) {
    // Get user information 
    $scope.user = $localStorage.user; 

    // Create image object
    $scope.image = { 
        originalImage: '', 
        croppedImage: ''
    };

    // Upload & Crop Image Functionality
    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.image.originalImage=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };

    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
    
    // Save Photo
    $scope.savePhoto = function() {
        var photoname = 'profile-photo-' + $scope.user.id + '.png';
        upload(photoname, $scope.image.croppedImage).then(function(res) {
            $scope.imageUrl = res.data.url + "?" + Date.now();
            $scope.user.photo = $scope.imageUrl;
            $localStorage.user.photo = $scope.imageUrl;
            console.log($scope.imageUrl);
        }, function(err){
            console.log(err.data);
        });

        //update usermodel with $scope.user. 

        UsersModel.update($scope.user.id, $scope.user)
            .then(function (result) {
                console.log(result);
                $state.go('nido.account', {}, {reload: true}); 
            });

    };

    function upload(filename, filedata) {
        // By calling the files action with POST method in will perform 
        // an upload of the file into Backand Storage
        return $http({
          method: 'POST',
          url : Backand.getApiUrl() + '/1/objects/action/photos',
          params:{
            "name": 'files'
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


})
      
.controller('loginCtrl', function (Backand, $state, $scope, $rootScope, LoginService, $localStorage, Restangular) {
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
            $scope.user = $localStorage.user; 
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
            $state.go('uploadPhoto');
        });
    }

    vm.email = '';
    vm.password ='';
    vm.again = '';
    vm.firstName = '';
    vm.lastName = '';
    vm.errorMessage = '';
})
   
.controller('userProfileCtrl', function ($scope, $rootScope) {
    $rootScope.bodyClass = "";
})

   
.controller('challengesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})
   
.controller('messagesCtrl', function($scope, $rootScope) {
    $rootScope.bodyClass = "";
})

.controller('followersCtrl', function ($http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {

    $scope.currentUser = $stateParams.id; 

    tempFollowersList = [];
    followersList = [];

    apiGetFollowersDetails = function(followersList) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowersUserDetails',
          params: {
            parameters: {
              followersList: followersList,
              deep: true
            }
          }
        });
    }

    apiGetFollowersList = function(id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowersFollowing',
          params: {
            parameters: {
              currentUser: id
            }
          }
        });
    };

    apiGetFollowersList($scope.currentUser).then(function(results) {
        $scope.followersIds = results.data;
        $scope.followersCount = results.data.length; 

        //Build temp followers list from DB
        angular.forEach($scope.followersIds, function(value, key) {
            this.push(value.from_id);
        }, tempFollowersList);

        //String value passed to get follower details 
        $scope.followersList = tempFollowersList.join(',');
        
        apiGetFollowersDetails($scope.followersList).then(function(results) {
            $scope.followers = results.data;
        });

    });

})

.controller('followingCtrl', function ($http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {
    $scope.currentUser = $stateParams.id; 
    tempFollowersList = [];
    followersList = [];

    apiGetFollowersList = function() {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowers',
          params: {
            parameters: {
              currentUser: $scope.currentUser,
              deep: true
            }
          }
        });
    };

    apiGetFollowersDetails = function(followersList) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowersUserDetails',
          params: {
            parameters: {
              followersList: followersList,
              deep: true
            }
          }
        });
    }

    apiGetFollowersList().then(function(results) {
        $scope.followersIds = results.data;
        $scope.followersCount = results.data.length; 

        //Build temp followers list from DB
        angular.forEach($scope.followersIds, function(value, key) {
            this.push(value.to_id);
        }, tempFollowersList);

        //Add user's self 
        //tempFollowersList.push($localStorage.user.id);

        //String value passed to get follower details 
        $rootScope.followersList = tempFollowersList.join(',');

        apiGetFollowersDetails($rootScope.followersList).then(function(results) {
            $scope.followers = results.data;
        });

    });
})

.controller('buddiesCtrl', function ($http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel) {
    $scope.users = {}; 
    $scope.query = {};
    //$scope.followers = {};
    $scope.queryBy = '$';
    $scope.filter = {};
    $scope.buddyRequest = {};
    $scope.followStatus = "follow";
    $scope.followClass = "";

    tempFollowersList = [];
    followersList = [];
    
    $scope.inviteBuddy = function(to_id) {
        $scope.buddyRequest.to_id = to_id;
        $scope.buddyRequest.from_id = $localStorage.user.id;
        $scope.buddyRequest.created = Date.now();
        $scope.buddyRequest.status = 'pending';
        $scope.updateAccount(); 
        console.log($scope.buddyRequest);
    };

    //isFollowed(); 

    $scope.showFollowStatus = function(list_id) {
        var followStatus = 'Invite';
        return followStatus;
    };

    $scope.apiGetFollowersList = function() {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowers',
          params: {
            parameters: {
              currentUser: $localStorage.user.id,
              deep: true
            }
          }
        });
    };

    $scope.apiGetFollowersDetails = function(followersList) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowersUserDetails',
          params: {
            parameters: {
              followersList: followersList,
              deep: true
            }
          }
        });
    }

    $scope.apiGetFollowersList().then(function(results) {
        $scope.followersIds = results.data;
        $scope.followersCount = results.data.length; 

        //Build temp followers list from DB
        angular.forEach($scope.followersIds, function(value, key) {
            this.push(value.to_id);
        }, tempFollowersList);

        //Add user's self 
        //tempFollowersList.push($localStorage.user.id);

        //String value passed to get follower details 
        $rootScope.followersList = tempFollowersList.join(',');

        $scope.apiGetFollowersDetails($rootScope.followersList).then(function(results) {
            $scope.followers = results.data;
            console.log($scope.followers);
        });

    });

    /*
    isFollowed = function() {
        getFollowStatus().then(function(results) {
            console.log('results: ' + results);
        });
    };

    getFollowStatus = function() {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/GetFollowStatus',
          params: {
            parameters: {
              currentId: '2'
            }
          }
        });
    };
    */

    UsersModel.all()
        .then(function (result) {
            $scope.users = result.data.data;
        });

    $scope.orderProp="firstName"; 

    $scope.updateAccount = function() {
        BuddyRequestsModel.create($scope.buddyRequest)
            .then(function (result) {
                $scope.followStatus = "pending";
            });
    };

})
   
.controller('accountCtrl', function (Backand, $scope, $rootScope, $localStorage, Restangular, UsersModel) {
    var _self = this;
    var user = {}; 

    getUser(); 

    $rootScope.bodyClass = "";
    $scope.getPhoto = function() {
        if ($localStorage.user.photo == null)
            $localStorage.user.photo = "/img/avatar.png";
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

.controller('myPhotoCtrl', function ($stateParams, $scope, $rootScope, $state, Backand, PhotosModel, UsersModel, $http, $localStorage, $ionicPopup) {
    var photo_id = $stateParams.id; 
    $scope.editClass = 'hide'; 
    
    PhotosModel.fetch(photo_id).then(function(result){
        //result.data.user = parseInt(result.data.user);
        $scope.photo = result.data;
        //$scope.photo.user = parseInt($scope.photo.user);
        if (!$scope.photo.caption) { $scope.photo.caption = '...'; } 
        console.log($scope.photo); 
    });

    $scope.isAllowedEdit = '';

    /* 
    if ($scope.photo.id.toString() != $localStorage.user.id.toString())
        $scope.isAllowedEdit = 'hide';
    */

    /*
    $scope.showPopup = function() {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '',
        title: '',
        subTitle: '',
        scope: $scope,
        buttons: [
          {
            text: '<b>Edit</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.data.wifi) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.wifi;
              }
            }
          },
          {
            text: '<b>Delete</b>',
            type: 'button-assertive',
            onTap: function(e) {
              if (!$scope.data.wifi) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.wifi;
              }
            }
          }
        ]
      });
    };
    */

     // A confirm dialog
     $scope.showConfirmDelete = function() {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Delete Photo Confirmation',
         template: 'Are you sure you want to delete this photo? This cannot be undone.'
       });

       confirmPopup.then(function(res) {
         if(res) {
            $scope.deletePhoto();
         } else {
           //console.log('You are not sure');
         }
       });

     };

    $scope.editPost = function() {
        $scope.editClass = ''; //show 
        $scope.captionClass = 'hide'; 
        //unhide input text field
        //unhide Save button, hide Edit button
        //change button label from "Edit" to "Save"
        //fire DB save() on onclick on unhidden Save button 
        //reload myphoto/:photo_id page 
    };

    $scope.savePost = function() {
        $scope.editClass = 'hide'; 
        $scope.captionClass = '';

        PhotosModel.update($scope.photo.id, $scope.photo).then(function(result){
            console.log(result);
        }); 

    }

    $scope.deletePhoto = function() {
        var photoId = $stateParams.id;
        PhotosModel.delete(photoId).then(function(result){
            console.log(result);
            $state.go('nido.activityFeed', {}, {reload: true}); 
        }); 
        //console.log('about to delete');
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

.controller('profileCtrl', function ( FollowersModel, $stateParams, $scope, $rootScope, $state, Backand, PhotosModel, UsersModel, $http, $localStorage) {
    $rootScope.bodyClass = "add-item";
    //var isFollowing = function();
    $scope.followStatus = "FOLLOW";
    $scope.followStatusClass = 'button-light';
    $scope.profileFollowers = {};

    var _self = this; 
    var userId = null; 
    $scope.profile = {};
    //$scope.user.id = 2; 
    $scope.user = $localStorage.user;

    isFollowing = function() {
        var currentUser;
        var userViewed;
        userViewed = $stateParams.id;
        currentUser = $localStorage.user.id;

        if (userViewed) {
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/IsFollowed',
              params: {
                parameters: {
                  currentUser: currentUser,
                  userViewed: userViewed
                }
              }
            }); 
        }
        else { return false; }
    } 




    if (!$stateParams.id)
        $state.go('nido.profile', {id: $scope.id}, {reload: true});
        //redirect home - they need an id as part of URL 
       // userId = $localStorage.user.id; 
    else 
        userId = $stateParams.id; 


    UsersModel.fetch(userId).then(function(result){
        $scope.profile = result.data; 
        $scope.profile.followingCount = 0;
        $scope.profile.followerCount = 0;
        getPhotos().then(function(results) {
            $scope.profile.photos = results.data.data;
            $scope.profile.postCount = results.data.data.length;
            //console.log($scope.user.photos); 
            console.log($scope.profile);
        });
        $scope.getProfilePhoto(); 

        //Is the user followed
        isFollowing().then(function(result){
            if (result.data.length !== 0) {
                //$scope.profile.followingCount = result.data.length;
                $scope.followStatus = 'FOLLOWING';
                $scope.followStatusClass = 'button-outline button-light ion-checkmark-round';
                $scope.profileFollowers = result.data;
            }
            else {
                //$scope.profile.followingCount = 0;
            }
            //console.log($scope.profileFollowers);
            console.log($scope.profile);

        });

        //Get following Count
        apiGetFollowingList($scope.profile.id).then(function(result) {
            if (result.data.length !== 0) {
                $scope.profile.followingCount = result.data.length;
            }
            else {
                $scope.profile.followingCount = 0;
            }
        });

        //Get follower Count
        apiGetFollowersList($scope.profile.id).then(function(result) {
            if (result.data.length !== 0) {
                $scope.profile.followerCount = result.data.length;
            }
            else {
                $scope.profile.followerCount = 0;
            }
        });

    });

    $scope.getProfilePhoto = function() {
        var userphoto = '/img/avatar.png'; 
        $scope.user = $localStorage.user; 

        if (typeof $scope.profile !== 'undefined') {
            if ($scope.profile.id == $scope.user.id) {
                userphoto = $localStorage.user.photo;
            }
            else {
                if ($scope.profile.photo != '') {
                    userphoto = $scope.profile.photo;
                }
            }
        }
    
        return userphoto;
    }

    apiGetFollowingList = function(id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowers',
          params: {
            parameters: {
              currentUser: id,
              deep: true
            }
          }
        });
    };

    apiGetFollowersList = function(id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getFollowersFollowing',
          params: {
            parameters: {
              currentUser: id
            }
          }
        });
    };

    $scope.follow = function() {

        var toBeFollowed = null;
        var currentUser = null;
        var follower = {}; 

        follower.to_id = $stateParams.id;
        follower.from_id = $localStorage.user.id;
        follower.created = new Date();  

        if ($scope.followStatus == "FOLLOW") {
            saveFollow(follower); 
            $scope.followStatus = "FOLLOWING";
            $scope.followStatusClass = 'button-light button-outline ion-checkmark-round';
            $scope.profile.followerCount++;
        }
        else if ($scope.followStatus == "FOLLOWING") {
            deleteFollow(); 
            $scope.followStatus = "FOLLOW";
            $scope.followStatusClass = 'button-light';
            $scope.profile.followerCount--;
        }

    }

    saveFollow = function(object) {
        FollowersModel.create(object)
            .then(function (result) {
                console.log(result);
            });
    }

    deleteFollow = function() {
        if ($scope.profileFollowers != null) {
            angular.forEach($scope.profileFollowers, function(value, key) {
                FollowersModel.delete(value.id)
                    .then(function (result) {
                        console.log(result);
                    });
            });  
        }
    }


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
                value: userId,
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

.controller('activityFeedCtrl', function ($ionicLoading, $ionicPopup, $state, $stateParams, $scope, $rootScope, Backand, PhotosModel, UsersModel, $http, $localStorage, LikesModel) {
    var _self = this; 
    $scope.likes = 0;
    $rootScope.bodyClass = "add-item";
    $scope.user = {};
    var user_photo = ''; 
    tempFollowersList = [];
    followersList = [];

    //$localStorage.user.id = $stateParams.id; 
    UsersModel.fetch($localStorage.user.id).then(function(result){

        $scope.user = result.data;
        //$localStorage.user = $scope.user; 
        $rootScope.user = result.data;

        //get user's followers
        $scope.apiGetFollowersList = function() {
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/getFollowers',
              params: {
                parameters: {
                  currentUser: $localStorage.user.id,
                  deep: true
                }
              }
            });
        };

        $scope.apiGetFollowersDetails = function(followersList) {
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/query/data/getFollowersUserDetails',
              params: {
                parameters: {
                  followersList: followersList,
                  deep: true
                }
              }
            });
        }

        $scope.apiGetFollowersList().then(function(results) {
            $scope.followersIds = results.data;
            $scope.followersCount = results.data.length; 

            //Build temp followers list from DB
            angular.forEach($scope.followersIds, function(value, key) {
                this.push(value.to_id);
            }, tempFollowersList);

            //Add user's self 
            tempFollowersList.push($localStorage.user.id);

            //String value passed to get follower details 
            $scope.followersList = tempFollowersList.join(',');

            getPhotos($scope.followersList).then(function(results) {
                $scope.user.photos = results.data;
                console.log($scope.user.photos);

                angular.forEach($scope.user.photos, function(value, key) {
                    if (value.id != null && key != null ) {
                        $scope.getLikes(value.id, key);
                    }
                });

                /* ADD FIRST or WELCOME POST */ 
                /*
                var lastKey = results.data.length + 1;
                $scope.user.photos[lastKey] = {};
                $scope.user.photos[lastKey].data = '/img/timeline-drluna.png'; 
                $scope.user.photos[lastKey].id = 9999999999;
                $scope.user.photos[lastKey].created = Date.now().toString();
                $scope.user.photos[lastKey].caption = 'Greetings! My name is Dr. Luna, founder of NIDO.LIFE. Let me be the first to welcome you. May this app help you foster and maintain healthy habits through community.'; 
                $scope.user.photos[lastKey].category = "";
                $scope.user.photos[lastKey].comments = Date.now().toString(); 
                $scope.user.photos[lastKey].likes = ''; 
                $scope.user.photos[lastKey].user = '2';  
                */
                
            });
        });

    });

    apiFetchByPhoto = function(id) {
        if (Backand.getApiUrl !='https://0.0.0.1') {
            $http.defaults.cache = true; 
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/objects/likes',
              params: {
                filter: [
                  {
                    fieldName: 'photo',
                    operator: 'in',
                    value: id
                  }
                ],
                sort: ''
              }
            });
        }
    }

    $scope.getLikes = function(photoId, index) {
 
            apiFetchByPhoto(photoId).then(function(results){
                var likes = 0; 
                if (results.data.totalRows > 0) {
                    $scope.user.photos[index].likes = results.data.totalRows; 
                    likes = $scope.user.photos[index].likes;
                    $scope.user.photos[index].likeData = results.data.data;
                    /*
                    return Promise.all(results.rows.map(function (row) {
                        console.log(row);
                    }));
                    */

                    angular.forEach($scope.user.photos[index].likeData, function(value, key) {
                        console.log($scope.user.photos[index].likeData);
                        console.log($localStorage.user.id);
                        if (parseInt(value.user) == $localStorage.user.id)
                            $scope.user.photos[index].liked = true;
                            $scope.user.photos[index].likedId = value.id;
                    });
                }
                else {
                    $scope.user.photos[index].likes = 0;
                }

                console.log($scope.user.photos[index]);
                return likes;
            }, function (response) {
                console.log(response);
                $rootScope.$destroy();
            }); 
        
    }

    $scope.toggleLike = function(photoId, index) {
        // Add new like 
        if ($scope.user.photos[index].liked!=true) {
            $scope.like = {};
            $scope.like.user = $scope.user.id; //$localStorage.user.id;
            $scope.like.photo = photoId;
            $scope.like.created = Date.now().toString();

            LikesModel.create($scope.like).then(function(results){
                $scope.user.photos[index].likedId = parseInt(results.data.__metadata.id);
                $scope.user.photos[index].liked = true;
                $scope.user.photos[index].likes++; 
                console.log(results);
            });  
        }

        // Unlike
        if ($scope.user.photos[index].liked==true) {
            $scope.like = {};
            $scope.like.user = $scope.user.id; //$localStorage.user.id;
            $scope.like.photo = photoId;
            $scope.like.created = Date.now().toString();

            LikesModel.delete($scope.user.photos[index].likedId).then(function(results){
                $scope.user.photos[index].liked = false;
                $scope.user.photos[index].likes--; 
                console.log(results);
            });  
        }
        //refresh like check 

        //create new record 
        //code

        //add like counter
        

        console.log($scope.user.photos[index]);
    }

    $scope.showCategory = function(category) {
        var categoryText = '';
        if (category == null) { categoryText = ''; }
        switch(category) {
            case "1":
                categoryText = 'Meal';
                break;
            case "2":
                categoryText = 'Sneaker';
                break;
            case "3":
                categoryText = 'Motivation';
                break;
            case "4":
                categoryText = 'Activity';
                break;
            default:
                categoryText = '';
        }
        return categoryText;
    };
    

    $scope.showPhotos = function() {
        return $scope.user.photos;
    };

    $scope.getUserPhoto = function() {
        if ($localStorage.user.photo == null)
            $localStorage.user.photo = "/img/avatar.png";
        return $localStorage.user.photo;
    }

    $scope.getPhoto = function() {
        if ($localStorage.user.photo == null)
            $localStorage.user.photo = "/img/avatar.png";
        return $localStorage.user.photo;
    }; 

    getPhotos = function(followersList) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getTimelinePhotos',
          params: {
            parameters: {
              followersList: followersList,
              deep: true
            }
          }
        }); 
    }

    $scope.gotoPhoto = function(photo_id) {
        $state.go('nido.myPhoto', {id: photo_id});
    }

    $scope.showEditBox = function(photo_id) {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '',
        title: '',
        subTitle: '',
        scope: $scope,
        buttons: [
          {
            text: '<b>Edit</b>',
            type: 'button-positive',
            onTap: function(e) {
                $scope.gotoPhoto(photo_id);
            }
          },
          {
            text: '<b>Delete</b>',
            type: 'button-light',
            onTap: function(e) {

            }
          }
        ]
      });
    };

})
 