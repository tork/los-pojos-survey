(function(root){
	var data = function() {
		var self = this;
		
		////////////////////////////////
		// Programs and ProgramStages //
		////////////////////////////////

		self.getProgramIdsAndPopulateDropdown = function() {
			var url = survey.utils.url + "/api/programs.jsonp";
			
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				for (var i = 0; i < data.programs.length; i++) {
					root.viewModel.programs.push(data.programs[i]);
				}
			})
			.fail(function(){
				console.log("Could not fetch program IDs from server");
			});
		};

		self.getProgramStageIdsFromSelectedProgram = function() {
			var chosenProgramId = survey.viewModel.selectedProgram().id;
			var url = survey.utils.url + "/api/programs/" + chosenProgramId + ".jsonp";
			
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				//console.log("Program fetched");
				//console.log(data);
				for (var i = 0; i < data.programStages.length; i++) {
					self.getProgramStagesAndPopulateDropdown(data.programStages[i].id);
				}
			})
			.fail(function() {
				console.log("Could not fetch program stage IDs from server");
			});
		};

		self.getProgramStagesAndPopulateDropdown = function(id) {
			var progStageUrl = survey.utils.url + "/api/programStages/" + id + ".jsonp";
			
			
			$.ajax({
				type: 'GET',
				url: progStageUrl,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				console.log("Program stage fetched");
				//console.log(data);
				root.viewModel.programStages.push(data);
			})
			.fail(function() {
				console.log("Could not fetch program stages from server");
			});
			
		};
		
		
		/////////////////////////////////
		// DataElements and OptionSets //
		/////////////////////////////////

		self.getAllDataElementsForSelectedProgramStage = function() {
			var promises = [];
			for (var i = 0; i < survey.viewModel.selectedProgramStage().programStageDataElements.length; i++) {
				var dataElementId = survey.viewModel.selectedProgramStage().programStageDataElements[i].dataElement.id;
				promises.push(self.getDataElementById(dataElementId));
			}
			$.when.apply($, promises).then(function() {
				console.log("All data elements fetched. Now getting option sets");
				self.getAndAddOptionSetsToDownloadedDataEements();
			});
		};
		
		self.getDataElementById = function(id) {
			var url = survey.utils.url + "/api/dataElements/" + id + ".jsonp";						
			var deferred = new $.Deferred();						
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				//console.log("Data element fetched");
				//console.log(data);
				survey.viewModel.downloadedDataElements.push(data);
				deferred.resolve();
			})
			.fail(function() {
				deferred.reject();
				console.log("Could not fetch data element from server");
			});
			
			return deferred.promise();
		};
		
		self.getAndAddOptionSetsToDownloadedDataEements = function() {
			var promises = [];
			
			for (var i = 0; i < survey.viewModel.downloadedDataElements().length; i++) {
				if (survey.viewModel.downloadedDataElements()[i].optionSet) {
					var optionSetId = survey.viewModel.downloadedDataElements()[i].optionSet.id;
					promises.push(self.getOptionSetForDataElement(survey.viewModel.downloadedDataElements()[i], optionSetId));
				}
			}
			$.when.apply($, promises).then(function() {
				self.allDataElementsAndOptionSetsFethed();
			});
		};
		
		self.getOptionSetForDataElement = function(dataElement, optionSetId) {
			var url = survey.utils.url + "/api/optionSets/" + optionSetId + ".jsonp";
			
			var deferred = new $.Deferred();
			
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				dataElement.optionSet = data;
				survey.viewModel.selectedProgramStagesOptionSets.push(data);
				//console.log(dataElement.optionSet);
				deferred.resolve();
			})
			.fail(function() {
				console.log("Could not fetch option set from server");
				deferred.reject();
			});
			
			return deferred.promise();
		};
		
		self.allDataElementsAndOptionSetsFethed = function() {
			console.log("All downloaded DataElements now have their optionSets:");
			console.log(survey.viewModel.downloadedDataElements());
			
			survey.rearrange(survey.viewModel.downloadedDataElements(), 
							 survey.viewModel.selectedProgramStage().id,
							 self.addDownloadedDataElementsToPage,
							 function() {
								 self.addDownloadedDataElementsToPage(null);
							 });
			
			//survey.rearrange.dev.debug(survey.viewModel.downloadedDataElements(), survey.viewModel.selectedProgramStage.id)
							 
							 
		};
		
		self.addDownloadedDataElementsToPage = function(orderedElements) {
			if (!orderedElements) {
				orderedElements = survey.viewModel.downloadedDataElements();
			}
			
			for (var i = 0; i < orderedElements.length; i++) {
				survey.viewModel.dataElements.push(new survey.viewModel.dataElementCreator(orderedElements[i]));
			}
		};
		
		
		
		///////////
		// Other //
		///////////

		self.get_dependencies = function(surveyId, elements, success, error) {
			var url = survey.utils.surveySettingsUrl(surveyId, 'deps');

			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'text/plain'
			}).done(function(data) {
				if (!data || data == "") {
					data = [];
				} else {
					data = JSON.parse(data);
				}
				success(data);
			}).fail(error);
		};

		self.post_dependencies = function(surveyId, elements, success, error) {
			function elements2dependencies(elements) {
				var deps = {};
				elements.forEach(function(elem) {
					var dep = elem.dependencies;
					if (dep && dep.length) {
						console.log("found dep:");
						console.log(dep);
						deps[elem.id] = dep;
					}
				});

				return deps;
			}

			var url = survey.utils.surveySettingsUrl(surveyId, 'deps');
			var data = JSON.stringify(elements2dependencies(elements));

			$.ajax({
				type: 'POST',
				url: url+'?value='+data,
				//data: JSON.stringify(data),
				contentType: 'text/plain'
			}).fail(error).done(success);
		};

		self.getWebAPI = function() {
			var result = "";
			var url = survey.utils.url + "/api/programs.jsonp?callback=jQuery19108472421790938824_1384426691126&_=1384426691128";

			var x = $.ajax({
				type: 'GET',
				url: url,
				async: false
			})
			.done(function(data) {
				console.log("done", data);

			})
			.fail(function() {
				console.log("GET failed");
			});

			return "";
		};

		self.authenticate = function(username, password) {

			$.ajax({
				url:  survey.utils.url + '/dhis-web-commons-security/login.action?authOnly=true',
				data: {
					j_username: username,
					j_password: password
				},
				type: 'POST',
				dataType: 'jsonp',
				contentType: 'text/html'
			})
			.done(function(data) {
				console.log(data)
			})
			.fail(function(x) {
				console.log("login request failed", x);
			});	
		}

		self.logout = function() {
			var url = survey.utils.url + "/dhis-web-commons-security/logout.action";

			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'

			})
			.done(function() {
				console.log("logout complete");
			})
			.fail(function(err) {
				console.log("logout failed", err);
			});

		};
		
		self.getOrgUnits = function() {
			var urlOrgUnits = survey.utils.url + "/api/currentUser";			
			console.log("URL", urlOrgUnits);
			var currentUser = "";
			
			$.get(urlOrgUnits, function(data) {
				console.log("success orgunits", data); 
			})
			.done(function(data) {
				console.log("GET done.", data);
				currentUser = JSON.parse(data);
				console.log("currentUser: ", currentUser.organisationUnits);
				return currentUser.organisationUnits;
			});
			
			
//			$.ajax({
//                type: 'GET',
//                url: urlOrgUnits,
//                contentType: 'text/plain',
//            })
//            .done(function (done) {
//            	console.log("orgUnits done");
//            })
//            .fail(function(err) {
//				console.log("error getOrgUnits", err);
//			});
			
		}
        
        self.genericGETFunction = function(url, doneFunction, failMsg) {
        	$.ajax({
                type: 'GET',
                url: url,
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .done(doneFunction)
            .fail(function() {
				console.log(failMsg);
			});
        };
	};

	root.data = new data();
})(survey);


