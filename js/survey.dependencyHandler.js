(function(root){

    /*
    element: The dataElement to create a dependency on
    dependentOnElement: The element it should depend on
     */
    root.addDependency = function(element, dependentOnElement /*need something more*/) {
        var dependency = {
            id: dependentOnElement.id
        };
        //Set element.dependencies to something..
    };

})(survey.dependencyHandler = survey.dependencyHandler || {});
