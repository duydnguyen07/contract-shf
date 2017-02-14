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

SHF.directivesModule.directive('geographic', function() {
	return {
		restrict: "E",
		templateUrl: "components/geographic/geographic.html"
	};
});

SHF.servicesModule.factory('ContactFormService', [function() {
	var vm = {};

	vm.init = function() {
		vm.first_name = "";
		vm.last_name = "";
		vm.email = "";
		vm.is_provider = "";
		vm.region = "";
		vm.country = "";
		vm.city = "";
	}

	vm.init();

	return vm;
}]);

SHF.controllersModule.controller('GeographicCtrl', ["$http", "ContactFormService", function($http, formService){
	var vm = this;
	vm.formService = formService;
	vm.countries = null;
	vm.cities = null;

	vm.geographic = null;

	$http.get("components/geographic/geographic_data.json").then(function successCB(resp) {
			vm.geographic = resp.data;
			vm.findDuplicates();
		}, function errorCB(resp) {
			console.log("ERROR: Failed loading geographic data", resp.data);
		});


	vm.findDuplicates = function() {
		var cities = vm.geographic.cities;
		Object.keys(cities).forEach(function(k) {
			var currentCities = cities[k];

			for (var i = 0; i < currentCities.length; i++) {
				if(currentCities.lastIndexOf(currentCities[i]) !== i) console.log(currentCities[i]);
			}
		});
	}

	vm.loadCountries = function(region) {
		vm.countries = vm.geographic.countries[region];
	}

	vm.loadCities = function(country) {
		vm.cities = vm.geographic.cities[country];
	}
}]);

SHF.controllersModule.controller('AppCtrl', ['$scope', 'ModalService', 
										function($scope, ModalService) {
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

SHF.controllersModule.controller('ContactFormCtrl', ['$scope', '$element',  'ContactFormService', 'close',  
										function($scope, $element, formService, close) {
	var contacts = firebase.database().ref('contacts');
	$scope.submitted = false;
	$scope.formService = formService;


	$scope.submit = function(valid) {
		if(valid) {
			var data = {};
			var newContactKey = contacts.push().key;
			data[newContactKey] = {
				first_name: $scope.formService.first_name,
				last_name: $scope.formService.last_name,
				email: $scope.formService.email,
				is_provider: $scope.formService.is_provider,
				region: $scope.formService.region,
				country: $scope.formService.country,
				city: $scope.formService.city
			}
			
			contacts.update(data);

			formService.init(); //reinit to clear old data
			$scope.submitted = true;
			// $scope.closeModal();
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