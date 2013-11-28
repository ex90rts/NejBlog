$(document).ready(function(){
	$.fn.center = function () {
	    this.css("z-index", 999);
		this.css("top", Math.max(0, $(window).scrollTop() + 10) + "px");
		this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
		return this;
	}
	
	var messageState = false;
	if ($(".message").length > 0){
		$( window ).scroll(function() {
        	$(".message").center();
    	});
    	
    	if ($(".message").html().length > 0){
    	    $(".message").show();
    	    messageState = true;
    	}
    	
    	if (messageState){
    		$(".message").center();
    	    $(".message").delay(3000).fadeOut(1600, "linear", function(){
    	        messageState = false;
    	    });
    	}
    }
    
    $.fn.showMessage = function(message){
        this.html(message);
        this.show();
        this.center();
        messageState = true;
        this.delay(5000).fadeOut(1600, "linear", function(){
    	    messageState = false;
    	});
    };

    function addTop(self){
        $.getJSON('/post/addtop/' + $(self).data('id'), function(response){
            if (response.ret == 'succ'){
                var html = $(self).html();
                $(self).html($(self).data('lang'));
                $(self).data('lang', html);
                $(self).unbind('click');
                $(self).click(function(){delTop($(self));});
            }
        });
    }

    function delTop(self){
        $.getJSON('/post/deltop/' + $(self).data('id'), function(response){
            if (response.ret == 'succ'){
                var html = $(self).html();
                $(self).html($(self).data('lang'));
                $(self).data('lang', html);
                $(self).unbind('click');
                $(self).click(function(){addTop($(self));});
            }
        });
    }
    $('a.addtop').click(function(){addTop($(this));});
    $('a.deltop').click(function(){delTop($(this));});
});
