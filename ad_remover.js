/* ----------------------------------------------------------------------------------
 * Author: Grant Storey;
 * Written: 8/10/16
 * Last Updated: 8/15/16
 * Description: Highlights ads ("sponsored posts") in the Facebook news feed.
 * Version 0.1.1: Added support for different locales.
 * Dependencies: jquery, locale_info.js
 * ----------------------------------------------------------------------------------
 */

var VERBOSE = false;

var TARGET_ID_START = "hyperfeed_story_id";

// default to a list of "Sponsored" text for all known locales
var textPossibilities = TEXT_POSSIBILITIES_DEFAULT;

// use the source code to determine the locale, and if it is in the list,
// narrow down the number of possible "sponsored" text strings
function getLocale() {
  var allHTML = $("html").html();
  var myRe = /\"locale\":\"([^\"]+)\"/g;
  var resultArray = myRe.exec(allHTML);
  if (resultArray && resultArray.length >= 2) {
    var localeCode = resultArray[1];
    if (VERBOSE) {
      console.log(localeCode);
    }
    if (localeCode in LOCALE_MAP) {
      textPossibilities = [LOCALE_MAP[localeCode]];
    }
  }
}

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
      // select only links whose text matches the "Sponsored" text for this
      // locale, or the text for any locale if no individual locale has been
      // determined.
      var sponsoredTextLinks = childLinks.filter(
        function(index) {
          var text = $(this).text();
          if (textPossibilities.indexOf(text) !== -1) {
            return true;
          } else {
            return false;
          }
        }
      );
      // select by link, which would be easier for facebook to randomize.
      // in fact, they changed it during development from
      // https://www.facebook.com/about/ads? plus some other stuff to just
      // "/about/ads" and back again over the course of about 4 hours.
      // I'm leaving it as the longer form to not accidentally overcapture
      // a post that happens to have a link with an unrelated "/about/ads"
      // hiding in it.
      var adPageLinks = $(this).find("a[href^=\"https://www.facebook.com/about/ads\"]");

      // if the div has either the sponsored text or a link to the ads page
      var hasSponsoredLink = (sponsoredTextLinks.length > 0) || (adPageLinks.length > 0);

      // also make sure not to add the cover to an advertisement that already
      // has the cover.
      var alreadyCovered = ($(this).find(".CITP_adBlockerCover").length > 0);

      return hasSponsoredLink && !alreadyCovered;
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

// determine the locale if possible
getLocale();

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
