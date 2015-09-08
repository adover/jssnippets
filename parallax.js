define([
    'jquery',
    'underscore',
    'backbone',
    'libs/utils/utils',
    'requestAnimationFrame',
    'audio',
    'libs/rearrange/jquery.rearrange',
    'libs/velocity/velocity.min'
  ],
  function($, _, Backbone, utils, requestAnimationFrame, audio) {

    var PROPERTIES = ['translateX', 'translateY', 'opacity', 'rotate', 'rotateX', 'scale'],
      $window = $(window),
      $body = $('body'),
      scenes = [],
      currentWrapper = null,
      scrollTimeoutID = 0,
      bodyHeight = 0,
      windowHeight = 0,
      windowWidth = 0,
      prevKeyframesDurations = 0,
      scrollTop = 0,
      relativeScrollTop = 0,
      currentKeyframe = 0,
      currentScene = 0,
      audioTriggers = [];

    window.keyframes = '';
    window.lastKeyFrame = 0;
    window.currentKeyframe = 0;
    window.isScrolling = false;

    // TODO: Add keyframes
    /*  Construction
    -------------------------------------------------- */
    var init = function(story) {
      if ((utils.getBrowser().device == "desktop" || utils.getBrowser().device == "iPad" || utils.getBrowser().device == "tablet")) {
        $.getJSON("/content/keyframes_story_" + story + ".json", function(json) {
          window.keyframes = json[0];
          jsonInit();
        });
      } else {
        $.getJSON("/content/keyframes_story_" + story + "_mobile.json", function(json) {
          window.keyframes = json[0];
          jsonInit();
        });
      }
    }

    var jsonInit = function() {
      scrollIntervalID = requestAnimationFrame(updatePage);
      scrollTop = $window.scrollTop();
      windowHeight = $window.height();
      windowWidth = $window.width();
      convertAllPropsToPx();
      var pageHeight = buildPage();
    }

    var buildPage = function() {
      $.each(window.keyframes, function(k, v) {
        bodyHeight += v.duration;

        // Within each keyframe I need to loop wrappers
        $.each(v.wrappers, function(l, m) {
          $.each(m.animations, function(aK, aV) { /// Loop the animations
            Object.keys(aV).forEach(function(key) { // loop properties

              value = aV[key];
              // If Array already set, it has an initial value
              if (key !== 'selector' && value instanceof Array === false) {
                var valueSet = [];
                valueSet.push(getDefaultPropertyValue(key), value);
                value = valueSet;
              }
              aV[key] = value;
            });
          })
        })

      });

      $window.scroll(0);

      //  Set all wrappers in the first keyframe to visible
      $(Object.keys(window.keyframes[0].wrappers).toString()).show();

      $('#container').scrollTop(0);
      $('#container').outerHeight(bodyHeight);

      $("body")
        .velocity("stop")
        .velocity("scroll", {
          offset: 1,
          duration: 10
        });


    }

    convertAllPropsToPx = function() {

      $.each(window.keyframes, function(k, v) {
        v.duration = utils.convertPercentToPx(v.duration, 'y');
        $.each(v.wrappers, function(l, m) {
          $.each(m.animations, function(aK, aV) { /// Loop the animations
            Object.keys(aV).forEach(function(key) { // loop properties
              value = aV[key];
              if (key !== 'selector') {
                if (value instanceof Array) { // if its an array

                  $.each(value, function(vK, vV) { // if value in array is %
                    if (typeof vV === "string") {
                      if (key === 'translateY') {
                        vV = utils.convertPercentToPx(value[k], 'y');
                      } else {
                        vV = utils.convertPercentToPx(value[k], 'x');
                      }
                    }
                  })

                } else {
                  if (typeof value === "string") { // if single value is a %
                    if (key === 'translateY') {
                      value = utils.convertPercentToPx(value, 'y');
                    } else {
                      value = utils.convertPercentToPx(value, 'x');
                    }
                  }
                }
                aV[key] = value;
              }

            });
          })
        })
      })
    }

    getDefaultPropertyValue = function(property) {
      switch (property) {
        case 'translateX':
          return 0;
        case 'translateY':
          return 0;
        case 'scale':
          return 1;
        case 'rotate':
          return 0;
        case 'rotateX':
          return 0;
        case 'opacity':
          return 1;
        default:
          return null;
      }
    }

    /*  Animation/Scrolling
    -------------------------------------------------- */

    updatePage = function() {
      setScrollTops();
      if (scrollTop > 0 && scrollTop <= (bodyHeight - windowHeight)) {
        animateElements();
        setKeyframe();
      }
      requestAnimationFrame(updatePage);
    }

    // _.throttle(updatePage, 100);

    setScrollTops = function() {
      scrollTop = $window.scrollTop();
      relativeScrollTop = scrollTop - prevKeyframesDurations;
    }

    animateElements = function() {
      var animation, translateY, translateX, scale, rotate, rotateX, opacity;

      $.each(window.keyframes[window.currentKeyframe].wrappers, function(k, v) {
        $.each(v.animations, function(animK, animV) {

          translateY = calcPropValue(animV, 'translateY');
          translateX = calcPropValue(animV, 'translateX');
          scale = calcPropValue(animV, 'scale');
          rotate = calcPropValue(animV, 'rotate');
          rotateX = calcPropValue(animV, 'rotateX');
          opacity = calcPropValue(animV, 'opacity');

          $(animV.selector).css({
            'transform': 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ') rotate(' + rotate + 'deg) rotateX(' + rotateX + 'deg)',
            'opacity': opacity
          })

        })

      })
      return false;
    }

    calcPropValue = function(animation, property) {
      var value = animation[property];
      if (value) {
        value = easeInOutQuad(relativeScrollTop, value[0], (value[1] - value[0]), window.keyframes[window.currentKeyframe].duration);
      } else {
        value = getDefaultPropertyValue(property);
      }
      return value;
    }

    easeInOutQuad = function(t, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };

    setKeyframe = function() {

      if (scrollTop >= (window.keyframes[window.currentKeyframe].duration + prevKeyframesDurations)) {
        prevKeyframesDurations += window.keyframes[window.currentKeyframe].duration;
        window.currentKeyframe++;
      } else if (scrollTop < prevKeyframesDurations) {
        window.currentKeyframe--;
        prevKeyframesDurations -= window.keyframes[window.currentKeyframe].duration;

      }
      if (window.keyframes[window.currentKeyframe].callback !== undefined && window.lastKeyframe != window.currentKeyframe) {
        var fn = window[window.keyframes[window.currentKeyframe].callback];

        if (typeof fn === 'function') {
          fn(window.keyframes[window.currentKeyframe].arg);
        }
      }

      window.lastKeyframe = window.currentKeyframe;
      showCurrentWrappers(window.currentKeyframe);
    }

    doAutoScroll = function(event) {
      var curPos = $('body').scrollTop();
      curPos = (curPos == 0) ? $('html').scrollTop() : curPos;

      var totalDurations = 0;
      var keyframeVals = [];
      var audioGutter = 80; // This is to jump the audio to trigger
      var kfJump = 0; // amount of keyframes to skip, this wil be a multiple

      $.each(window.keyframes, function(k, v) {
        if (v.hasOwnProperty('autoscroll')) {
          kfJump++;
        } else {
          keyframeVals.push(Math.round(totalDurations));
          kfJump = 0;
        }
        totalDurations += v.duration;
      })
      if (utils.getBrowser().device.indexOf('mobile') >= 0) {

        var ss = 1000; //* kfJump;
      } else {
        var ss = 3000;
      }
      ss = ss + audioGutter;

      if (utils.vector == "up" && event && event.type !== "click") {
        var kfrev = keyframeVals.reverse();
        $.each(kfrev, function(k, v) {
          if (v < curPos) {
            $('body').animate({
              scrollTop: v
            }, ss, function() {})
            return false;
          }
        })
      } else {
        $.each(keyframeVals, function(k, v) {
          if (v > curPos) {
            v = v + audioGutter;
            $("body, html")
              // .velocity("stop")  
              .animate({
                "scrollTop": v
              }, ss, function() {
                if (utils.getBrowser().device.indexOf("mobile") > -1) {
                  $(".continue-arrow").fadeOut('fast');
                } else {
                  $(".continue-arrow").removeClass("starting").removeClass("play").addClass("pause").find("em").text("Click to pause");
                }
              });
            // .velocity("scroll", { offset: v, duration: ss, complete:function(){
            //   if(utils.getBrowser().device.indexOf("mobile") > -1){
            //     $(".continue-arrow").fadeOut('fast');
            //   }else{
            //     $(".continue-arrow").removeClass("starting").removeClass("play").addClass("pause").find("em").text("Click to pause");
            //   }
            // } });
            return false;
          }
        })
      }
    }

    showCurrentWrappers = function(currentKeyframe) {
      $(".scene").hide();

      $.each(window.keyframes[currentKeyframe].wrappers, function(k) {
        $(k).show();
      })
    }

    playVideo = function(el) {
      var id = $(el).attr("id");
      var vid = document.getElementById(id);

      // try {
        setTimeout(function() {
          vid.play();
          $(el).attr("data-playing", true);
          $(el).parent().find(".vid-overlay").click();
        }, 1000)

        console.log(vid.src);

        // Fire function for if the video has ended
        vid.onended = function(e) {
          var containerTop = $("body").scrollTop();
          var newTop = containerTop + utils.convertPercentToPx("10%", "y");
          $("#container").velocity("scroll", {
            duration: 1000,
            offset: newTop,
            complete: function() {}
          });
        }
      // } catch (err) {

      // }
    }
    stopVideo = function(el) {
      var id = $(el).attr("id");
      var vid = document.getElementById(id);
      if (vid != null) {
        vid.pause();
        // vid.setCurrentTime(0);
        $(el).attr("data-playing", false);
      }
    }

    rearrangeCallbackInit = function() {
      $(".scene-9 .secondary-text-block").rearrange();
    }
    rearrangeCallbackSwap = function() {
      $(".scene-9 .secondary-text-block").rearrange('swap');
    }

    showFooter = function() {
      $("footer").addClass("visible");
    }

    return {
      doAutoScroll: doAutoScroll,
      properties: PROPERTIES,
      init: init
    };
  })