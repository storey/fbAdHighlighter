/* ----------------------------------------------------------------------------------
 * Author: Grant Storey;
 * Written: 8/10/16
 * Last Updated: 8/11/16
 * Description: Highlights ads ("sponsored posts") in the Facebook news feed.
 *
 * Dependencies: jquery
 * ----------------------------------------------------------------------------------
 */

var VERBOSE = false;

var TARGET_ID_START = "hyperfeed_story_id";

// covers ads on the page with a div that says "THIS IS AN AD"
// idStart is a string that should be the start of the id of all divs
// to examine.
function removeAds(idStart) {
  // select all divs whose ids start with the given idStart and
  // then from that list select only those with the "sponsored" link inside
  // of them somewhere.
  var adDivs = $("div[id^="+idStart+"]").filter(
    function(index) {
      var childLinks = $(this).find("a");
      var sponsoreds = childLinks.filter(
        function(index) {
          return $(this).text() === "Sponsored";
        }
      );
      // also make sure not to add the cover to an advertisement that already
      // has the cover.
      return sponsoreds.length > 0 && ($(this).find(".CITP_adBlockerCover").length == 0);
    }
  );
  // If there are ads in the selection, ad the "THIS IS AN AD" cover. 
  if (adDivs.length > 0) {
    if (VERBOSE) {
      console.log("New ad loaded");
    }

    var prepend = "<div class=\"CITP_adBlockerCover\" style=\"height: 100%;position: absolute;width: 100%;background-color: rgba(255, 255, 255, 0.7);z-index: 100;text-align:center;\">";
    prepend += "<span style=\"color: black; font-size:60px;\">";
    prepend += "THIS IS AN AD";
    prepend += "</span>";
    prepend += "</div>";
    adDivs.prepend(prepend);
  }
  //*/
}

// on startup, run through the whole page covering all ads that exist
removeAds(TARGET_ID_START);

// configuration info for the DOM listener.
var domListenerConfig = {childList: true, subtree: true};

// this looks for changes in the DOM that correspond to new ads being
// displayed, and when that happens blocks those ads.
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    // if content was added, examine the ads and look for new information
    if (mutation.addedNodes.length > 0) {
      var targetString = TARGET_ID_START;
      var newID = mutation.target.id;
      var addedNewsfeedItem = (mutation.target.id && (mutation.target.id.substring(0, targetString.length) === targetString));
      if (addedNewsfeedItem) {
        // when a new newsfeed item is added, determine whether it is an ad
        // and, if so, cover it. This allows us to only run the checks on
        // the newly added newsfeed divs rather than all newsfeed divs visible.
        removeAds(newID);
      }
    }
  });
});
observer.observe(document, domListenerConfig);
