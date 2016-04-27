angular.module('app.controllers', [])
  
.controller('menuCtrl', function($scope, $window) {
	//var devWidth = 0;
	$scope.devWidth = (($window.innerWidth > 0) ? $window.innerWidth : screen.width);
})

.controller('homeCtrl', function($scope) {

})
      
.controller('loginCtrl', function($scope) {

})
   
.controller('signupCtrl', function($scope) {

})
   
.controller('profileCtrl', function($scope) {

})
   
.controller('buddyProfileCtrl', function($scope) {

})
   
.controller('buddiesCtrl', function($scope) {

})
   
.controller('challengesCtrl', function($scope) {

})
   
.controller('messagesCtrl', function($scope) {

})
   
.controller('accountCtrl', function($scope) {

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
   
.controller('activityFeedCtrl', function($scope) {

})
 