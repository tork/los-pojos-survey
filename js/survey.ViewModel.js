(function(root, models, depHandler) {
	var viewModel = function() {
		var self = this;

		// må pushe objecter med minimum en prop kalt name i programs og
		// programStages
		// Kan være lurt å ha en model som ser slik ut kanskje: {name: "Navnet",
		// id: "idsomething"}s
		self.programs = ko.observableArray();
		self.selectedProgram = ko.observable();
		self.programStages = ko.observableArray();
		self.selectedProgramStage = ko.observable();
		self.dataElements = ko.observableArray();
		self.activeElement = ko.observable({
			type : "None"
		});
		self.selectedProgram.subscribe(function() {
			console.log("Getting program stages for selected program");
			self.programStages().length = 0;
			survey.data.getProgramStageIdsFromSelectedProgram();
		});

		self.selectedProgramStage.subscribe(function() {
			self.selectedProgramStagesOptionSets().length = 0;
			self.downloadedDataElements().length = 0;
			self.dataElements().length = 0;
			if (self.selectedProgramStage().programStageDataElements) {
				survey.data.getAllDataElementsForSelectedProgramStage();
				survey.data.getOrgUnits(self.selectedProgram().id);
			}
		});
		self.selectedProgramStagesOptionSets = ko.observableArray();

		self.dataElementCreator = function(dataElement) {
			return new models.DataElement(dataElement);
		};

		self.downloadedDataElements = ko.observableArray();

		self.getDataElementByID = function(id) {
			var dataEl;
			$.each(root.viewModel.dataElements(), function(index, dataElement) {
				if (dataElement.id === id) {
					dataEl = dataElement;
				}
			});
			return dataEl;
		};

		self.dependenciesHold = function(dataelement) {
			//TODO: if a dep is not visible, return false
			
			console.log("dependenciesHold", dataelement);
			var deps = dataelement.dependencies;

			for (var i = 0; i < deps.length; i++) {
				console.log("checking dep "+deps[i].id+" of "+dataelement.id);
				var dep = self.getDataElementByID(deps[i].id);
				console.log(dep);
				if (!dep) return false;

				//var val = dep.value();
				var val = survey.utils.translateElementValue(dep);
				console.log(val);
				if (!val) return false;

				var triggers = deps[i].triggers;
				console.log(triggers);
				if (triggers.indexOf(val) < 0)
					return false;
			}

			return true;

			/*dataelement.dependencies.forEach(function(descriptor) {
				var dep = self.getDataElementByID(descriptor.id);
				if (!dep || !dependenciesHold(dep)) {
					return false;
				}
			});

			return true;*/


			/*
			$.each(dataelement.dependencies, function(index, dep) {
				var dataElement = self.getDataElementByID(dep.id); // undefined
				if (dataElement != undefined
						&& !$.inArray(dep.values, dataElement.value()))
					return false;
			});
			return true;
			*/
		};

		self.addSkipLogic = function(dataelement) {
			dataelement.addingSkipLogic(true);
			self.activeElement(dataelement);

			$.each(self.dataElements(), function(index, element) {
				if (element != dataelement) {
					element.isInSkipLogic(true);
					element.isDependent(depHandler.hasDependency(element,
							dataelement));
					element.setSkipLogicUIElements(dataelement);
				}
			});
		};

		self.saveSkipLogic = function(dataelement) {
			$.each(root.viewModel.dataElements(), function(index, element) {
				if (element != dataelement) {
					if (element.isDependent()) {
						depHandler.addDependency(dataelement, element).done(
								function() {
									element.resetSkipLogicUI();
									console.log("legger til avhengighet",
											element);
								}).fail(function(status) {
									element.resetSkipLogicUI();
									console.log(status);
								});
					} else {
						depHandler.removeDependency(dataelement, element);
						element.resetSkipLogicUI();
					}
				} else {
					element.resetSkipLogicUI();
				}
			});
			dataelement.addingSkipLogic(false);
		};

		// LOG IN
		self.loginVisible = ko.observable(false);

		self.username = ko.observable();
		self.password = ko.observable();
		self.logIn = function() {
			console.log("Log in with values: " + self.username() + " "
					+ self.password());
			survey.data.authenticate(self.username(), self.password());
			self.loginVisible(false);
		}

		self.isAdmin = ko.observable(true);

		self.loginStatus = function() {
			var response = survey.data.getWebAPI();
			try {
				JSON.parse(response);
				self.loginVisible(false);
			} catch (err) {
				console.log("User not authenticated.")
				self.loginVisible(true);
			}
		}

		self.adminClick = function() {
			root.viewModel.isAdmin(true);
		};

		self.userClick = function() {
			console.log("userClick!");

			root.viewModel.isAdmin(false);
		};

		self.logoutClick = function() {
			survey.data.logout();
			self.loginVisible(true);
		}

		//SAVE DATA ENTRY
		self.entryDate = ko.observable();
		self.orgUnit = "";

		self.orgUnitOpts =  ko.observableArray();

		self.programIsChosen = ko.computed(function () {
			return self.selectedProgramStage() != undefined;
		})

		self.saveDataEntry = function() {
			if (!self.areThereAnyUnfilledRequiredDataElements()) {
				return;
			}
			
			var getDataValues = function() {
				dataelements = [];
				$.each(self.dataElements(), function(index, element) {
					if(element.value() != undefined)
						dataelements.push({dataElement: element.id, value: element.value()});
				});
				return dataelements;
			}

			var dataentry = {
					program : self.selectedProgram().id,
					orgUnit: self.orgUnit.orgUnit,
					eventDate: self.entryDate(),
					dataValues: getDataValues()
			}
			
			if(dataentry.orgUnit == undefined || dataentry.eventDate == undefined) {
				console.log("date and orgUnit must be specified!", dataentry.orgUnit, dataentry.eventDate);
				
			} else {
				console.log("saving data entry");
				survey.data.saveDataEntry(dataentry);
			}
		}

		self.uploadSkipLogic = function() {
			var sps = self.selectedProgramStage();
			if (!sps) return;

			//var surveyId = sps.id;
			//var surveyId = 12;
			var id = sps.id;
			var success = function() {
				console.log("success! id was "+id);
				self.uploadingSkipLogic = false;
			};
			var error = function(req, stat, err) {
				console.log('Error while posting skip logic, with status "'+stat+'":\n'+
						err+'\n'+'Request was:');
				console.log(req);
				survey.error.displayErrorMessage('Failed to save your changes.\n(Read more about it in your console)');
				self.uploadingSkipLogic = false;
			};
			//self.post_dependencies = function(surveyId, elements, success, error) {
			survey.data.post_dependencies(sps.id, self.dataElements(), success, error);
			self.uploadingSkipLogic = true;
		}

		self.uploadingSkipLogic = false;
		
		self.areThereAnyUnfilledRequiredDataElements = function() {
			var unfilledElements = [];
			for (var i = 0; i < self.dataElements().length; i++) {
				if (self.dataElements()[i].isRequired &&
					!self.dataElements()[i].value() &&
					(self.dataElements()[i].type !== 'trueOnly')) { // trueOnly should be accepted even if not checked.
					unfilledElements.push(self.dataElements()[i]);
				}
			}
			return self.alertIfUncheckedRequiredDataElements(unfilledElements);
		}
		
		self.alertIfUncheckedRequiredDataElements = function(unfilledElements) {
			if (unfilledElements.length > 0) {
				var alertMsg = "";
				if (unfilledElements.length === 1) {
					alertMsg = "These elements are required and not filled out: ";
				} else {
					alertMsg = "This element is required and not filled out: ";
				}
				for (var i = 0; i < unfilledElements.length; i++) {
					alertMsg += unfilledElements[i].name;
					if (i !== unfilledElements.length-1) {
						alertMsg += ", ";
					} else {
						alertMsg += ".";
					}
				}
				alert(alertMsg);
				return false;
			}
			return true;
		};
	};
	

	/*
	 * Litt forklaring: selectedProgram vil inneholde det man har valgt, eller
	 * undefined hvis det står "Select program" i selecten. Det er en observable, så
	 * den hentes ut ved å kalle viewModel.selectedProgram() Foreslår at dette
	 * brukes til å gjøre get til api.
	 */

	root.viewModel = new viewModel();

})(survey, survey.models, survey.dependencyHandler);
