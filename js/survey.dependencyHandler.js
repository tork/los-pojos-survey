(function(root){

    /*
    element: The dataElement to create a dependency on
    dependentOnElement: The element it should depend on
     */
    root.addDependency = function(parentElement, element) {
        var deferred = new $.Deferred();
        var dependency = {
            id: parentElement.id,
            triggers: []
        };
        if(parentElement.type === "trueOnly") {
            dependency.triggers.push(true);
        } else if(parentElement.type === "bool") {
            dependency.triggers.push(element.triggerOption() === "Yes"); //TODO: "Yes"/"No" eller true/false?
        } else if(parentElement.type === "int") {
            if(element.interval()) {
                //TODO: hva skulle vi ha av validering her igjen?
                dependency.triggers.push({from: parseInt(element.lowerLimit()), to: parseInt(element.upperLimit())});
            } else {
                dependency.triggers = $.map(element.commaList().split(","), function(num) {
                    if(!isNaN(num)) {
                        return parseInt(num);
                    }
                });
            }
        } else if(parentElement.type === "string") {
            dependency.triggers = element.commaList().split(",");
        } else if(parentElement.type === "date") { //TODO: finne ut hvordan dhis takler date + validering?
            if(element.interval()) {
                dependency.triggers.push({from: element.lowerLimit(), to: element.upperLimit()});
            } else {
                dependency.triggers.push(element.commaList());
            }
        } else if (parentElement.type === "string with optionSet") {
            //TODO: Something should be done here, but not this:
            dependency.triggers = ["I'm not implemented! :D (dependencyHandler.addDependency())"];
        } else {
            deferred.reject("No such type");
        }

        addOrUpdateDependency(element, dependency);
        deferred.resolve();
        return deferred.promise();
    };

    root.removeDependency = function(parentElement, element) {
        var deps = element.dependencies;
        for(var i = 0; i < deps.length; i++) {
            if(deps[i].id == parentElement.id) {
                deps.splice(i, 1);
            }
        }
    };

    root.hasDependency = function(element, potentialParent) {
        var deps = element.dependencies;
        if(!deps) {
            return false;
        }
        for(var i = 0; i < deps.length; i++) {
            if(deps[i].id == potentialParent.id) {
                return true;
            }
        }

        return false;
    };

    function addOrUpdateDependency(element, dependency) {
        var deps = element.dependencies;
        for(var i = 0; i < deps.length; i++) {
            if(deps[i].id === dependency.id) {
                deps[i].triggers = dependency.triggers;
                return;
            }
        }

        element.dependencies.push(dependency);
    }

})(survey.dependencyHandler = survey.dependencyHandler || {});
