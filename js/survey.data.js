(function(root){
    var data = function() {
        var self = this;
        
        self.getPrograms = function() {
            var url = "http://" + survey.utils.getBaseUrl() + "/api/programs.jsonp";
            console.log("URL: " + url);            
            $.ajax({
               type: 'GET',
                url: url,
                contentType: "application/json",
                dataType: 'jsonp'
            })
            .done(function(data) {
                for (var i = 0; i < data.programs.length; i++) {
                    self.getExtendedProgramsAndPopulateDropdown(data.programs[i].id);
                }
            })
            .fail(function(){
                console.log("Could not fetch programs from server");
            });
        };
        
        
        self.getExtendedProgramsAndPopulateDropdown = function(id) {
            var url = "http://" + survey.utils.getBaseUrl() + "/api/programs/" + id + ".jsonp";
            console.log(url);
            $.ajax({
                    type: 'GET',
                    url: url,
                    contentType: "application/json",
                    dataType: 'jsonp'
                })
                .done(function(data) {
                    console.log("Program: " + data.name + " received!");
                    root.viewModel.programs.push(data);
                })
                .fail(function() {
                    console.log("Could not fetch extended program info from server");
                });
        };
        
        self.getProgramStagesFromSelectedProgram = function() {            
            for (var i = 0; i < root.viewModel.selectedProgram().programStages.length; i++) {
                self.getProgramStageAndPopulateDropdown(root.viewModel.selectedProgram().programStages[i].id);
            }
        };

        self.getProgramStageAndPopulateDropdown = function(id) {
            var url = "http://" + survey.utils.getBaseUrl() + "/api/programStages/" + id + ".jsonp";
            console.log(url);
            $.ajax({
                type: 'GET',
                    url: url,
                    contentType: "application/json",
                    dataType: 'jsonp'
            })
            .done(function(data) {
                console.log("ProgramStage: " + data.name + " received!");
                root.viewModel.programStages.push(data);
                // TODO: Add ProgramStageDataElements to view model
            })
            .fail(function() {
                console.log("Could not fetch program stages from server.");
            });
            
        };

        self.get_dependencies = function(surveyId, elements, success, error) {
            var url = survey.utils.surveySettingsUrl(surveyId, 'deps');

            $.ajax({
                type: 'GET',
                url: url,
                contentType: 'text/plain'
            }).done(function(data) {
                elements.forEach(function(elem) {
                    elem.dependencies =
                        Object.getOwnPropertyDescriptor(
                            data, elem.element_id);
                });
                success(data);
            }).fail(error);
        };

        self.post_dependencies = function(surveyId, elements) {
            function elements2dependencies(elements, success, error) {
                var deps = {};
                elements.forEach(function(elem) {
                    var dep = elem.dependencies;
                    if (dep) {
                        Object.defineProperty(deps, elem.element_id, dep);
                    }
                });

        // deluxe array edition (slow)
        //      var deps = [];
        //      elements.forEach(function(elem) {
        //          var dep = elem.dependencies;
        //          if (dep) {
        //              deps.push(dep);
        //          }
        //      });

                return deps;
            }

            var url = survey.utils.surveySettingsUrl(surveyId, 'deps');
            var data = elements2dependencies(elements);

            $.ajax({
                type: 'POST',
                url: url,
                data: data,
                contentType: 'text/plain'
            }).done(success).fail(error);
        };
    };
    
    root.data = new data();
})(survey);


