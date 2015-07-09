(function($){
    $.fn.extend({
        // change 'pluginname' to your plugin name (duh)
        pluginname: function(options) {

            // options for the plugin
            var defaults = {
                width: 500,
                height: 300
            }

            var options =  $.extend(defaults, options);

            return this.each(function() {
                // main code goes here, will apply to each element of $(this)
                // e.g. `$(this).click( function() {} )`
                // also have access to `options` i.e. `options.width`
            });
        }
    });
})(jQuery);