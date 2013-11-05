(function(root){
// Kan nok rename denne etter hvert som vi vet hvilke viewModels vi trenger - iallfall hvis vi trenger flere!
    var viewModel = function() {
        var self = this;
        //må pushe objecter med minimum en prop kalt name i programs og programStages
        //Kan være lurt å ha en model som ser slik ut kanskje: {name: "Navnet", id: "idsomething"}s
        self.programs = ko.observableArray(); //populate with get
        self.selectedProgram = ko.observable();
        self.programStages = ko.observableArray(); //populate with get
        self.selectedProgramStage = ko.observable();
        self.dataElements = ko.observableArray();
    }

    /*
    * Litt forklaring: selectedProgram vil inneholde det man har valgt,
    * eller undefined hvis det står "Select program" i selecten.
    * Det er en observable, så den hentes ut ved å kalle viewModel.selectedProgram()
    * Foreslår at dette brukes til å gjøre get til api.
    * */

    root.viewModel = new viewModel();
})(survey);
