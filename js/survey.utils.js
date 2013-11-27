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

    root.translateElementValue = function (element) {
        var val;
        switch (element.type) {
            case 'bool':
                val = element.value() == 'Yes'? true:false;
                break;

            default:
                val = element.value();
                break;
        }
        return val;
    }

    root.alert = function(title, message, type, yesText, noText, yesCallback, noCallback) {
        $("#NoOption").show();
        $("#alertTitle").text(title);
        $("#alertMsg").text(message);
        var yesTxt = yesText ? yesText : "Yes";
        var noTxt = noText ? noText : "No";
        type = type.toLowerCase();
        if(type != "warning") {
            $("#NoOption").hide();
            yesTxt = "Ok";
        }
        if(type != "warning" && type != "error" && type != "success") {
            type = "info";
        }

        var formeeMsgClass = "formee-msg-" + type;

        $("#YesOption").text(yesTxt);
        $("#YesOption").unbind("click");
        if(yesCallback) {
            $("#YesOption").click(yesCallback);
        }

        $("#NoOption").text(noTxt);
        $("#NoOption").unbind("click");
        if(noCallback) {
            $("#NoOption").click(noCallback);
        }

        $("#alert").show();
        $.featherlight($("#alert"), {
            close: function(e) {
                this.$instance.hide();
                $(".featherlight-content").removeClass("featherlight-alert");
                $(".featherlight-content").removeClass(formeeMsgClass);
            },
            variant: 'myCssClass'
        });
        $(".featherlight-content").addClass("featherlight-alert");
        $(".featherlight-content").addClass(formeeMsgClass);
    };

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };

    root.log = function(msg) {
        if (root.debug) return console.log(msg);
    }

    root.debug = false;
})(survey.utils = survey.utils || {})
