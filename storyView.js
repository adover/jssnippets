// Dover says:
// This is 100% work in progress.
// There needs to be loads of refactoring on it to make it anywhere near pretty.
// I haven't had time to do that yet.
// In the meantime, I wish you luck, young padawan.
// Give me a shout if you need help reading it

define([
  'jquery',
  'underscore',
  'backbone',
  'override',
  'libs/utils/utils',
  'libs/parallax/parallax',
  'text!templates/story/storyTemplate.html',
  'views/inc/headerView',
  'views/inc/footerView',
  'models/UserModel',
  'handlebars',
  'audio',
  'libs/mousewheel/jquery.mousewheel.min',
  'libs/touchswipe/jquery.touchSwipe.min',
  'libs/velocity/velocity.min'
], function($, _, Backbone, override, utils, parallax, Template, HeaderView, FooterView, UserModel, Handlebars, AudioHelper){
  var StoryView = Backbone.View.extend({
    el: '#container',
    hasUi: true,
    className: 'storyview',
    template: Handlebars.compile(Template),
    currentSceneLoaded: 0,
    sceneCount: 0,
    sceneElementCount: 0,
    sceneToLoadCount: 0,
    loadedElementCount: 0,
    loadedSceneVal: 2,
    device: utils.getBrowser().device,
    orientation: utils.getBrowser().orientation,
    dataAttr : (utils.getBrowser().device == "desktop" || utils.getBrowser().device == "iPad" || utils.getBrowser().device == "tablet") ? "data-src" : "data-mobile-src",
    windowHeight: 0,
    windowWidth: 0,
    resizeTolerance: 200,
    events: {
      "click .continue-arrow": function(event){
        event.preventDefault();
        var el = $(event.currentTarget);
        switch (window.currentPlayState) {
          case "start":
            window.automatedStory = true;
            parallax.doAutoScroll(parallax.currentKeyframe, event);
            window.currentPlayState = "playing";
            AudioHelper.playAudio(0);
            el.addClass("starting").find("em").text("Starting...");
            break;
          case "pause":
            AudioHelper.playAudio(window.timeLog);
            window.currentPlayState = "playing";
            el.removeClass("starting").removeClass("play").addClass("pause").find("em").text("Click to pause");
            break;
          case "playing":
            $("body,html").velocity("stop");
            window.automatedStory = false;
            AudioHelper.stopPlayback();
            window.currentPlayState = "pause";
            el.removeClass("starting").removeClass("pause").addClass("play").find("em").text("Click to resume");
            break;
        }
      },
      "click .volume-control": function(event){
        event.preventDefault();
        AudioHelper.toggleAudio();
      }
    },
    remove: function() {
      this.$el.empty();
      this.undelegateEvents();
      return this;
    },
    loadScene: function(log){
      var that = this;

      if(log != undefined){
        console.log(log)
      }

      if(that.currentSceneLoaded >= $(".scene").length){
        console.log("Loading is complete!");
      }else{

        if(that.loadedSceneVal == that.currentSceneLoaded){

          $(".loader").find("p").fadeOut('fast', function(){
            window.isReady = true;
            $(this).html("Ready.").fadeIn('slow');
            $(".loader").delay(500).fadeOut('slow');

            if((utils.getBrowser().device == "desktop" || utils.getBrowser().device == "iPad" || utils.getBrowser().device == "tablet")){

            var topDur = utils.convertPercentToPx("60%","y");

            $(".can-wrapper").velocity({
              "bottom":[0,[.07,.74,.27,.99]]
              },{
                duration: 1000,
                delay: 1000,
                complete: function(){
                  $(".continue-arrow").addClass("active");
                }
            });
          }
          })

          // Scroll to first element upon load
        }

        console.log("Loading scene " + (that.currentSceneLoaded+1) + ". Please wait.")

        // Grab all elements and their respective urls and push into an array
        var sceneElements = [];

        // sceneElements.push
        $(".scene:eq("+that.currentSceneLoaded+")").find("[" + that.dataAttr + "]").each(function(i){
          var src = $(this).attr(that.dataAttr);
          sceneElements.push(src);

          if(i == $(".scene:eq("+that.currentSceneLoaded+")").find("[" + that.dataAttr + "]").length -1){
            that.loadElements(sceneElements, 0);
          }
        })

        if(sceneElements.length == 0){
          // No elements - onward!
          that.currentSceneLoaded++;
          that.loadScene(that.currentSceneLoaded);
        }
      }

        // loadScene(currentSceneLoaded);
    },
    loadProgress: function(){
      var that = this;
      that.loadedElementCount++;

      var opacity = that.loadedElementCount/that.sceneToLoadCount;
      var widthPC = Math.round((that.loadedElementCount/that.sceneToLoadCount)*100) + "%"
      $(".loading-element").css({ "width" : widthPC, "opacity" : opacity })

    },
    loadElements: function(elementsArray, index){

        var that = this;

        console.log("Loading scene element " + (index + 1) + " of " + elementsArray.length + ".");

        var type = "";
        var element = elementsArray[index];
        if(element.indexOf('images') > 1){
          type = "image";
        }else if(element.indexOf('video') > 1){
          type = "video";
        }

        if(type == "image"){
          var image = new Image();
          var prevEl = element;
          if(that.dataAttr == "data-mobile-src"){
            if(that.orientation == "portrait"){
              element = element.replace("/images/", "/images/m_375/");
            }else{
              element = element.replace("/images/", "/images/m_700/");
            }
          }else{
            element = element.replace("/images/", "/images/");
          }

          image.onload = function () {

            if(that.dataAttr == "data-src"){
              $("[data-src='"+element+"']").attr("src", element);
            }else if(that.dataAttr == "data-mobile-src"){
                $("[data-mobile-src='"+prevEl+"']").attr("src", element);
            }

            that.goToNext(index, elementsArray);

          }
          image.src = element;

          image.onerror = function () {
                if(index == elementsArray.length - 1){
                  console.log("Scene " + (that.currentSceneLoaded + 1) + " now has all of its elements loaded!")
                  that.currentSceneLoaded++;
                  that.loadScene(that.currentSceneLoaded);
                }else{
                  that.loadElements(elementsArray, index+1)
                }
          }

          that.loadProgress();

        }else if(type == "video"){
          console.log("video");
          if(utils.getBrowser().device == "iPad" || utils.getBrowser().device == "mobile iPhone"){
            console.log("device mobile")
            var device = utils.getBrowser().device.toLowerCase();
            device = device.replace("mobile ", "");
            var orientation = utils.getBrowser().orientation;

            var elemAr = element.split("/");
            var id = elemAr[elemAr.length - 1];
            var video = document.getElementById(id);

            // I have no idea why i have to do this
            if(orientation == 0 || orientation == 180){
              orientation = "portrait";
            }else if(orientation == 90 || orientation == -90){
              orientation = "landscape";
            }

            element = "//s3.amazonaws.com/lionnz/steinlager/images/poster/poster_" + device + "_" + orientation + "_" + id + ".jpg";

            var vidImg = new Image();
            vidImg.src = element;
            vidImg.onload = function () {
              if(device === "iphone"){
                $(video).parent().find(".mobile-elems").append(vidImg);
              }else{
                $(video).parent().append(vidImg);
              }

              $(vidImg).addClass("poster-image");

                if(index == elementsArray.length - 1){
                  console.log("Scene " + (that.currentSceneLoaded + 1) + " now has all of its elements loaded!")
                  that.currentSceneLoaded++;
                  that.loadScene(that.currentSceneLoaded);
                }else{
                  that.loadElements(elementsArray, index+1)
                }


            }
            vidImg.onerror = function (e,a) {
              if(index == elementsArray.length - 1){
                console.log("Scene " + (that.currentSceneLoaded + 1) + " now has all of its elements loaded!")
                that.currentSceneLoaded++;
                that.loadScene(that.currentSceneLoaded);
              }else{
                that.loadElements(elementsArray, index+1)
              }
            }

          }else if(utils.getBrowser().orientation == "portrait" && utils.getBrowser().device != "desktop" && utils.getBrowser().device != "iPad"){
            console.log("port")
            var source =  "<source src='"+element+"_375.mp4'></source>";
          }else if(utils.getBrowser().orientation == "landscape" && utils.getBrowser().device != "desktop" && utils.getBrowser().device != "iPad"){
            console.log("lands")
            var source =  "<source src='"+element+"_700.mp4'></source>";
          }else{
            console.log("else")
            var source =  "<source src='"+element+"_1200.mp4'></source>";

          }

          if((utils.getBrowser().device == "desktop" || utils.getBrowser().device == "tablet" ||  utils.getBrowser().device == "iPad")){
            console.log("video source creation")
            $(".scene:eq('"+that.currentSceneLoaded+"')").find("[data-src='"+element+"']").append(source);
            if($(".scene:eq('"+that.currentSceneLoaded+"')").find("[data-src='"+element+"']").children('source').length < 1) {
              $(".scene:eq('"+that.currentSceneLoaded+"')").find("[data-src='"+element+"']").attr('src', element+"_1200.mp4" ).attr('type','video/mp4');
            }
          }else{
            $(".scene:eq('"+that.currentSceneLoaded+"')").find("[data-mobile-src='"+element+"']").append(source);
          }

          if(utils.getBrowser().device != "iPad" && utils.getBrowser().device != "mobile iPhone"){
            that.doVidRender(this, index, elementsArray);
          }


      }
    },
    doVidRender: function(el, index, elementsArray){
      var that = this;

      $(el).one(function(){
        $(this).load();

      });

      that.goToNext(index, elementsArray, "Video");
      that.loadProgress();

    },
    goToNext: function(index, elementsArray, a){
      var that = this;

      if(index == elementsArray.length - 1){
        console.log("Scene " + (that.currentSceneLoaded + 1) + " now has all of its elements loaded!")
        that.currentSceneLoaded++;
        that.loadScene(that.currentSceneLoaded);
      }else{
        that.loadElements(elementsArray, index+1)
      }
    },
    addFloodlight: function () {
      // test this before use

      // var that = this;

      // console.log("Adding fastclick");
      // console.log(that);

      // // only add the fastclick the first time we hit the bottom
      // if (!_.has(that, 'floodlight')) {

      //   var floodlightId;

      //   switch (that.id) {
      //     case '1': floodlightId = '00'; break;
      //     case '2': floodlightId = '000'; break;
      //     case '3': floodlightId = '001'; break;
      //   }

      //   var axel = Math.random() + "";
      //   var a = axel * 10000000000000;
      //   $('.floodlight').append('<iframe src="https://3691128.fls.doubleclick.net/activityi;src=3691128;type=stein;cat=stein' + floodlightId + ';ord=' + a + '?" width="1" height="1" frameborder="0" style="display:none"></iframe>');

      //   that.floodlight = true;
      //   console.log("Added floodlight");
      // };
    },
    render: function(args) {

      $(this.el).unbind();

      window.currentPlayState = "start";
      window.isReady = false;

      var that = this;

      that.storyId = args.id;

      $("body").attr("id", "story-page").addClass("story-" + args.id);

      var that = this;

      window.footer.reset();

      document.title = utils.siteContent.pageTitles["story" + args.id] + " - Steinlager";
      // Force story to start at top

      $.getJSON("/content/story_" + parseInt(args.id) + ".json", function(data){

        var data = data;

        window.readyToScroll = false;

        window.audioSrc = data.audio;

        that.$el.html(that.template(data)).addClass(that.className);

        // Initialise the Parallax awesomeness
        parallax.init(args.id);

        $(window).scrollTop(0);
        $("#container").velocity("stop").scrollTop(0);
        // TODO: REFACTOR THIS INTO A PLUGIN
        that.sceneCount = $(".scene").length;

        that.sceneElementCount = $(".scene").find('[data-src]').length;

        for(i = 0; i < that.loadedSceneVal; i++){
          that.sceneToLoadCount += $(".scene").eq(i).find('[data-src]').length;
        }

        utils.fixIOSHeightBug();

        that.loadScene(that.currentSceneLoaded, "Initialising The Preloading Awesomeness");

        $(".scene").addClass(that.orientation + " " + that.device.toLowerCase());
        // Initialise Audio
        AudioHelper.init(data);

        window.computedHeight = $(window).height();
        window.computedWidth  = $(window).width();

      })

      var calculateLayout = function(){
        window.computedHeight = $(window).height();
        window.computedWidth  = $(window).width();

        if(that.windowHeight >= $(window).height() + 200 || that.windowHeight <= $(window).height() - 200 || that.windowHeight >= $(window).height() + 200 || that.windowHeight <= $(window).height() - 200){
            parallax.init(args.id);

            // Remove all Sources
            $("[data-src]").attr("src","");
            $("[data-mobile-src]").attr("src","");

            // Show loader again
            $(".loader").find(".loading-element").width(0);
            $(".loader").fadeIn('fast');

            that.loadScene(that.currentSceneLoaded = 0, "Initialising The Preloading Awesomeness");

            that.windowHeight = $(window).height();
            that.windowWidth = $(window).width();
        }
      }

      var lazyLayout = _.debounce(calculateLayout, 300);

      that.windowHeight = $(window).height();
      that.windowWidth = $(window).width();
      $(window).resize(lazyLayout);

      window.lastScrollTop = 0; // Initial scrollTop Value

      $(document,window).on("keydown keyup", function(e) {
          // Space is 32
          // page up 33
          // page down 34
          // end 35
          // home  36
          // up arrow  38
          // down arrow  40
          // tab 9

          if(e.which == 32 || e.which == 34 || e.which == 35 || e.which == 40){
            e.preventDefault();
            utils.vector = "down";
          }else if(e.which == 33 || e.which == 36 || e.which == 38){
            e.preventDefault();
            utils.vector = "up";
          }else if(e.which == 9){
            return false;
          }
      });

      $(window).mousewheel(function(event, delta){
        event.preventDefault();
        if(window.isScrolling){
          event.preventDefault();
        }
        if(delta > 0){
          // Scrolling up
          utils.vector = "up";
        }else{
          // Scrolling down
          utils.vector = "down";
        }

      });

      $(window).scroll(function(){
        if($("body").scrollTop() >= $(window).height() * 2){
          $(".continue-arrow").addClass("scrolling");
        }else{
          $(".continue-arrow").removeClass("scrolling");
        }

        if($("body").scrollTop() >= ($("#container").height() - $(window).height())){
          // When the user hits the bottom of the page we add the fastclick iframe
          that.addFloodlight();

          // $("#footer").addClass("visible");
          // $(".continue-arrow").addClass('hidden');
        }else{
          // $("#footer").removeClass("visible");
          // $(".continue-arrow").removeClass('hidden');
        }
      });

      $('body').swipe( {
          swipe:function(event, direction, distance) {
            window.isScrolling = false;
            if (window.isScrolling) {
                event.preventDefault();
                return false;
            }
            if (direction == 'down'){
                // upscroll code
                utils.vector = "up";
            }else if (direction == 'up'){
                // downscroll code
                utils.vector = "down";
            }
            parallax.doAutoScroll(event);
          }
      });

      window.view = this;

      window.onfocus = that.winFocus;
      window.onblur = that.winBlur;

      return this;
    }
  });
  return StoryView;
});
