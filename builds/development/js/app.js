// Initialize Firebase
var config = {
	apiKey: "AIzaSyBbyisLP7nNU8vQ_Wn81aXPo3kHYuY3zBE",
	authDomain: "superherofinder-dev.firebaseapp.com",
	databaseURL: "https://superherofinder-dev.firebaseio.com",
	storageBucket: "superherofinder-dev.appspot.com",
	messagingSenderId: "766848181572"
};
firebase.initializeApp(config);

/**
* App global
*/
var SHF = {
	valueModule: angular.module('appValues',[]),
	filtersModule: angular.module('appFilters',[]),
	servicesModule: angular.module('appServices',[]),
	controllersModule: angular.module('appControllers',[]),
	directivesModule: angular.module('appDirectives',[])
} 

var app =  angular.module('shf', [
	'angularModalService',
	'appValues',
	'appServices',
	'appFilters',
	'appDirectives',
	'appControllers'
	]);


SHF.controllersModule.controller('AppCtrl', ['$scope', 'ModalService',  
										function($scope, ModalService, close) {
	var vm = this;
	
	$scope.showContactForm = function() {
		ModalService.showModal({
			templateUrl: "components/contact-form/contact.form.html",
			controller: "ContactFormCtrl" 
		}).then(function(modal) {
			modal.element.modal();
		});
	}
}]);

SHF.controllersModule.controller('ContactFormCtrl', ['$scope', '$element', 'close',  
										function($scope, $element, close) {
	var contacts = firebase.database().ref('contacts');
	$scope.first_name = "";
	$scope.last_name = "";
	$scope.email = "";
	$scope.submit = function(valid) {
		if(valid) {
			var data = {};
			var newContactKey = contacts.push().key;
			data[newContactKey] = {
				first_name: $scope.first_name,
				last_name: $scope.last_name,
				email: $scope.email,
			}
			
			contacts.update(data); //debug
			$scope.closeModal();
		}
	}

	/**
	* @param {Boolean}
	*/
	$scope.closeModal = function() {
		$element.modal("hide");
		close({}, 300);	
	}
}]);