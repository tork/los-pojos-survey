(function(viewModel, root) {
    /* Inneholder all data om et dataelement. Planen er å etterhvert utvide dette til å også inneholde skip logic*/
    root.DataElement = function(dataelement) {
        var self = this;
        self.id = dataelement.id;
        self.name = dataelement.name;
        self.formName = dataelement.formName;
        self.description = dataelement.description;
        self.type =  dataelement.type;

        self.dependencies = [
            {"id" : "Age", "values" : [0, 20]},
            {"id" : "checkBoxElementID", "values" : ["true"]}
        ];

        self.value = ko.observable();
        self.dropDownOpts = ko.observableArray();
        self.dropDownOpts.push("Yes"); //Do this when dataElement is inserted in viewModel
        self.dropDownOpts.push("No");   //instead of this hard coded edition :P

        //skip logic
        self.triggerOption = ko.observable(); //If adding dep to bool dataElement

        self.interval = ko.observable();
        self.commaList = ko.observable(); //If adding dep to int, string or date(only one) dataElement with specific values

        self.lowerLimit = ko.observable(); //If adding dep to int dataElement with interval
        self.upperLimit = ko.observable();  //If adding dep to int dataElement with interval


        self.isDependent = ko.observable(false);
        self.isInSkipLogic = ko.observable(false);
        self.addingSkipLogic = ko.observable(false);
    };
})(survey.viewModel, survey.models = survey.models || {});
