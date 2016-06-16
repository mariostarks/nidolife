angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('nido.following', {
    url: '/following/:id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/following.html',
        controller: 'followingCtrl'
      }
    }
  })


  .state('nido.likes', {
    url: '/likes/:id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/likes.html',
        controller: 'likesCtrl'
      }
    }
  })

  .state('nido.followers', {
    url: '/followers/:id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/followers.html',
        controller: 'followersCtrl'
      }
    }
  })

  .state('nido', {
    url: '/side-menu',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl',
    abstract:true
  })

  .state('addpost', {
    url: '/add-post-upload/:challenge',
    templateUrl: 'templates/addPostUpload.html',
    controller: 'addPostUploadCtrl',
    cache: false
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl as login'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl as vm'
  })

  .state('forgotpassword', {
    url: '/forgot-password',
    templateUrl: 'templates/forgotPassword.html',
    controller: 'forgotPasswordCtrl'
  })

  .state('uploadphoto', {
    url: '/uploadphoto',
    templateUrl: 'templates/uploadPhoto.html',
    controller: 'uploadPhotoCtrl'
  })

  .state('nido.profile', {
    url: '/user/:id',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  })

  .state('nido.buddies', {
    url: '/buddies',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/buddies.html',
        controller: 'buddiesCtrl'
      }
    }
  })

  .state('nido.challenges', {
    url: '/challenges',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/challenges.html',
        controller: 'challengesCtrl'
      }
    }
  })

  .state('nido.viewChallenge', {
    url: '/challenge/:id',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/viewChallenge.html',
        controller: 'viewChallengeCtrl'
      }
    }
  })

  .state('nido.inviteChallenge', {
    url: '/challenge/invite/:id',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/inviteChallenge.html',
        controller: 'inviteChallengeCtrl'
      }
    }
  })

  .state('nido.messages', {
    url: '/messages',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/messages.html',
        controller: 'messagesCtrl'
      }
    }
  })

  .state('nido.account', {
    url: '/account',
    views: {
      'side-menu21': {
        templateUrl: 'templates/account.html',
        controller: 'accountCtrl'
      }
    }
  })



  .state('nido.signout', {
    url: '/signout',
    views: {
      'side-menu21': {
        templateUrl: 'templates/signout.html',
        controller: 'signoutCtrl'
      }
    }
  })

  .state('nido.addBuddy', {
    url: '/add-buddy',
    views: {
      'side-menu21': {
        templateUrl: 'templates/addBuddy.html',
        controller: 'addBuddyCtrl'
      }
    }
  })

  .state('nido.newMessage', {
    url: '/new-message',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/newMessage.html',
        controller: 'newMessageCtrl'
      }
    }
  })

  .state('nido.readMessage', {
    url: '/read/:id',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/readMessage.html',
        controller: 'readMessageCtrl'
      }
    }
  })

  .state('nido.myPhoto', {
    url: '/photo/:id',
    views: {
      'side-menu21': {
        templateUrl: 'templates/myPhoto.html',
        controller: 'myPhotoCtrl'
      }
    }
  })

  .state('nido.createNewChallenge', {
    url: '/add-challenge',
    views: {
      'side-menu21': {
        templateUrl: 'templates/createNewChallenge.html',
        controller: 'createNewChallengeCtrl'
      }
    }
  })

  .state('nido.challengeGroup', {
    url: '/challenge-group',
    views: {
      'side-menu21': {
        templateUrl: 'templates/challengeGroup.html',
        controller: 'challengeGroupCtrl'
      }
    }
  })

  .state('nido.activityFeed', {
    url: '/activity/:id',
    cache: false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/activityFeed.html',
        controller: 'activityFeedCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/home')  

});