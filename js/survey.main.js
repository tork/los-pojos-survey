(function(viewModel, data){
	$(document).ready(function() {
		$("#menu-toggle").click(function(e) {
			e.preventDefault();
			$("#wrapper").toggleClass("active");
		});

		ko.applyBindings({viewModel: viewModel});
		//survey.data.getPrograms();
		data.getProgramIdsAndPopulateDropdown();
	});
})(survey.viewModel, survey.data);

