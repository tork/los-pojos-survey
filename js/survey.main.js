(function(viewModel, data, utils){
	$(document).ready(function() {
		$("#menu-toggle").click(function(e) {
			e.preventDefault();
			$("#wrapper").toggleClass("active");
		});
		
		$('#reportDate').attr('max', utils.getDateFormattedForInput(new Date()));

		ko.applyBindings({viewModel: viewModel});
		//survey.data.getPrograms();

		utils.resolveBaseUrl().done(function() {
			console.log("Base url: " + utils.url);
			data.getProgramIdsAndPopulateDropdown();
		}).fail(function(msg) {
			console.log(msg);
		});

	});
})(survey.viewModel, survey.data, survey.utils);
