
# Util functions

elipsis = (len, str) -> if str.length <= len then str else str.substring(0, len) + "..."

# Initialization

$(document).ready ->

	# Init UI
	$('#btnSave').click btnSaveClick
	$('#btnCloseSaveAlert').click btnCloseSaveAlertClick
	$('#btnCloseSaveValidationAlert').click btnCloseSaveValidationAlertClick
	$('#txtDisplayTime').change txtDisplayTimeChange
	$('#chkAutoReload').change chkAutoReloadChange
	$('#tabsTable a.btn').live 'click', tableButsClick

	chrome.tabs.query { windowId: chrome.windows.WINDOW_ID_CURRENT }, tabsQueryCallback

	return

tabsQueryCallback = (tabs) ->

	# Load saved data or default values
	data = loadData()

	# Fill default settings form
	$('#txtDisplayTime').val data.time
	$('#chkAutoReload').prop('checked', data.reload)

	# Fill custom tab settings form
	addTabRow(tab, data) for tab in tabs

	return
	
loadData = ->

	# Load saved data
	data = JSON.parse localStorage.getItem 'tabSlideShowData'
	
	# If no data was loaded, set defaults
	if not data then data = { time: "2", reload: false, custom: [] }

	return data

addTabRow = (tab, data) ->

	# Dont list chrome tabs
	if /^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url) then return

	# Get customized settings for this tab
	tabSettings = settings for settings in data.custom when settings.url == tab.url

	if not tabSettings
		$('#tabsTable').append """
			<tr class="tabSetting" url="#{ tab.url }" state="default">
				<td class="cell_tab">
					#{ elipsis 55, tab.title }<br />
					#{ elipsis 55, tab.url }
				</td>
				<td class="centered cell_time">
					<input type="text" class="input-xlarge span1 disabled" id="txtCustomDisplayTime" disabled="disabled" value="#{ data.time }" />
				</td>
				<td class="centered cell_reload">
					<input type="checkbox" class="disabled" id="chkCustomAutoReload" disabled="disabled" #{ if data.reload then "checked='true'" else "" } />
				</td>
				<td class="centered cell_options">
					<a class="btn btn-info" href="#">Customize</a>
				</td>
			</tr>
		"""

	else
		$('#tabsTable').append """
			<tr class="tabSetting" url="#{ tab.url }" state="customized">
				<td class="cell_tab">
					#{ elipsis 55, tab.title }<br />
					#{ elipsis 55, tab.url }
				</td>
				<td class="centered cell_time">
					<input type="text" class="input-xlarge span1" id="txtCustomDisplayTime" value="#{ tabSettings.time }" />
				</td>
				<td class="centered cell_reload">
					<input type="checkbox" id="chkCustomAutoReload" #{ if tabSettings.reload then "checked='true'" else "" } />
				</td>
				<td class="centered cell_options">
					<a class="btn btn-success" href="#">Use Default</a>
				</td>
			</tr>
		"""

# Form logic

btnSaveClick = ->

	$('#save_alert').hide()
	$('#save_validation_alert').hide()

	if validate()
		localStorage.setItem 'tabSlideShowData', JSON.stringify gatherSettings()
		$('#save_alert').fadeIn()
	else
		$('#save_validation_alert').fadeIn()

	return

btnCloseSaveAlertClick = ->
	$('#save_alert').fadeOut()

btnCloseSaveValidationAlertClick = ->
	$('#save_validation_alert').fadeOut()

isNumRegex = /^\d+$/

validate = ->
	
	valid = true

	if not isNumRegex.test $('#txtDisplayTime').val()
		$('#txtDisplayTime').addClass 'error'
		valid = false
	else
		$('#txtDisplayTime').removeClass 'error'

	$('.tabSetting').each (idx, el) ->
		if not isNumRegex.test $('#txtCustomDisplayTime', el).val()
			$('#txtCustomDisplayTime', el).addClass 'error'
			valid = false
		else
			$('#txtCustomDisplayTime', el).removeClass 'error'

	return valid

gatherSettings = ->

	data = { 
		time: parseInt($('#txtDisplayTime').val(), 10),
		reload: $('#chkAutoReload').prop('checked'),
		custom: []
	}

	$('.tabSetting').each (idx, el) ->
		if $(el).attr('state') is 'customized'
			data.custom.push {
				url: $(el).attr('url'),
				time: parseInt($('#txtCustomDisplayTime', el).val(), 10),
				reload: $('#chkCustomAutoReload', el).prop('checked')
			}

	return data

txtDisplayTimeChange = ->

	$('.tabSetting').each (idx, el) ->
		if $(el).attr('state') is 'default'
			$('#txtCustomDisplayTime', el).val($('#txtDisplayTime').val())

chkAutoReloadChange = ->

	$('.tabSetting').each (idx, el) ->
		if $(el).attr('state') is 'default'
			$('#chkCustomAutoReload', el).prop('checked', $('#chkAutoReload').prop('checked'))

tableButsClick = (e) ->

	but = $(e.target)
	tr = but.closest('.tabSetting')
	txtTime = $('#txtCustomDisplayTime', tr)
	chkReload = $('#chkCustomAutoReload', tr)
	
	if tr.attr('state') is 'default'
	
		but.removeClass 'btn-info'
		but.addClass 'btn-success'
		but.text 'Use Default'
		
		txtTime.removeClass 'disabled'
		txtTime.removeAttr 'disabled'
		txtTime.focus()
		
		chkReload.removeClass 'disabled'
		chkReload.removeAttr 'disabled'

		tr.attr('state', 'customized')

	else
	
		but.removeClass 'btn-success'
		but.addClass 'btn-info'
		but.text 'Customize'
		
		txtTime.addClass 'disabled'
		txtTime.attr 'disabled', 'disabled'
		txtTime.val($('#txtDisplayTime').val())

		chkReload.addClass 'disabled'
		chkReload.attr 'disabled', 'disabled'
		chkReload.prop('checked', $('#chkAutoReload').prop('checked'))

		tr.attr('state', 'default')

	return false