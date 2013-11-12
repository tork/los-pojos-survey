(function(root){
    

	/* Inneholder all data om et dataelement. Planen er å etterhvert utvide dette til å også inneholde skip logic*/
	function DataElement(dataelement) {
		var self = this;
		self.id = dataelement.id;
		self.name = dataelement.name;
		self.formName = dataelement.formName;
		self.description = dataelement.description;
		self.type =  dataelement.type;

		self.dependencies = [
		                     {"id" : "Age", "values" : [0, 20]},
		                     {"id" : "checkBoxElementID", "values" : ["true"]}
		                     ];

		if(self.type === 'checkbox')
			self.value = ko.observable(false);
		else
			self.value = ko.observable("");	
		
		self.isDependent = ko.observable(false);

		//skip logic
		self.isInSkipLogic = ko.observable(false);
		self.addingSkipLogic = ko.observable(false);

		self.addSkipLogic = function(dataelement) {
			dataelement.addingSkipLogic(true);
			
			$.each(root.viewModel.dataElements(), function( index, element ) {
				if(element != self) {
					element.isInSkipLogic(true);
				}
			});
		};
		
		self.saveSkipLogic = function(dataelement) {
			$.each(root.viewModel.dataElements(), function( index, element ) {
				if(element != self) {
					if(element.isDependent()) {
						element.isDependent(false);
						console.log("legger til avhengighet", element);
					}
						
					element.isInSkipLogic(false);
				}
			});
			dataelement.addingSkipLogic(false);
		};
		
	}

//	Kan nok rename denne etter hvert som vi vet hvilke viewModels vi trenger - iallfall hvis vi trenger flere!
	var viewModel = function() {
		var self = this;
		//må pushe objecter med minimum en prop kalt name i programs og programStages
		//Kan være lurt å ha en model som ser slik ut kanskje: {name: "Navnet", id: "idsomething"}s
		self.programs = ko.observableArray();
		self.selectedProgram = ko.observable();
		self.programStages = ko.observableArray();
		self.selectedProgramStage = ko.observable();
		self.dataElements = ko.observableArray();
		self.selectedProgram.subscribe(function() {
			self.programStages().length = 0;
			survey.data.getProgramStageIdsFromSelectedProgram();
		});
        self.selectedProgramStage.subscribe(function() {
            console.log("test");
            survey.data.getAndInsertDataElementsForSelectedProgramStage();
        });
        self.selectedProgramStagesOptionSets = ko.observable;

		/* testdata */
		self.dataElements.push(new DataElement({"name":"Age","created":"2012-11-14T13:41:39.639+0000","lastUpdated":"2013-03-15T16:32:26.280+0000","shortName":"Age","description":"Age of patient.","formName":"Age (Years)","active":true,"domainType":"patient","type":"int","numberType":"int","aggregationOperator":"sum","categoryCombo":{"name":"default","created":"2011-12-24T11:24:25.203+0000","lastUpdated":"2011-12-24T11:24:25.203+0000","href":"http://apps.dhis2.org/demo/api/categoryCombos/p0KPaWEg3cf","id":"p0KPaWEg3cf"},"url":"","zeroIsSignificant":false,"optionSet":null,"legendSet":null,"access":{"manage":true,"externalize":false,"write":true,"read":true,"update":true,"delete":true},"href":"http://apps.dhis2.org/demo/api/dataElements/qrur9Dvnyt5","id":"qrur9Dvnyt5"}));
		self.dataElements.push(new DataElement({"name":"Gender","created":"2012-11-14T12:11:55.105+0000","lastUpdated":"2013-03-15T16:32:26.287+0000","shortName":"Gender","description":"Gender of patient.","formName":"Gender","active":true,"domainType":"patient","type":"string","textType":"text","aggregationOperator":"sum","categoryCombo":{"name":"default","created":"2011-12-24T11:24:25.203+0000","lastUpdated":"2011-12-24T11:24:25.203+0000","href":"http://apps.dhis2.org/demo/api/categoryCombos/p0KPaWEg3cf","id":"p0KPaWEg3cf"},"url":"","zeroIsSignificant":false,"optionSet":{"name":"Gender","created":"2012-11-13T08:08:51.450+0000","lastUpdated":"2012-11-13T08:08:51.450+0000","href":"http://apps.dhis2.org/demo/api/optionSets/fEDqAkq2X4o","id":"fEDqAkq2X4o"},"legendSet":null,"access":{"manage":true,"externalize":false,"write":true,"read":true,"update":true,"delete":true},"href":"http://apps.dhis2.org/demo/api/dataElements/oZg33kd9taw","id":"Age"}));	
		self.dataElements.push(new DataElement({"name":"Alive","created":"2012-11-14T12:11:55.105+0000","lastUpdated":"2013-03-15T16:32:26.287+0000","shortName":"Alive","description":"","formName":"Are you still alive?","active":true,"domainType":"patient","type":"checkbox","textType":"text","aggregationOperator":"sum","categoryCombo":{"name":"default","created":"2011-12-24T11:24:25.203+0000","lastUpdated":"2011-12-24T11:24:25.203+0000","href":"http://apps.dhis2.org/demo/api/categoryCombos/p0KPaWEg3cf","id":"p0KPaWEg3cf"},"url":"","zeroIsSignificant":false,"optionSet":{"name":"Gender","created":"2012-11-13T08:08:51.450+0000","lastUpdated":"2012-11-13T08:08:51.450+0000","href":"http://apps.dhis2.org/demo/api/optionSets/fEDqAkq2X4o","id":"fEDqAkq2X4o"},"legendSet":null,"access":{"manage":true,"externalize":false,"write":true,"read":true,"update":true,"delete":true},"href":"http://apps.dhis2.org/demo/api/dataElements/oZg33kd9taw","id":"checkBoxElementID"}));
        
        self.dataElementCreator = function(dataElement) {
            return new DataElement(dataElement);
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

	}
	/*
	 * Litt forklaring: selectedProgram vil inneholde det man har valgt,
	 * eller undefined hvis det står "Select program" i selecten.
	 * Det er en observable, så den hentes ut ved å kalle viewModel.selectedProgram()
	 * Foreslår at dette brukes til å gjøre get til api.
	 * */

	root.viewModel = new viewModel();
})(survey);

