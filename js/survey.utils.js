(function(root){
    root.getBaseUrl = function () {
        return window.location.origin == "file://" ? "localhost:8082" : "apps.dhis.org/demo";
    }
})(survey.utils = survey.utils || {})
