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
				console.log("Program fetched");
				console.log(data);
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
				console.log("Program stages fetched");
				console.log(data);
				root.viewModel.programStages.push(data);
			})
			.fail(function() {
				console.log("Could not fetch program stages from server");
			});
			
		};
		
		
		/////////////////////////////////
		// DataElements and OptionSets //
		/////////////////////////////////

		self.getAllDataElementsForSelectedProgramStageAndAddToDownloadedDataElements = function() {
			var promises = [];
			for (var i = 0; i < survey.viewModel.selectedProgramStage().programStageDataElements.length; i++) {
				var dataElementId = survey.viewModel.selectedProgramStage().programStageDataElements[i].dataElement.id;
				promises.push(self.getDataElementById(dataElementId));
			}
			$.when.apply($, promises).then(function() {
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
				console.log("Data element fetched");
				console.log(data);
				root.viewModel.downloadedDataElements.push(new root.viewModel.dataElementCreator(data));
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
			console.log(survey.viewModel.downloadedDataElements().length);
			
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
				console.log(dataElement.optionSet);
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
							 function() { console.log("Rearrangement failed"); });
		};
		
		self.addDownloadedDataElementsToPage = function(res) {
			console.log("Rearrange finished successfully");
			console.log(res);
			
			for (var i = 0; i < survey.viewModel.downloadedDataElements().length; i++) {
				survey.viewModel.dataElements().push(survey.viewModel.downloadedDataElements()[i]);
			}
		};
		
		
		
		///////////
		// Other //
		///////////

		//TODO: untested (cross-domain trouble)
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

		//TODO: untested (cross-domain trouble)
		self.post_dependencies = function(surveyId, elements, success, error) {
			function elements2dependencies(elements) {
				var deps = {};
				elements.forEach(function(elem) {
					var dep = elem.dependencies;
					if (dep) {
						deps[elem.element_id] = dep;
					}
				});

				// deluxe array edition (slow)
				//      var deps = [];
				//      elements.forEach(function(elem) {
				//          var dep = elem.dependencies;
				//          if (dep) {
				//              deps.push(dep);
				//          }
				//      });

				return deps;
			}

			var url = survey.utils.surveySettingsUrl(surveyId, 'deps');
			var data = elements2dependencies(elements);

			$.ajax({
				type: 'POST',
				url: url,
				data: JSON.stringify(data),
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


