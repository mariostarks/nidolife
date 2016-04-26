angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('home', {
    url: '/page1',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('nIDO', {
    url: '/side-menu21',
    templateUrl: 'templates/nIDO.html',
    abstract:true
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('nIDO.tHISISME', {
    url: '/myprofile',
    views: {
      'side-menu21': {
        templateUrl: 'templates/tHISISME.html',
        controller: 'tHISISMECtrl'
      }
    }
  })

  .state('nIDO.bUDDYSPROFILE', {
    url: '/buddy',
    views: {
      'side-menu21': {
        templateUrl: 'templates/bUDDYSPROFILE.html',
        controller: 'bUDDYSPROFILECtrl'
      }
    }
  })

  .state('nIDO.bUDDIES', {
    url: '/buddies',
    views: {
      'side-menu21': {
        templateUrl: 'templates/bUDDIES.html',
        controller: 'bUDDIESCtrl'
      }
    }
  })

  .state('nIDO.cHALLENGES', {
    url: '/challenges',
    views: {
      'side-menu21': {
        templateUrl: 'templates/cHALLENGES.html',
        controller: 'cHALLENGESCtrl'
      }
    }
  })

  .state('nIDO.mESSAGES', {
    url: '/messages',
    views: {
      'side-menu21': {
        templateUrl: 'templates/mESSAGES.html',
        controller: 'mESSAGESCtrl'
      }
    }
  })

  .state('nIDO.aCCOUNT', {
    url: '/account',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aCCOUNT.html',
        controller: 'aCCOUNTCtrl'
      }
    }
  })

  .state('nIDO.sIGNOUT', {
    url: '/signout',
    views: {
      'side-menu21': {
        templateUrl: 'templates/sIGNOUT.html',
        controller: 'sIGNOUTCtrl'
      }
    }
  })

  .state('nIDO.aDDBUDDY', {
    url: '/add-buddy',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aDDBUDDY.html',
        controller: 'aDDBUDDYCtrl'
      }
    }
  })

  .state('nIDO.newMessage', {
    url: '/new-message',
    views: {
      'side-menu21': {
        templateUrl: 'templates/newMessage.html',
        controller: 'newMessageCtrl'
      }
    }
  })

  .state('nIDO.readMessage', {
    url: '/read-message',
    views: {
      'side-menu21': {
        templateUrl: 'templates/readMessage.html',
        controller: 'readMessageCtrl'
      }
    }
  })

  .state('nIDO.myPhoto', {
    url: '/photo',
    views: {
      'side-menu21': {
        templateUrl: 'templates/myPhoto.html',
        controller: 'myPhotoCtrl'
      }
    }
  })

  .state('nIDO.cREATENEWCHALLENGE', {
    url: '/add-challenge',
    views: {
      'side-menu21': {
        templateUrl: 'templates/cREATENEWCHALLENGE.html',
        controller: 'cREATENEWCHALLENGECtrl'
      }
    }
  })

  .state('nIDO.aTeamChallenge', {
    url: '/challenge-page',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aTeamChallenge.html',
        controller: 'aTeamChallengeCtrl'
      }
    }
  })

  .state('nIDO.aCTIVITYFEED', {
    url: '/activity',
    views: {
      'side-menu21': {
        templateUrl: 'templates/aCTIVITYFEED.html',
        controller: 'aCTIVITYFEEDCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1')

  

});