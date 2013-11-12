(function(root){
	var data = function() {
		var self = this;

		self.getPrograms = function() {
			var url = "http://" + survey.utils.getBaseUrl() + "/api/programs.jsonp";
			console.log("URL: " + url);            
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp'
			})
			.done(function(data) {
				for (var i = 0; i < data.programs.length; i++) {
					self.getExtendedProgramsAndPopulateDropdown(data.programs[i].id);
				}
			})
			.fail(function(){
				console.log("Could not fetch programs from server");
			});
		};


		self.getExtendedProgramsAndPopulateDropdown = function(id) {
			var url = "http://" + survey.utils.getBaseUrl() + "/api/programs/" + id + ".jsonp";
			console.log(url);
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp'
			})
			.done(function(data) {
				console.log("Program: " + data.name + " received!");
				root.viewModel.programs.push(data);
			})
			.fail(function() {
				console.log("Could not fetch extended program info from server");
			});
		};

		self.getProgramStagesFromSelectedProgram = function() {            
			for (var i = 0; i < root.viewModel.selectedProgram().programStages.length; i++) {
				self.getProgramStageAndPopulateDropdown(root.viewModel.selectedProgram().programStages[i].id);
			}
		};

		self.getProgramStageAndPopulateDropdown = function(id) {
			var url = "http://" + survey.utils.getBaseUrl() + "/api/programStages/" + id + ".jsonp";
			console.log(url);
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp'
			})
			.done(function(data) {
				console.log("ProgramStage: " + data.name + " received!");
				root.viewModel.programStages.push(data);
				// TODO: Add ProgramStageDataElements to view model
			})
			.fail(function() {
				console.log("Could not fetch program stages from server.");
			});

		};

		self.authenticate = function(username, password) {
			var url = "http://" + survey.utils.getBaseUrl() + "/dhis-web-commons-security/login.action?authOnly=true";

			console.log(url);
			$.ajax({
				type: 'POST',
				url: url,
				contentType: "application/json",
				data: {"j_username" : username, "j_password" : password}
			})
			.done(function(data) {
				console.log("Log in status:", data);
				// TODO: Add ProgramStageDataElements to view model
			})
			.fail(function(err) {
				console.log("Could not log in.", err.status);
			});


		}

		self.getDHISStartPage = function() {
			var result = "result";
			var url = "http://" + survey.utils.getBaseUrl() + "/api/programs.jsonp";
			console.log("URL: " + url); 


			$.ajax({
				type: 'GET',
				url: url,
			})
			.done(function(data) {
				result = data;
			})
			.fail(function(err){
				console.log("Not logged in");
				result = "invalid";
			});

			return result;

		};
	};


	root.data = new data();
})(survey);


