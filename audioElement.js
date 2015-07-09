      $(window.audioElement).attr('src', url).attr('autoplay', 'autoplay');

      var duration = 0;
      
      window.audioElement.load();
      window.audioElement.play();
      
      window.audioElement.addEventListener("loadedmetadata", function() {
        console.log("load meta hit, is it playing?")
        duration = $(window.audioElement)[0].duration
        $(".artists li[data-spotifyid='"+spotifyID+"']").addClass("playing");
        $(".artists li:not([data-spotifyid='"+spotifyID+"'])").removeClass("playing");
      }, true);

      window.audioElement.addEventListener("timeupdate", function(){
        var percentage = ((100/duration) * $(window.audioElement)[0].currentTime) + "%";
        $(".artists li[data-spotifyid='"+spotifyID+"']").find(".progress").css({"width":percentage});
      })        

      window.audioElement.addEventListener("ended", function(){
        $(".playing").removeClass("playing");
      })
