      // Split each text block into individual lines
      // TODO: Turn this into its own function
      $(".text-block").each(function(i){
        var words = $(this).html().split(" "), el = $(this);

        // Begin console group debugging
        console.group("text block " + i);

        // We no longer need the contents of this div
        $(this).empty();

        if(words.length > 1){ // Removes 0 based array possibilities

          $.each(words, function(k, v){

            // Append a span tag to each and then push it to the text block
            el.append("<span>"+v+" </span>");
            if(k == words.length -1){

              // we've reached the end of the loop, now we need to get the distance of each span from the top and append a line to it
              var line = 1;
              var tag = el.find('span');
              var firstTag = el.find('span').first();
              console.log(firstTag.html());
              var initialOffsetTop = firstTag.offset().top;

              // Get first offset, this will then increase when the next one is bigger
              var currentOffsetTop = firstTag.offset().top;

              // create initial span
              var openTag = "<span>";
              tag.each(function(i){ 

                var thisOffsetTop = $(this).offset().top;

                var html = $(this).text();
                
                if(thisOffsetTop > parseInt(currentOffsetTop + 10)){ // Added 10 for standard pixel deviation

                  // equal currentOffsetTop
                  currentOffsetTop = thisOffsetTop;

                  // append a closing span first
                  openTag += "</span><span>";

                  // Increment line - I may add this as a class or somethin
                  line = line + 1;

                }
                openTag += html

              });
              openTag += "</span>";

              el.empty().append(openTag);

            }
          })

        }
        console.groupEnd();
      });
