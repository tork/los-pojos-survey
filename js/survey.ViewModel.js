(function(root){
// Kan nok rename denne etter hvert som vi vet hvilke viewModels vi trenger
    var viewModel = function() {
        var self = this;
        self.programs = ko.observableArray(); //populate with get
        self.programStages = ko.observableArray(); //populate with get
        self.id = ko.observable();
        self.dataElements = ko.observableArray();
    }

    $(function() {
//        root.testModel = new testModel();
//        ko.applyBindings({testModel: root.testModel});
        //Ha én global ready funksjon etter hvert også..
    });
})(survey.viewModels = survey.viewModels || {});
