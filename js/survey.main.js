(function(viewModel){
    $(document).ready(function() {
	    $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("active");
        });

        ko.applyBindings({viewModel: viewModel});
        //survey.data.getPrograms();
        survey.data.getProgramIdsAndPopulateDropdown();
    });
})(survey.viewModel, survey.data);

