(function(root){
    root.getBaseUrl = function () {
        return window.location.origin.indexOf("http://localhost") == 0  ? "localhost:8082" : "apps.dhis2.org/demo";
    };

    root.resolveBaseUrl = function() {
        var deferred = new $.Deferred();
        if(root.getBaseUrl() === "localhost:8082") {
            root.url = "http://localhost:8082";
            deferred.resolve();
        } else {
            $.get("./manifest.webapp").done(function(manifest){
                var manifestObj = JSON.parse(manifest);
                root.url = manifestObj.activities.dhis.href;
                deferred.resolve();
            }).fail(function() {
               deferred.reject("Could not read manifest.webapp");
            });
        }

        return deferred.promise();
    }

    root.surveySettingsUrl = function(surveyId, loc) {
    	return root.url +
    		'/api/systemSettings/los-pojos_' +
    		surveyId +
    		'_' +
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

    root.debug = false;
})(survey.utils = survey.utils || {})
