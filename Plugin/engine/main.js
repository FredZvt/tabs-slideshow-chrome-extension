(function() {
  var Start, Stop, alarmName, allTabs, clearAlarm, currIdx, disableEngine, enableEngine, enabled, loadData, nextTab, setAlarm, settings, tabsQueryCallback;

  settings = null;

  enabled = false;

  alarmName = 'SlideShowRunner';

  allTabs = [];

  currIdx = -1;

  clearAlarm = function() {
    var whenTarget;
    whenTarget = Date.now() + 9999999;
    chrome.alarms.create(alarmName, {
      when: whenTarget
    });
    return chrome.alarms.clear(alarmName);
  };

  setAlarm = function(delayInSeconds) {
    var millisecs, whenTarget;
    millisecs = delayInSeconds * 1000;
    whenTarget = Date.now() + millisecs;
    return chrome.alarms.create(alarmName, {
      when: whenTarget
    });
  };

  Start = function() {
    chrome.browserAction.setIcon({
      path: "engine/imgs/button/stop.png"
    });
    chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT
    }, tabsQueryCallback);
  };

  tabsQueryCallback = function(tabArr) {
    if (tabArr.length === 1) {
      disableEngine();
      alert('Only one tab!');
      return;
    }
    allTabs = tabArr;
    nextTab();
  };

  nextTab = function(alarm) {
    var s, tab, tabSettings, _i, _len, _ref;
    if (currIdx < allTabs.length - 1) {
      currIdx++;
    } else {
      currIdx = 0;
    }
    tab = allTabs[currIdx];
    _ref = settings.custom;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s.url === tab.url) {
        tabSettings = s;
      }
    }
    chrome.tabs.update(tab.id, {
      active: true
    });
    clearAlarm();
    if (!tabSettings) {
      setAlarm(parseFloat(settings.time));
      if (settings.reload && !/^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url)) {
        chrome.tabs.reload(tab.id, {
          bypassCache: true
        });
      }
    } else {
      setAlarm(parseFloat(tabSettings.time));
      if (tabSettings.reload && !/^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url)) {
        chrome.tabs.reload(tab.id, {
          bypassCache: true
        });
      }
    }
  };

  Stop = function() {
    chrome.browserAction.setIcon({
      path: "engine/imgs/button/play.png"
    });
    allTabs = null;
  };

  chrome.alarms.onAlarm.addListener(nextTab);

  chrome.browserAction.onClicked.addListener(function(tab) {
    if (enabled === false) {
      enableEngine();
    } else {
      disableEngine();
    }
  });

  enableEngine = function() {
    enabled = true;
    clearAlarm();
    loadData();
    return Start();
  };

  disableEngine = function() {
    enabled = false;
    clearAlarm();
    return Stop();
  };

  loadData = function() {
    settings = JSON.parse(localStorage.getItem('tabSlideShowData'));
    if (!settings) {
      settings = {
        time: 2,
        reload: false,
        custom: []
      };
    }
  };

}).call(this);
