/* globals Cu, XPCOMUtils, Preferences, is, registerCleanupFunction, NewTabWebChannel */

"use strict";

Cu.import("resource://gre/modules/Preferences.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "NewTabWebChannel",
                                  "resource:///modules/NewTabWebChannel.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "NewTabMessages",
                                  "resource:///modules/NewTabMessages.jsm");

function setup() {
  Preferences.set("browser.newtabpage.enhanced", true);
  Preferences.set("browser.newtabpage.remote.mode", "test");
  Preferences.set("browser.newtabpage.remote", true);
  NewTabMessages.init();
}

function cleanup() {
  NewTabMessages.uninit();
  NewTabWebChannel.tearDownState();
  Preferences.set("browser.newtabpage.remote", false);
  Preferences.set("browser.newtabpage.remote.mode", "production");
}
registerCleanupFunction(cleanup);

/*
 * Sanity tests for pref messages
 */
add_task(function* prefMessages_request() {
  setup();
  let testURL = "https://example.com/browser/browser/components/newtab/tests/browser/newtabmessages_prefs.html";

  let tabOptions = {
    gBrowser,
    url: testURL
  };

  let prefResponseAck = new Promise(resolve => {
    NewTabWebChannel.once("responseAck", () => {
      ok(true, "a request response has been received");
      resolve();
    });
  });

  yield BrowserTestUtils.withNewTab(tabOptions, function*() {
    yield prefResponseAck;
    let prefChangeAck = new Promise(resolve => {
      NewTabWebChannel.once("responseAck", () => {
        ok(true, "a change response has been received");
        resolve();
      });
    });
    Preferences.set("browser.newtabpage.enhanced", false);
    yield prefChangeAck;
  });
  cleanup();
});
