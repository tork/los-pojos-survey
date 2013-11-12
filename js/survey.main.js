(function(viewModel){
	$(document).ready(function() {
		$("#menu-toggle").click(function(e) {
			e.preventDefault();
			$("#wrapper").toggleClass("active");
		});

		ko.applyBindings({viewModel: viewModel});
		
//		if(survey.viewModel.isLoggedIn())
//			survey.data.getPrograms();
//		else
//			console.log("LOG IN!");
		survey.viewModel.startUp();
		

	});
})(survey.viewModel, survey.data);

