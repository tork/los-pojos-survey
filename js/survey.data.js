(function(root){
    var data = function() {
        var self = this;
        
        self.getProgramIdsAndPopulateDropdown = function() {
            var url = "http://" + survey.utils.getBaseUrl() + "/api/programs.jsonp";
            console.log("URL: " + url);            
            $.ajax({
               type: 'GET',
                url: url,
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .done(function(data) {
                for (var i = 0; i < data.programs.length; i++) {
                    root.viewModel.programs.push(data.programs[i]);
                }
            })
            .fail(function(){
                console.log("Could not fetch program IDs from server");
            });
        };
        
        self.getProgramStageIdsFromSelectedProgram = function() {
            var chosenProgramId = survey.viewModel.selectedProgram().id;
            var url = "http://" + survey.utils.getBaseUrl() + "/api/programs/" + chosenProgramId + ".jsonp";
            console.log(url);
                        
            $.ajax({
                type: 'GET',
                url: url,
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .done(function(data) {
                console.log("Program fetched");
                console.log(data);
                for (var i = 0; i < data.programStages.length; i++) {
                    self.getProgramStagesAndPopulateDropdown(data.programStages[i].id);
                }
            })
            .fail(function() {
                console.log("Could not fetch program stage IDs from server");
            });
        };
        
        self.getProgramStagesAndPopulateDropdown = function(id) {
            var progStageUrl = "http://" + survey.utils.getBaseUrl() + "/api/programStages/" + id + ".jsonp";
            $.ajax({
                type: 'GET',
                url: progStageUrl,
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .done(function(data) {
                console.log("Program stages fetched");
                console.log(data);
                root.viewModel.programStages.push(data);
            })
            .fail(function() {
                console.log("Could not fetch program stages from server");
            });
        };

        //TODO: untested (cross-domain trouble)
        self.get_dependencies = function(surveyId, elements, success, error) {
            var url = survey.utils.surveySettingsUrl(surveyId, 'deps');

            $.ajax({
                type: 'GET',
                url: url,
                contentType: 'text/plain'
            }).done(function(data) {
                data = JSON.parse(data);
                success(data);
            }).fail(error);
        };

        //TODO: untested (cross-domain trouble)
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
                data: JSON.stringify(data),
                contentType: 'text/plain'
            }).done(success).fail(error);
        
        self.getAndInsertDataElementsForSelectedProgramStage = function() {
            for (var i = 0; i < survey.viewModel.selectedProgramStage().programStageDataElements.length; i++) {
                var dataElementId = survey.viewModel.selectedProgramStage().programStageDataElements[i].dataElement.id;
                self.getAndInsertDataElementById(dataElementId);
            }
        };
        
        self.getAndInsertDataElementById = function(id) {
            var url = "http://" + survey.utils.getBaseUrl() + "/api/dataElements/" + id + ".jsonp";
            $.ajax({
                type: 'GET',
                url: url,
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .done(function(data) {
                console.log("Data element fetched");
                console.log(data);
                root.viewModel.dataElements.push(data);
            })
            .fail(function() {
                console.log("Could not fetch data element from server");
            });
        };
    };
    
    
    root.data = new data();
})(survey);


