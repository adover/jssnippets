      // Recursive function that updates itself
      var followMouse = function(x, y, lim, elem, i){

        // Initially animate each element to the mouse X position
        var newX = 0 - (x - ($winWidth/2)); 
        var newY = 0 - (y - ($winHeight/2));

        var pX = Math.round((newX/($winWidth/2)) * 100);
        var pY = Math.round((newY/($winHeight/2)) * 100);

        lim = lim.split(",");

        var newPCx = (100/lim[0]) * pX;
        var newPCy = (100/lim[1]) * pY;

        var translate = "translate3d("+newPCx+"px,"+newPCy+"px,0)";

        elem.css({"transform":translate});

      }

      $(window).on('mousemove', _.throttle(function(event){

        window.inertia.mX = event.pageX;
        window.inertia.mY = event.pageY;


      }, 20));

      return this;
    }