angular.module('app.controllers', [])

.controller('mainCtrl', function ($location, $timeout, $rootScope, $scope, $location) {
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

.controller('addPostUploadCtrl', function ($ionicModal, $ionicHistory, $state, AuthService, $rootScope, $scope, Restangular, $localStorage, $http, Backand, PhotosModel) {
    var _self = this; 
    $scope.currentUser = $localStorage.user.id;
    $scope.post = {}; //object for new post being created 
    $scope.post.caption = '';

    $rootScope.bodyClass = "";
    $scope.post = {
       originalImage: '',
       croppedImage: ''
    };

    $ionicModal.fromTemplateUrl('caption.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.$on('$destroy', function() { $scope.modal.remove(); });

    $scope.openModal = function() { $scope.modal.show(); };
    $scope.closeModal = function() { $scope.modal.hide(); };

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

    $scope.goBack = function() {
        $ionicHistory.goBack();
    }

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

.controller('viewChallengeCtrl', function ($timeout, ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {
    
    $scope.currentUser = $localStorage.user.id;
    $scope.challenge_id = $stateParams.id; 

    $scope.init = function() {
        getChallenge($scope.challenge_id).then(function(results) {
            if (results.data.totalRows > 0)
                $scope.challenge = results.data.data[0];
            else 
                $scope.challenge = null; 

            console.log($scope.challenge);
        });
    }

    getChallenge = function(challenge_id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/objects/challenges',
          params: {
            pageSize: 20,
            pageNumber: 1,
            filter: [
              {
                fieldName: 'id',
                operator: 'equals',
                value: challenge_id
              }
            ],
            sort: ''
          }
        });
    }

})

.controller('challengesCtrl', function ($timeout, ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {

    currentUser = $localStorage.user.id; 
    $scope.challenges = {};

    $scope.init = function() {
        getChallenges(currentUser).then(function(results) {
            if (results.status == 200) {
                if (results.data.totalRows > 0)
                    $scope.challenges = results.data.data;
                else 
                    $scope.challenges = null;
                console.log($scope.challenges);
            }
        });
    }

    getChallenges = function(user) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/objects/challenges',
          params: {
            pageSize: 20,
            pageNumber: 1,
            filter: [
              {
                fieldName: 'user',
                operator: 'equals',
                value: user
              }
            ],
            sort: ''
          }
        });
    };

})

.controller('likesCtrl', function ($http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {
    $scope.photoId = $stateParams.id; 
    $scope.photo = {};

    apiFetchByPhoto = function(id) {
        if (Backand.getApiUrl !='https://0.0.0.1') {
            $http.defaults.cache = true; 
            return $http ({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/objects/likes',
              headers: {
                'Content-Type': 'application/json'
              },
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

    getLikes = function(photoId) {
 
            //$scope.likeUsers = {};
            apiFetchByPhoto($scope.photoId).then(function(results){
                var likes = 0; 
                if (results.data.totalRows > 0) {
                    $scope.photo.likes = results.data.totalRows; 
                    likes = $scope.photo.likes;
                    $scope.photo.likeData = results.data.data;

                    angular.forEach($scope.photo.likeData, function(value, key) {
                        console.log($scope.photo.likeData);
                        console.log($localStorage.user.id);

                        //get user details
                        UsersModel.fetch(parseInt(value.user))
                                .then(function (result) {
                                    $scope.likeUsers = result.data;
                                    console.log($scope.likeUsers);
                        });

                        if (parseInt(value.user) == $localStorage.user.id)
                            $scope.photo.liked = true;
                            $scope.photo.likedId = value.id;
                    });
                }
                else {
                    $scope.photo.likes = 0;
                }

                console.log($scope.photo);
                //return likes;
            }, function (response) {
                console.log(response);
            }); 
        
    }

    getLikes($scope.photoId);

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
  
.controller('messagesCtrl', function ($timeout, ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {
   
    $scope.$on('$locationChangeStart', function(){
        $timeout.cancel($scope.promise);
        $rootScope.hideLoading = false;
    });

    currentUser = $localStorage.user.id; 
    $scope.conversations = {};
    //$scope.getConvos(); 

    $scope.init = function() {
        $scope.tickCounter = 0; //initialize 
        $scope.pollRefresh = 20; //every seconds
        $scope.maxSession = 5; //max minutes 
        $rootScope.hideLoading = true; 

        (function tick() {
            if ($scope.tickCounter < Math.ceil((60 / $scope.pollRefresh)*$scope.maxSession)) { // stop updating after 10 minutes
                getConversationList(currentUser).then(function(results) {
                    if (results.status == 200) {
                        if (results.data.length > 0) {
                            $rootScope.hideLoading = true;
                            $scope.conversations = results.data;

                            // Set timeout on how many times this query gets run per page load //
                            $scope.tickCounter++;
                            $scope.promise = $timeout(tick, 1000 * $scope.pollRefresh);
                            console.log($scope.tickCounter);

                            angular.forEach($scope.conversations, function(value, key) {
                                getLastReply(value.conversation_id).then(function(results) {
                                    if (results.status == 200) {
                                        $scope.conversations[key].lastReply = results.data[0].reply;
                                        $scope.conversations[key].last_updated = results.data[0].created;
                                        $scope.conversations[key].lastReplyId = results.data[0].id;
                                    }
                                });
                            }); 
                        } 
                    }
                }); 
            }
        })();
    };

    getLastReply = function(conversation_id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getLastReply',
          params: {
            parameters: {
              conversation_id: conversation_id
            }
          }
        });
    }

    getConversationList = function(user_id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getConversationList',
          params: {
            parameters: {
              user_id: user_id
            }
          }
        });
    }
})

.controller('readMessageCtrl', function ($sce, $ionicLoading, $location, $timeout, $ionicScrollDelegate, ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {

    $scope.currentUser = $localStorage.user.id;
    $scope.conversation_id = $stateParams.id; 
    $scope.replies = {};
    $scope.messageBuddy = {};

    //$scope.replies.reply = $sce.trustAsHtml($scope.replies.reply);

    $scope.$on('$locationChangeStart', function(){
        $timeout.cancel($scope.promise);
        $rootScope.hideLoading = false;
    });

    $scope.preText = function(x) {
        return $sce.trustAsHtml(x);
    };

    $scope.init = function() {
        $scope.tickCounter = 0; //initialize 
        $scope.pollRefresh = 7; //every seconds
        $scope.maxSession = 5; //max minutes 
        console.log(Math.ceil((60 / $scope.pollRefresh)*$scope.maxSession));
        $rootScope.hideLoading = true; 
        if ($scope.conversation_id && $scope.currentUser) {

           (function tick() {
                if ($scope.tickCounter < ((60 / $scope.pollRefresh)*$scope.maxSession)) { // stop updating after 10 minutes
                    getThread($scope.conversation_id).then(function(results) {
                        $rootScope.hideLoading = true; 
                        $scope.replies = results.data;
                        $scope.tickCounter++;
                        console.log($scope.tickCounter);
                        $scope.promise = $timeout(tick, 1000 * $scope.pollRefresh);
                    });
                }
            })();

            getConversationBuddy($scope.conversation_id, $scope.currentUser).then(function(results) {
                if (results.status == 200) {
                    $scope.messageBuddy = results.data[0];
                    console.log(results);
                    console.log($scope.messageBuddy);
                }
            });
        }
    }

    // Show last reply at bottom of window, move scrollbar automagically
    $scope.$watch('replies', function(newValue, oldValue) {
        $rootScope.hideLoading = true; 
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(false);
    }, true);


    getThread = function(conversation_id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getConversationUpdates',
          params: {
            parameters: {
              conversation_id: conversation_id
            }
          }
        });
    }

    getConversationBuddy = function(conversation_id, user_id) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getConversationBuddy',
          params: {
            parameters: {
              conversation_id: conversation_id,
              user_id: user_id
            }
          }
        });
    }

    $scope.createReply = function() {
        if ($scope.currentUser && $scope.conversation_id) {
            $scope.reply = {};
            $scope.reply.user_id = $scope.currentUser;
            $scope.reply.created = new Date();
            $scope.reply.status = '';
            $scope.reply.reply = $scope.message; 
            $scope.reply.conversation_id = $scope.conversation_id;

            console.log($scope.reply);
            
            //and create reply in conversation_replies table 
            ConversationRepliesModel.create($scope.reply).then(function(results) {
                if (results.status == 200) {
                    getThread($scope.conversation_id).then(function(results) {
                        $scope.replies = results.data;
                        $scope.message = "";
                        console.log($scope.replies);
                    });     
                }
            });
        }
    }

})

.controller('newMessageCtrl', function (ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams, $state) {
    $scope.currentUser = $localStorage.user.id; 

    tempFollowersList = [];
    followersList = [];

    $scope.tags = [];
    $scope.userList = [];
    $scope.search = {};

    isConversationNew = function(user_a, user_b) {
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getConversation',
          params: {
            parameters: {
              user_a: user_a,
              user_b: user_b
            }
          }
        });
    }

    $scope.toUserSelected = function(username, userId, index) {
        // Clear previous selections 
        angular.forEach($scope.followers, function(value, key) {
            value.selected = false;
        });
        $scope.tags = [];

        $scope.followers[index].selected = true; 

        console.log('me');
        console.log($scope.followers);
        $scope.tags.push({ text: username, id: userId });
    };

    $scope.createMessage = function() {

        $scope.conversation = {};
        $scope.conversation.user_a = $localStorage.user.id;
        $scope.conversation.user_b = $scope.tags[0].id; 
        $scope.conversation.created = new Date(); 
        $scope.conversation.status = ''; 
        $scope.conversation.reply = $scope.newMessage;
        //check if conversation exists
        isConversationNew($scope.conversation.user_a, $scope.conversation.user_b).then(function(results) {
            console.log(results);
            if (results.status == 200) {

                if (results.data.length == 0) {
                    console.log("we're creating a new conversation");
                    //if new conversation, create entry into DB
                    ConversationsModel.create($scope.conversation).then(function(results) {
                        
                        if (results.status == 200) {
                            $scope.reply = {};
                            $scope.reply.user_id = $scope.conversation.user_a;
                            $scope.reply.created = new Date();
                            $scope.reply.status = '';
                            $scope.reply.reply = $scope.conversation.reply; 
                            $scope.reply.conversation_id = results.data.__metadata.id;
                            
                            //and create reply in conversation_replies table 
                            ConversationRepliesModel.create($scope.reply).then(function(results) {
                                if (results.status == 200) {
                                    $state.go('nido.readMessage', { id: $scope.reply.conversation_id }, {reload: true});
                                    console.log('reply has been added');
                                    console.log(results);        
                                }
                            });
                        } 

                    });  
                }

                else {
                    $scope.reply = {};
                    $scope.reply.conversation_id = results.data[0].id;
                    $scope.reply.user_id = $scope.conversation.user_a;
                    $scope.reply.created = new Date();
                    $scope.reply.status = '';
                    $scope.reply.reply = $scope.conversation.reply; 

                    ConversationRepliesModel.create($scope.reply).then(function(results) {
                        if (results.status == 200) {
                            $state.go('nido.readMessage', { id: $scope.reply.conversation_id }, {reload: true});
                            console.log('conversation already exist, reply added');
                            console.log(results);     
                        }
                    });

                }
            }
        });
    };

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
            angular.forEach($scope.followers, function(value, key) {
                this.push({text: value.firstName});
            }, $scope.userList);

            console.log($scope.userList);
        });

    });
})
   
.controller('createNewChallengeCtrl', function ($state, ChallengesModel, $ionicModal, $sce, $ionicLoading, $location, $timeout, $ionicScrollDelegate, ConversationsModel, ConversationRepliesModel, $http, Backand, $scope, $rootScope, BuddyRequestsModel, $localStorage, Restangular, UsersModel, $stateParams) {

    $scope.challenge = {}; 
    $scope.challenge.name = '';
    $scope.challenge.description = '';

    $ionicModal.fromTemplateUrl('step-2.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.step2 = function() {
        $scope.modal.show();
    };
    $scope.close = function() {
        $scope.modal.hide();
    };

    $scope.finalize = function() {

        var errors = []; 
        var isValid = true; 
        $scope.errors = ''; 

        // Create New Challenge Post in DB
        $scope.challenge.photo = '';
        $scope.challenge.status = 'waiting';
        $scope.challenge.created = new Date();
        $scope.challenge.user = $localStorage.user.id;

        if ($scope.challenge.name.length < 4) {
            errors.push('Please provide a challenge name. Longer than 3 characters.');
            isValid = false;
        }
        if ($scope.challenge.description.length < 10) {
            errors.push('Please provide a challenge description. Longer than 10 characters.');
            isValid = false;
        }

        if (isValid) {
            ChallengesModel.create($scope.challenge).then(function(results) {
                if (results.status == 200) {
                    console.log(results);
                    console.log('challenge created');
                    $scope.close(); 
                    $state.go('nido.challenges', {}, {reload: true});
                }
            });
        }
        else {
            // Send back with list of errors if invalid
            $scope.errors = errors.join('\n'); 
        }
    };
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

    $scope.go = function(location) {
        if (location == 'nido-profile') {
            $state.go(location, {id: $localStorage.user.id});
        }
        else {
           $state.go(location); 
        }
    }

    $scope.likes = 0;
    $rootScope.bodyClass = "add-item";
    $scope.user = {};
    var user_photo = ''; 
    tempFollowersList = [];
    tempPhotoStream = [];
    followersList = [];

    //$localStorage.user.id = $stateParams.id;
    if ($localStorage.user.id) {
        UsersModel.fetch($localStorage.user.id).then(function(result){

            $scope.user = result.data;
            //$localStorage.user = $scope.user; 
            $rootScope.user = result.data;

            //get user's followers
            apiGetFollowersList = function() {
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

            //get user's followers
            apiGetPhotoStreamLikes = function(photoStream) {
                return $http ({
                  method: 'GET',
                  url: Backand.getApiUrl() + '/1/objects/likes',
                  params: {
                    filter: [
                      {
                        fieldName: 'photo',
                        operator: 'in',
                        value: photoStream
                      }
                    ],
                    deep: true,
                    sort: '[{fieldName:\'photo\', order:\'desc\'}]'
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
                tempFollowersList.push($localStorage.user.id);

                //String value passed to get follower details 
                $scope.followersList = tempFollowersList.join(',');

                getPhotos($scope.followersList).then(function(results) {
                    if (results.status == 200) {
                        //Store all photos to appear on user's timeline
                        $scope.user.photos = results.data.data;
                        
                        //Get user details of individual photos
                        $scope.user.usersFollowed = results.data.relatedObjects.users;
                        
                        //Compose list of all photo ids 
                        angular.forEach($scope.user.photos, function(value, key) {
                            this.push(value.id);
                        }, tempPhotoStream);

                        $scope.photoStream = tempPhotoStream.join(',');

                        apiGetPhotoStreamLikes($scope.photoStream).then(function(results) {
                            if (results.status = 200) {

                                // Get all likes based on photos appearing on timeline
                                $scope.allLikes = results.data.data;

                                // Let's get a list of only photos that have likes
                                $scope.photosWithLikes = results.data.relatedObjects.photos;

                                // This foreach is solely to initialize the counter on all photos with likes
                                angular.forEach($scope.allLikes, function(value, key) {
                                    $scope.photosWithLikes[value.photo].likeCounter = 0;
                                });

                                // Let's count number of likes per photo, and whether current user has liked the photo
                                angular.forEach($scope.allLikes, function(value, key) {

                                    // Add up all likes via counter 
                                    $scope.photosWithLikes[value.photo].likeCounter++; 

                                    // If current user has liked a photo, let's mark that as true to show in view
                                    if (parseInt(value.user) == $localStorage.user.id) {
                                        $scope.photosWithLikes[value.photo].liked = true;
                                        $scope.photosWithLikes[value.photo].likedId = value.id;
                                    }

                                    else {
                                        $scope.photosWithLikes[value.photo].liked = false;
                                        $scope.photosWithLikes[value.photo].likedId = null;
                                    }
                                });
                                 
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
                    }
                });
            });

        }, function (response) {
            console.log(response);
            $rootScope.$destroy();
        });
    } 

    $scope.toggleLike = function(photoId, index) {
        // Add new like 
        if (typeof $scope.photosWithLikes[photoId] === "undefined") {
            $scope.like = {};
            $scope.like.user = $scope.user.id; //$localStorage.user.id;
            $scope.like.photo = photoId;
            $scope.like.created = Date.now().toString();

            LikesModel.create($scope.like).then(function(results){
                $scope.photosWithLikes[photoId] = {};
                $scope.photosWithLikes[photoId].liked = true;
                $scope.photosWithLikes[photoId].likedId = parseInt(results.data.__metadata.id);
                $scope.photosWithLikes[photoId].likeCounter = 1;
            });  
            return;
        }
        else if ($scope.photosWithLikes[photoId].liked!=true) {
            $scope.like = {};
            $scope.like.user = $scope.user.id; //$localStorage.user.id;
            $scope.like.photo = photoId;
            $scope.like.created = Date.now().toString();

            LikesModel.create($scope.like).then(function(results){
                $scope.photosWithLikes[photoId].liked = true;
                $scope.photosWithLikes[photoId].likedId = parseInt(results.data.__metadata.id);
                $scope.photosWithLikes[photoId].likeCounter++;
            });  
            return;
        }

        // Unlike
        if ($scope.photosWithLikes[photoId].liked==true) {
            $scope.like = {};
            $scope.like.user = $scope.user.id; //$localStorage.user.id;
            $scope.like.photo = photoId;
            $scope.like.created = Date.now().toString();

            LikesModel.delete($scope.photosWithLikes[photoId].likedId).then(function(results){
                $scope.photosWithLikes[photoId].liked = false;
                $scope.photosWithLikes[photoId].likedId = null;
                $scope.photosWithLikes[photoId].likeCounter--;
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
          url: Backand.getApiUrl() + '/1/objects/photos',
          params: {
            filter: [
              {
                fieldName: 'user',
                operator: 'in',
                value: followersList
              }
            ],
            deep: true,
            level: 3,
            sort: '[{fieldName:\'created\', order:\'desc\'}]'
          }
        });

    /*
        return $http ({
          method: 'GET',
          url: Backand.getApiUrl() + '/1/query/data/getTimelinePhotos',
          params: {
            parameters: {
              followersList: followersList,
              deep: 'true'
            }
          }
        }); 
    */
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
 