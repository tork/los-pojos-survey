(function(root){
	var data = function() {
		var self = this;

		self.getProgramIdsAndPopulateDropdown = function() {
			var url = "http://" + survey.utils.url + "/api/programs.jsonp";
			
			self.genericGETFunction(url, function(data) {
				for (var i = 0; i < data.programs.length; i++) {
					root.viewModel.programs.push(data.programs[i]);
				}
			} ,"Could not fetch program IDs from server");
			
			/*
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
			*/
		};

		self.getProgramStageIdsFromSelectedProgram = function() {
			var chosenProgramId = survey.viewModel.selectedProgram().id;
			var url = "http://" + survey.utils.url + "/api/programs/" + chosenProgramId + ".jsonp";

			self.genericGETFunction(url, function(data) {
				console.log("Program fetched");
				console.log(data);
				for (var i = 0; i < data.programStages.length; i++) {
					self.getProgramStagesAndPopulateDropdown(data.programStages[i].id);
				}
			}, "Could not fetch program stage IDs from server");
			
			/*
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
			*/
		};

		self.getProgramStagesAndPopulateDropdown = function(id) {
			var progStageUrl = "http://" + survey.utils.url + "/api/programStages/" + id + ".jsonp";
			
			self.genericGETFunction(progStageUrl, function(data) {
				console.log("Program stages fetched");
				console.log(data);
				root.viewModel.programStages.push(data);
			}, "Could not fetch program stages from server");
			
			/*
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
			*/
		};

		//TODO: untested (cross-domain trouble)
		self.get_dependencies = function(surveyId, elements, success, error) {
			var url = survey.utils.surveySettingsUrl(surveyId, 'deps');

			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'text/plain'
			}).done(function(data) {
				data = JSON.parse(data);
				success(data);
			}).fail(error);
		};

		//TODO: untested (cross-domain trouble)
		self.post_dependencies = function(surveyId, elements) {
			function elements2dependencies(elements, success, error) {
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
			}).done(success).fail(error);
		};

		self.getAndInsertDataElementsForSelectedProgramStage = function() {
			var promises = [];
			for (var i = 0; i < survey.viewModel.selectedProgramStage().programStageDataElements.length; i++) {
				var dataElementId = survey.viewModel.selectedProgramStage().programStageDataElements[i].dataElement.id;
				promises.push(self.getAndInsertDataElementById(dataElementId));
			}
			$.when.apply($, promises).then(function() {
				console.log();				
				// All dataelements are fetched and added into survey.viewModel.downloadedDataElements
				self.getAllOptionSetsForSelectedProgramStage();
			});
		};
		
		self.getAllOptionSetsForSelectedProgramStage = function() {
			var promises = [];
			console.log(survey.viewModel.downloadedDataElements().length);
			
			for (var i = 0; i < survey.viewModel.downloadedDataElements().length; i++) {
				console.log(survey.viewModel.downloadedDataElements()[i]);
				if (survey.viewModel.downloadedDataElements()[i].optionSet) {
					var optionSetId = survey.viewModel.downloadedDataElements()[i].optionSet.id;
					promises.push(self.getOptionSetForDataElement(survey.viewModel.downloadedDataElements()[i], optionSetId));
				}
			}
			$.when.apply($, promises).then(function() {
				console.log("ALLE DATAELEMENTS MED OPTIONSET HAR NÅ FÅTT OPTIONSETTET SITT");
				// TODO: HENT ALLE DEPENDENCIES FØR ALLE DOWNLOADEDDATAELEMENTS
				var arr = survey.rearrange(survey.viewModel.downloadedDataElements(), survey.viewModel.selectedProgramStage.id, successFunction, failFunction);
				
				// All dataelements are fetched and added into survey.viewModel.downloadedDataElements
			});
		};
		
		self.getOptionSetForDataElement = function(dataElement, optionSetId) {
			var url = "http://" + survey.utils.url + "/api/optionSets/" + optionSetId + ".jsonp";
			
			var deferred = new $.Deferred();
			
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				dataElement.optionSet = data;
				console.log(dataElement.optionSet);
				deferred.resolve();
			})
			.fail(function() {
				console.log("Could not fetch option set from server");
				deferred.reject();
			});
			
			return deferred.promise();
		};
		

		self.getAndInsertDataElementById = function(id) {
			var url = "http://" + survey.utils.url + "/api/dataElements/" + id + ".jsonp";			
			
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
				if (data.optionSet) {
					var optionSetId = data.optionSet.id;
					self.getOptionSet(optionSetId);
				}
				root.viewModel.downloadedDataElements.push(new root.viewModel.dataElementCreator(data));
				
				deferred.resolve(data);
			})
			.fail(function() {
				deferred.reject();
				console.log("Could not fetch data element from server");
			});
			
			return deferred.promise();
			
			/*
			self.genericGETFunction(url, function(data) {
				console.log("Data element fetched");
				console.log(data);
				if (data.optionSet) {
					var optionSetId = data.optionSet.id;
					self.getOptionSet(optionSetId);
				}
				//root.viewModel.downloadedDataElements.push(new root.viewModel.dataElementCreator(data));
				root.viewModel.dataElements.push(new root.viewModel.dataElementCreator(data));
				
			}, "Could not fetch data element from server");
			*/
			
			
			/*
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				console.log("Data element fetched");
				console.log(data);
				if (data.optionSet) {
					var optionSetId = data.optionSet.id;
					self.getOptionSet(optionSetId);
				}                
				root.viewModel.dataElements.push(new root.viewModel.dataElementCreator(data));
			})
			.fail(function() {
				console.log("Could not fetch data element from server");
			});
			*/

		};

		self.getOptionSet = function(id) {
			var url = "http://" + survey.utils.url + "/api/optionSets/" + id + ".jsonp";
			
			self.genericGETFunction(url, function(data) {
				console.log("Option set fetched");
				console.log(data);
				root.viewModel.selectedProgramStagesOptionSets().push(data);
			}, "Could not fetch option set from server");
			
			/*
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json',
				dataType: 'jsonp'
			})
			.done(function(data) {
				console.log("Option set fetched");
				console.log(data);
				root.viewModel.selectedProgramStagesOptionSets().push(data);
			})
			.fail(function() {
				console.log("Could not fetch option set from server");
			});
			*/
		};

		self.getWebAPI = function() {
			var result = "";
			var url = "http://localhost:8082/api/programs.jsonp?callback=jQuery19108472421790938824_1384426691126&_=1384426691128";
			
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
		        url: 'http://apps.dhis2.org/demo/dhis-web-commons-security/login.action?authOnly=true',
		        data: {
		            j_username: username,
		            j_password: password
		        },
		        type: 'POST',
		        dataType: 'json',
		        contentType: 'text/html'
		    })
			.done(function(data) {
			    console.log(data)
			})
			.fail(function(x) {
			    console.log("login request failed", x);
			});
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


