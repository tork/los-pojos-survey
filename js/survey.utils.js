(function(root){
    root.getBaseUrl = function () {
        return window.location.origin == "file://" ? "localhost:8082" : "apps.dhis2.org/demo";
    }

    root.surveySettingsUrl = function(surveyId, loc) {
    	return
    		root.getBaseUrl() +
    		'/api/systemSettings/los-pojos.' +
    		surveyId +
    		'.' +
    		loc;
    }
})(survey.utils = survey.utils || {})
