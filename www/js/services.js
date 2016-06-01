angular.module('app.services', [])

	.service('isFollowing', function($stateParams, $localStorage, Backand, $http) {
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
	})

	.service('APIInterceptor', function ($rootScope, $q) {
	    var service = this;

	    service.responseError = function (response) {
	        if (response.status === 401) {
	            $rootScope.$broadcast('unauthorized');
	        }
	        return $q.reject(response);
	    };
	})

	.service('ItemsModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'items/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('BuddyRequestsModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'buddy_requests/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('FollowersModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'followers/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('LikesModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'likes/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };

	})

	.service('UsersModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'users/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('PhotosModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'photos/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('ConversationsModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'conversations/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('ChallengeMembersModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'challenge_members/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('ChallengesModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'challenges/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

	.service('ConversationRepliesModel', function ($http, Backand) {
	    var service = this,
	        baseUrl = '/1/objects/',
	        objectName = 'conversation_replies/';

	    function getUrl() {
	        return Backand.getApiUrl() + baseUrl + objectName;
	    }

	    function getUrlForId(id) {
	        return getUrl() + id;
	    }

	    service.all = function () {
	        return $http.get(getUrl());
	    };

	    service.fetch = function (id) {
	        return $http.get(getUrlForId(id));
	    };

	    service.create = function (object) {
	        return $http.post(getUrl(), object);
	    };

	    service.update = function (id, object) {
	        return $http.put(getUrlForId(id), object);
	    };

	    service.delete = function (id) {
	        return $http.delete(getUrlForId(id));
	    };
	})

    .service('getData', function ($http, Backand) {
    	var service = this; 

    	service.lookup = function(queryName, params) {
	        var baseUrl = '/1/query/data/',
	            objectName = queryName,
	            params = params,
	            paramsString = '',
	            appendedUrl = '',
	            apiUrl = '';

	        // If we have parameters to send //
	        if (params) {
	        	paramsString = JSON.stringify(params);
	        	appendedUrl = "?parameters=" + paramsString;
	        }

	        apiUrl = Backand.getApiUrl() + baseUrl + objectName + appendedUrl;
    	   	console.log(apiUrl);
    	   	return $http.get(apiUrl);
    	};


        function getUrl() {
            return Backand.getApiUrl() + baseUrl + objectName + paramsString;
        }

        /*
        if (params) { 
            paramsString = "?parameters={".params."}"; 
        }



        https://api.backand.com/1/query/data/GetUserByEmail?parameters={"user_email":"mariostarks@gmail.com"}
        */
    })

	.service('LoginService', function (Backand) {
	    var service = this;

	    service.signin = function (email, password, appName) {
	        //call Backand for sign in
	        return Backand.signin(email, password);
	    };

	    service.anonymousLogin= function(){
	        // don't have to do anything here,
	        // because we set app token att app.js
	    }

	    service.socialSignIn = function (provider) {
	        return Backand.socialSignIn(provider);
	    };

	    service.socialSignUp = function (provider) {
	        return Backand.socialSignUp(provider);

	    };

	    service.signout = function () {
	        return Backand.signout();
	    };

	    service.signup = function(firstName, lastName, email, password, confirmPassword){
	        return Backand.signup(firstName, lastName, email, password, confirmPassword);
	    }
	})

	.service('AuthService', function($http, Backand){

	var self = this;
	var baseUrl = Backand.getApiUrl() + '/1/objects/';
	self.appName = '';//CONSTS.appName || '';
	self.currentUser = {};

	loadUserDetails();

	function loadUserDetails() {
		self.currentUser = Backand.getUserDetails();

	    self.currentUser.name = Backand.getUsername();
	    if (self.currentUser.name) {
	        getCurrentUserInfo()
	            .then(function (data) {
	                self.currentUser.details = data;
	            });
	    }
	}

	self.getSocialProviders = function () {
	    return Backand.getSocialProviders()
	};

	self.socialSignIn = function (provider) {
	    return Backand.socialSignIn(provider)
	        .then(function (response) {
	            loadUserDetails();
	            return response;
	        });
	};

	self.socialSignUp = function (provider) {
	    return Backand.socialSignUp(provider)
	        .then(function (response) {
	            loadUserDetails();
	            return response;
	        });
	};

	self.setAppName = function (newAppName) {
	    self.appName = newAppName;
	};

	self.signIn = function (username, password, appName) {
	    return Backand.signin(username, password, appName)
	        .then(function (response) {
	            loadUserDetails();
	            return response;
	        });
	};

	self.signUp = function (firstName, lastName, username, password, parameters) {
	    return Backand.signup(firstName, lastName, username, password, password, parameters)
	        .then(function (signUpResponse) {
	            if (signUpResponse.data.currentStatus === 1) {
	                return self.signIn(username, password)
	                    .then(function () {
	                        return signUpResponse;
	                    });

	            } else {
	                return signUpResponse;
	            }
	        });
	};

	self.changePassword = function (oldPassword, newPassword) {
	    return Backand.changePassword(oldPassword, newPassword)
	};

	self.requestResetPassword = function (username) {
	    return Backand.requestResetPassword(username, self.appName)
	};

	self.resetPassword = function (password, token) {
	    return Backand.resetPassword(password, token)
	};

	self.logout = function () {
	    Backand.signout().then(function () {
	        angular.copy({}, self.currentUser);
	    });
	};

	function getCurrentUserInfo() {
	    return $http({
	        method: 'GET',
	        url: baseUrl + "users",
	        params: {
	            filter: JSON.stringify([{
	                fieldName: "email",
	                operator: "contains",
	                value: self.currentUser.name
	            }])
	        }
	    }).then(function (response) {
	        if (response.data && response.data.data && response.data.data.length == 1)
	            return response.data.data[0];
	    });
	};

});