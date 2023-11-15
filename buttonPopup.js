(function ($) {
	var settings = {};
	var displayed = false;
	var methods = {
		init: function(options) {
	        settings = $.extend({
	        	message: "Click OK to continue",
	        	fadeTime: 250,
	        	buttons: [{
	        		label: "OK",
	        		action: function() {
	        			methods.close();
	        		}
	        	}]
	        }, options );
	        //build popup here
	        var popup = $('<div class="buttonPopup"></div>');
	        popup.css("display","none");
	        var msg = $('<div>'+settings.message+'</div>');
	        popup.append(msg);
	        for (var i=0;i<settings.buttons.length;i++) {
	        	var button = $('<button type="button">'+settings.buttons[i].label+'</button>');
	        	popup.append(button);
	        	button.click(settings.buttons[i].action);
	        }
	        $(this).append(popup);
	        popup.fadeIn(settings.fadeTime);
		},
		close: function() {
			displayed = false;
			$(".buttonPopup").fadeOut(settings.fadeTime, function() {
				$(this).remove();
			});
		}
	}
	
    $.fn.buttonPopup = function( options ) {
		if (methods[options]) {
			return methods[options].apply(this,Array.prototype.slice.call(arguments,1));
    	}
		else if (typeof options === 'object') {
			if (displayed) {
				return;
			}
			displayed = true;
			return methods.init.apply(this,arguments);
		}
        return this;
    };
 
}( jQuery ));