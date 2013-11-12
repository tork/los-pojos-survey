(function(root){

    /*
    element: The dataElement to create a dependency on
    dependentOnElement: The element it should depend on
     */
    root.addDependency = function(parentElement, element /*need something more*/) {
        var deferred = new $.Deferred();
        var dependency = {
            id: parentElement.id,
            triggers: []
        };
        if(parentElement.type === "trueOnly") {
            dependency.triggers.push([true]);
        } else if(parentElement.type === "bool") {
            dependency.triggers.push([element.triggerOption()]); //TODO: "Yes"/"No" eller true/false?
        } else if(parentElement.type === "int") {
            if(element.interval()) {

            } else {
                var numbers = $.map(element.commaList().split(","), function(num) {
                    return parseInt(num);
                });
                $.each(numbers, function(index, num) {
                    if(!isNaN(num)) {
                        dependency.triggers.push(num);
                    }
                })
            }
        } else if(parentElement.type === "string") {

        } else if(parentElement.type === "date") {

        } else {
            deferred.reject("No such type");
        }

        element.dependencies.push(dependency);
        deferred.resolve();
        //Set element.dependencies to something..
        return deferred.promise();
    };

})(survey.dependencyHandler = survey.dependencyHandler || {});
