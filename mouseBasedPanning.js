// Mouse Movement Based Panning      

      window.inertia = {};
      window.inertia.speed = 5;
      window.inertia.mX = $(window).height()/2;
      window.inertia.mY = $(window).width()/2;
      window.inertia.curTransX = window.inertia.mX;
      window.inertia.curTransY = window.inertia.mY;
      window.curPage = "home";
      window.inertia[window.curPage] = {};
      window.inertia[window.curPage].elem = [];

      $win = $(window);
      $winWidth = $win.width();
      $winHeight = $win.height();

      var started = false;

      $(window).on("mouseenter", function (e) {
        console.log("mouseenter")
        if(!started){
            started = true;
            $(".elem").each(function(i){   
              if(typeof window.inertia[window.curPage].elem[i] == "undefined"){
                window.inertia[window.curPage].elem[i] = {};
              }

              // This only needs to be set initially
              if(typeof window.inertia[window.curPage].elem[i].curTransX == "undefined"){
                window.inertia[window.curPage].elem[i].curTransX = 0;
                window.inertia[window.curPage].elem[i].curTransY = 0;
                
              }

              window.inertia[window.curPage].elem[i].limit = $(this).attr('data-limit');
              followMouse(window.inertia.mX, window.inertia.mY, window.inertia[window.curPage].elem[i].limit, $(this), i);

            })
        }
      });

      $win.on("mouseleave", function (e) {
        console.log("mouseleave")
        started = false;
      });

      setInterval(function(){
        if(started){
          $(".elem").each(function(i){            
            followMouse(window.inertia.mX, window.inertia.mY, window.inertia[window.curPage].elem[i].limit,  $(this), i);
          })
        }
      }, 50);

      var getAngle = function(cx,cy,ex,ey){
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); 
        theta *= 180 / Math.PI; // Radians to Degrees

        return theta + 180;
      }

      var getCircumferenceXY = function(radius, originX, originY, angle){
        var x = originX + radius * Math.sin(angle * Math.PI/180);
        var y = originY + radius * -Math.cos(angle * Math.PI/180);
        return [Math.round(x),Math.round(y)];
      }


      // Recursive function that updates itself
      var followMouse = function(x, y, lim, elem, i){

        // Get center point of element
        var centerX = 0; // elem.offset().left + (elem.width()/2);
        var centerY = 0; //elem.offset().top + (elem.height()/2);

        // Get arcTangent
        var angle = getAngle(centerX, centerY, (x - $winWidth/2), (y - $winHeight/2));

        var circXY = getCircumferenceXY(lim, centerX, centerY, angle);

        window.inertia[window.curPage].elem[i].curTransY += (circXY[0] - window.inertia[window.curPage].elem[i].curTransY) / window.inertia.speed;
        window.inertia[window.curPage].elem[i].curTransX += (circXY[1] - window.inertia[window.curPage].elem[i].curTransX) / window.inertia.speed;        

        var pX = 0 - ((100/($winWidth/2))*window.inertia[window.curPage].elem[i].curTransX);
        var pY = 0 - ((100/($winHeight/2))*window.inertia[window.curPage].elem[i].curTransY);

        var translate = "translate3d("+pX+"%,"+pY+"%,0)";

        elem.css({"transform":translate});

      }

      $(window).on('mousemove', _.throttle(function(event){

        window.inertia.mX = event.pageX;
        window.inertia.mY = event.pageY;


      }, 20));