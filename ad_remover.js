/* ----------------------------------------------------------------------------------
 * Author: Grant Storey;
 * Written: 8/10/16
 * Last Updated: 8/18/16
 * Description: Highlights ads ("sponsored posts") in the Facebook news feed.
 * Dependencies: jquery, locale_info.js
 * ----------------------------------------------------------------------------------
 */

var VERBOSE = false;

var TARGET_ID_START = "hyperfeed_story_id";

// Stores whether we are in a non-english locale
var NON_ENGLISH_LOCALE = false;

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
    if (!((localeCode == "en_PI") || (localeCode == "en_US") || (localeCode == "en_UK"))) {
      NON_ENGLISH_LOCALE = true;
    }
  }
}

// covers ads on the page with a div that says "THIS IS AN AD"
// idStart is a string that should be the start of the id of all divs
// to examine.
function removeAds(idStart) {
  // used to store the captured, matching "sponsored" text.
  var matchingText = "";
  // select all divs whose ids start with the given idStart and
  // then from that list select only those with the "sponsored" link inside
  // of them somewhere.
  var adDivs = $("div[id^="+idStart+"]").filter(
    function(index) {

      // also make sure not to add the cover to an advertisement that already
      // has the cover.
      var alreadyCovered = ($(this).find(".CITP_adBlockerCover").length > 0);
      if (alreadyCovered) {
        return false;
      }

      var childLinks = $(this).find("a");
      // select only links whose text matches the "Sponsored" text for this
      // locale, or the text for any locale if no individual locale has been
      // determined.
      var sponsoredTextLinks = childLinks.filter(
        function(index) {
          // Make sure that text added dynamically via the CSS pseudoselectors
          // :before and :after is included in the text checked.
          var before = window.getComputedStyle($(this).get(0),':before').getPropertyValue("content").replace(/\"/g, "");
          var after = window.getComputedStyle($(this).get(0),':after').getPropertyValue("content").replace(/\"/g, "");
          var text = $(this).text();
          var fullText = before + text + after;
          if (textPossibilities.indexOf(fullText) !== -1) {
            matchingText = fullText;
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

      return hasSponsoredLink;
    }
  );
  // If there are ads in the selection, add a cover with "THIS IS AN AD" and
  // the "Sponsored" text in the given locale's language (if non-english).
  if (adDivs.length > 0) {
    if (VERBOSE) {
      console.log("New ad(s) loaded");
    }
    var prepend = "<div class=\"CITP_adBlockerCover\" style=\"height: 100%;position: absolute;width: 100%;background-color: rgba(255, 255, 255, 0.7);z-index: 100; visibility: visible;\">";
    prepend += "<div class=\"CITP_closeButton\" style=\"position: absolute; right: 5px; top: 5px; cursor: pointer; padding: 0px 3px; border: 1px solid black; border-radius: 5px;\">";
    prepend += "<strong>";
    prepend += "X";
    prepend += "</strong>";
    prepend += "</div>";
    prepend += "<div style=\"width: 100%;text-align:center;\">";
    prepend += "<span style=\"color: black; font-size:60px;\">";
    prepend += "THIS IS AN AD";
    prepend += "</span>";
    // if we have "Sponsored" text in another language, add it below "THIS IS AN AD"
    if (NON_ENGLISH_LOCALE && matchingText !== "") {
      prepend += "<br/>"
      prepend += "<span style=\"color: black; font-size:40px; background: rgba(255,255,255,.8);\">";
      prepend += "(" + matchingText + ")";
      prepend += "</span>";
    }
    prepend += "</div>";
    prepend += "</div>";
    adDivs.each(function (i) {
      var myPrepend = prepend;
      var container = $(this);
      container.prepend(myPrepend);
      container.find(".CITP_closeButton").on("click", function () {
        container.find(".CITP_adBlockerCover").css("visibility", "hidden");
      });
    });
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
      var addedNewsfeedItem = (mutation.target.id && (mutation.target.id.substring(0, targetString.length) === targetString));
      if (addedNewsfeedItem) {
        // when a new newsfeed item is added, run through all items on the
        // page and highlight them if they are an ad. There appears to be a
        // glitch where the ads loaded when the user first opens the page are
        // not recognized if ads are only checked on a case-by-case basis as
        // they are added (for some but not all users). If one really wanted to
        // optimize this calculation, it would probably be better to check the
        // items individually as they were added and figure out a different fix
        // for recognizing the ads that are sometimes missed on load.
        removeAds(TARGET_ID_START);
      }
    }
  });
});
observer.observe(document, domListenerConfig);
