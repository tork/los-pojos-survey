(function(viewModel, root, utils) {
    /* Inneholder all data om et dataelement. Planen er å etterhvert utvide dette til å også inneholde skip logic*/
    root.DataElement = function(dataelement) {
        var self = this;
        self.id = dataelement.id;
        self.name = dataelement.name;
        self.formName = dataelement.formName ? dataelement.formName : dataelement.name;
        self.description = dataelement.description;
        self.type =  dataelement.type;
		self.optionSet = dataelement.optionSet;

        self.dependencies = [];

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

        self.resetSkipLogicUI = function() {
            self.triggerOption("");
            self.interval(false);
            self.commaList("");
            self.lowerLimit("");
            self.upperLimit("");
            self.isDependent(false);
            self.isInSkipLogic(false);
        };

        self.setSkipLogicUIElements = function(dataElement) {
            $.each(self.dependencies, function(i, dep) {
                if(dep.id === dataElement.id) {
                    if(dep.triggers[0].from !== undefined) {
                        self.interval(true)
                        if(dataElement.type === "int") {
                            self.lowerLimit(dep.triggers[0].from);
                            self.upperLimit(dep.triggers[0].to);
                        } else {
                            var date = dep.triggers[0].from;
                            self.lowerLimit(utils.getDateFormattedForInput(date));
                            date = dep.triggers[0].to;
                            self.upperLimit(utils.getDateFormattedForInput(date));
                        }
                    } else {
                        if(dataElement.type === "bool") {
                            var value = dep.triggers[0] == true ? "Yes" : "No";
                            self.triggerOption(value);
                        } else if(dataElement.type === "date") {
                            self.commaList(utils.getDateFormattedForInput(dep.triggers[0]));
                        } else {
                            self.commaList(dep.triggers.join(","));
                        }
                    }

                }
            });
        }
    };
})(survey.viewModel, survey.models = survey.models || {}, survey.utils);
