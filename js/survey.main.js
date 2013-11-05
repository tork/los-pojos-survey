(function(viewModels){
    $(document).ready(function() {
	    $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("active");
        });

        ko.applyBindings({viewModel: viewModels.viewModel})
    });
})(survey.viewModels);
