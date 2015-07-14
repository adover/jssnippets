// Fancy Text Rearrangement
// 2015 Andy Dover
(function($){
    var methods = {
        init : function () {

            return this.each(function(methods) {

                var el = $(this);

                el.css({"position":"relative"});
                var text = el.text();
                text = text.split('');
                el.empty();

                $.each(text, function(k,v){
                    var str = "<span>"+v+"</span>";
                    el.append(str);
                })
                
                var spanArr = [];

                el.find("span").each(function(){
                    var os = $(this).position().left;
                    spanArr.push($(this));
                    $(this).attr("data-left",Math.round(os));
                })

                el.empty();
                
                spanArr = _.shuffle(spanArr);

                $.each(spanArr, function(k,v){
                    $(v).appendTo(el);

                    var thisPosLeft =  Math.round(el.find('span').eq(k).position().left) + "px";

                    el.find('span:eq('+k+')').attr('data-setleft', thisPosLeft);

                });

                el.find("span").each(function(){
                    var leftToSet = $(this).attr("data-setleft");
                    $(this).css({"left":leftToSet, "position":"absolute"})
                    
                    
                })

            });
        },
        swap: function(){
            var el = this;
            el.find("span").each(function(i){a
                var originalLeft = $(this).attr("data-left")+"px";
                var span = $(this);
                var time = Math.ceil(Math.random()*1000);
                console.log(time);
                var timer = setTimeout(function(){
                    span.css({"left":originalLeft});
                }, time);
            })
        }
    }
    $.fn.rearrange = function(methodOrOptions){
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.rearrange' );
        }    
    };

})(jQuery);
