(function(root){
    root.getBaseUrl = function () {
        return window.location.origin == "file://" ? "localhost:8082" : "apps.dhis2.org/demo";
    };

    root.surveySettingsUrl = function(surveyId, loc) {
    	return
    		root.getBaseUrl() +
    		'/api/systemSettings/los-pojos.' +
    		surveyId +
    		'.' +
    		loc;
    };

    root.getDateFormattedForInput = function (date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month < 10 ? "0" + month : month;
        var day = date.getDate();
        day = day < 10 ? "0" + day : day;

        return year + "-" + month + "-" + day;
    };
})(survey.utils = survey.utils || {})
