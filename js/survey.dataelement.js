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

        if(self.type === 'checkbox')
            self.value = ko.observable(false);
        else
            self.value = ko.observable("");

        self.isDependent = ko.observable(false);

        //skip logic
        self.isInSkipLogic = ko.observable(false);
        self.addingSkipLogic = ko.observable(false);
    };
})(survey.viewModel, survey.models = survey.models || {});
