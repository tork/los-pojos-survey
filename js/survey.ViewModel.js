(function(root, models, depHandler){
	var viewModel = function() {
		var self = this;

		//må pushe objecter med minimum en prop kalt name i programs og programStages
		//Kan være lurt å ha en model som ser slik ut kanskje: {name: "Navnet", id: "idsomething"}s
		self.programs = ko.observableArray();
		self.selectedProgram = ko.observable();
		self.programStages = ko.observableArray();
		self.selectedProgramStage = ko.observable();
		self.dataElements = ko.observableArray();
		self.activeElement = ko.observable({type: "None"});
		self.selectedProgram.subscribe(function() {
			self.programStages().length = 0;
			survey.data.getProgramStageIdsFromSelectedProgram();
		});
        self.selectedProgramStage.subscribe(function() {
            self.selectedProgramStagesOptionSets().length = 0;
            survey.data.getAndInsertDataElementsForSelectedProgramStage();            
        });
        self.selectedProgramStagesOptionSets = ko.observableArray();

        self.dataElementCreator = function(dataElement) {
            return new models.DataElement(dataElement);
        };

		self.getDataElementByID = function(id) {
			var dataEl;
			$.each(root.viewModel.dataElements(), function(index, dataElement) {
				if(dataElement.id === id) {
					dataEl = dataElement;
				}
			});
			return dataEl;
		};

		self.dependenciesHold = function (dataelement) {
			console.log("dependenciesHold", dataelement)
			$.each(dataelement.dependencies, function( index, dep ) {
				var dataElement = self.getDataElementByID(dep.id); //undefined
				if(dataElement != undefined && !$.inArray(dep.values, dataElement.value())) return false;
			});
			return true;
		};

        self.addSkipLogic = function(dataelement) {
            dataelement.addingSkipLogic(true);
            self.activeElement(dataelement);

            $.each(self.dataElements(), function( index, element ) {
                if(element != dataelement) {
                    element.isInSkipLogic(true);
                    element.isDependent(depHandler.hasDependency(element, dataelement));
                    element.setSkipLogicUIElements(dataelement);
                }
            });
        };

        self.saveSkipLogic = function(dataelement) {
            $.each(root.viewModel.dataElements(), function( index, element ) {
                if(element != dataelement) {
                    if(element.isDependent()) {
                        depHandler.addDependency(dataelement, element).done(function() {
                            element.resetSkipLogicUI();
                            console.log("legger til avhengighet", element);
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

		//LOG IN
		self.loginVisible = ko.observable(false);

		self.username = ko.observable();
		self.password = ko.observable();
		self.logIn = function() {
			console.log("Log in with values: " + self.username() + " " + self.password());
			survey.data.authenticate(self.username(), self.password());
		}
	};

	/*
	 * Litt forklaring: selectedProgram vil inneholde det man har valgt,
	 * eller undefined hvis det står "Select program" i selecten.
	 * Det er en observable, så den hentes ut ved å kalle viewModel.selectedProgram()
	 * Foreslår at dette brukes til å gjøre get til api.
	 * */

	root.viewModel = new viewModel();
})(survey, survey.models, survey.dependencyHandler);

