
# Variables

settings = null
enabled = no
alarmName = 'SlideShowRunner'
allTabs = []
currIdx = -1

# Util Functions

clearAlarm = ->
	whenTarget = Date.now() + 9999999
	chrome.alarms.create(alarmName, { when: whenTarget })
	chrome.alarms.clear alarmName

setAlarm = (delayInSeconds) ->
	millisecs = delayInSeconds * 1000
	whenTarget = Date.now() + millisecs
	chrome.alarms.create(alarmName, { when: whenTarget })

# Start

Start = ->
	chrome.browserAction.setIcon { path: "engine/imgs/button/stop.png" }
	chrome.tabs.query { windowId: chrome.windows.WINDOW_ID_CURRENT }, tabsQueryCallback
	return

tabsQueryCallback = (tabArr) ->

	if tabArr.length == 1
		disableEngine()
		alert 'Only one tab!'
		return

	allTabs = tabArr
	nextTab()
	return

nextTab = (alarm) ->

	if currIdx < allTabs.length - 1
		currIdx++
	else
		currIdx = 0

	tab = allTabs[currIdx]
	tabSettings = s for s in settings.custom when s.url == tab.url
	
	chrome.tabs.update tab.id, { active: true }
	clearAlarm()
	
	if not tabSettings
		setAlarm parseFloat settings.time
		if settings.reload and not /^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url)
			chrome.tabs.reload tab.id, { bypassCache : true }

	else
		setAlarm parseFloat tabSettings.time
		if tabSettings.reload and not /^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url)
			chrome.tabs.reload tab.id, { bypassCache : true }

	return

# Stop

Stop = ->
	chrome.browserAction.setIcon { path: "engine/imgs/button/play.png" }
	allTabs = null
	return
		
# Initialization
	
chrome.alarms.onAlarm.addListener nextTab

chrome.browserAction.onClicked.addListener (tab) ->
	if enabled is off
		enableEngine()
	else
		disableEngine()
	return

enableEngine = ->
	enabled = on
	clearAlarm()
	loadData()
	Start()

disableEngine = ->
	enabled = off
	clearAlarm()
	Stop()

loadData = ->

	# Load saved data
	settings = JSON.parse localStorage.getItem 'tabSlideShowData'
	
	# If no data was loaded, set defaults
	if not settings then settings = { time: 2, reload: false, custom: [] }

	return