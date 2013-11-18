(function(root) {
    root.displayErrorMessage = function(msg) {
        $("#error").show();
        if(!msg) {
            $("#msg").html("We don't know what just happened, but hopefully it wasn't too bad!" +
            "<br> Sorry for the inconvenience");
        }
        $("#msg").html(msg);
        $.featherlight($("#error"), {
            close: function(e) {
                this.$instance.hide();
            }
        });
    }

})(survey.error = survey.error || {});
