# Facebook Ad Highlighter Chrome Extension v0.1.2

This extension highlights Facebook advertisements in a user’s news feed.

NOTE: this does not cover ads in the right sidebar, which Facebook has not
"adblock-proofed," only those in the newsfeed, which Facebook is attempting to
make visible even to users using adblock.

# Update History

### v0.1.2
- Added a "close" button to the highlighting overlay so users can interact with the ad if they wish.
- Search for the "Sponsored" text includes text added using the :before/:after pseudoselectors.

### v0.1.1
- Added support for all Facebook locales.


# Code Overview

- *manifest.json* contains information about the overall structure of the extension as well as the title, version number, and description.
- *popup* is just a simple description of the extension that appears when the user clicks the icon in the upper right.
- *ad_remover.js* is the script that runs on facebook.com, searches for ads, and highlights them.
- *locale_info.js* keeps information about the "Sponsored" text in various languages to support all Facebook locales.
- *externalCode* contains jquery 1.12.4

# Running This Extension

[Download it from the Google Webstore.](https://chrome.google.com/webstore/detail/facebook-ad-highlighter/mcdgjlkefibpdnepeljmlfkbbbpkoamf?hl=en-US&gl=US)


Or, to get this running from the source code on your local machine (Chrome only):

- navigate to "chrome://extensions"
- click the checkbox next to "Developer mode" in the upper right hand corner
- click the "Load unpacked extension..." button below the "Extensions" title
- select the “fbAdRemover” folder from your filesystem
- refresh any open Facebook pages


### License:
MIT
