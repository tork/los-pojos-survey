(function(root){
// Kan nok rename denne etter hvert som vi vet hvilke viewModels vi trenger - iallfall hvis vi trenger flere!
    var viewModel = function() {
        var self = this;
        self.programs = ko.observableArray(); //populate with get
        self.programStages = ko.observableArray(); //populate with get
        self.id = ko.observable();
        self.dataElements = ko.observableArray();
    }

    root.viewModel = new viewModel();
})(survey.viewModels = survey.viewModels || {});
