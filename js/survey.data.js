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
                root.viewModel.dataElements.push(new root.viewModel.dataElementCreator(data)); // CONTINUE HERE
            })
            .fail(function() {
                console.log("Could not fetch data element from server");
            });
            
        };
        
        
    };
    
    
    root.data = new data();
})(survey);


