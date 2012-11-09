(function() {
  var addTabRow, btnCloseSaveAlertClick, btnCloseSaveValidationAlertClick, btnSaveClick, chkAutoReloadChange, elipsis, gatherSettings, isNumRegex, loadData, tableButsClick, tabsQueryCallback, txtDisplayTimeChange, validate;

  elipsis = function(len, str) {
    if (str.length <= len) {
      return str;
    } else {
      return str.substring(0, len) + "...";
    }
  };

  $(document).ready(function() {
    $('#btnSave').click(btnSaveClick);
    $('#btnCloseSaveAlert').click(btnCloseSaveAlertClick);
    $('#btnCloseSaveValidationAlert').click(btnCloseSaveValidationAlertClick);
    $('#txtDisplayTime').change(txtDisplayTimeChange);
    $('#chkAutoReload').change(chkAutoReloadChange);
    $('#tabsTable a.btn').live('click', tableButsClick);
    chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT
    }, tabsQueryCallback);
  });

  tabsQueryCallback = function(tabs) {
    var data, tab, _i, _len;
    data = loadData();
    $('#txtDisplayTime').val(data.time);
    $('#chkAutoReload').prop('checked', data.reload);
    for (_i = 0, _len = tabs.length; _i < _len; _i++) {
      tab = tabs[_i];
      addTabRow(tab, data);
    }
  };

  loadData = function() {
    var data;
    data = JSON.parse(localStorage.getItem('tabSlideShowData'));
    if (!data) {
      data = {
        time: "2",
        reload: false,
        custom: []
      };
    }
    return data;
  };

  addTabRow = function(tab, data) {
    var settings, tabSettings, _i, _len, _ref;
    if (/^(chrome:\/\/|chrome-extension:\/\/)/.test(tab.url)) {
      return;
    }
    _ref = data.custom;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      settings = _ref[_i];
      if (settings.url === tab.url) {
        tabSettings = settings;
      }
    }
    if (!tabSettings) {
      return $('#tabsTable').append("<tr class=\"tabSetting\" url=\"" + tab.url + "\" state=\"default\">\n	<td class=\"cell_tab\">\n		" + (elipsis(55, tab.title)) + "<br />\n		" + (elipsis(55, tab.url)) + "\n	</td>\n	<td class=\"centered cell_time\">\n		<input type=\"text\" class=\"input-xlarge span1 disabled\" id=\"txtCustomDisplayTime\" disabled=\"disabled\" value=\"" + data.time + "\" />\n	</td>\n	<td class=\"centered cell_reload\">\n		<input type=\"checkbox\" class=\"disabled\" id=\"chkCustomAutoReload\" disabled=\"disabled\" " + (data.reload ? "checked='true'" : "") + " />\n	</td>\n	<td class=\"centered cell_options\">\n		<a class=\"btn btn-info\" href=\"#\">Customize</a>\n	</td>\n</tr>");
    } else {
      return $('#tabsTable').append("<tr class=\"tabSetting\" url=\"" + tab.url + "\" state=\"customized\">\n	<td class=\"cell_tab\">\n		" + (elipsis(55, tab.title)) + "<br />\n		" + (elipsis(55, tab.url)) + "\n	</td>\n	<td class=\"centered cell_time\">\n		<input type=\"text\" class=\"input-xlarge span1\" id=\"txtCustomDisplayTime\" value=\"" + tabSettings.time + "\" />\n	</td>\n	<td class=\"centered cell_reload\">\n		<input type=\"checkbox\" id=\"chkCustomAutoReload\" " + (tabSettings.reload ? "checked='true'" : "") + " />\n	</td>\n	<td class=\"centered cell_options\">\n		<a class=\"btn btn-success\" href=\"#\">Use Default</a>\n	</td>\n</tr>");
    }
  };

  btnSaveClick = function() {
    $('#save_alert').hide();
    $('#save_validation_alert').hide();
    if (validate()) {
      localStorage.setItem('tabSlideShowData', JSON.stringify(gatherSettings()));
      $('#save_alert').fadeIn();
    } else {
      $('#save_validation_alert').fadeIn();
    }
  };

  btnCloseSaveAlertClick = function() {
    return $('#save_alert').fadeOut();
  };

  btnCloseSaveValidationAlertClick = function() {
    return $('#save_validation_alert').fadeOut();
  };

  isNumRegex = /^\d+$/;

  validate = function() {
    var valid;
    valid = true;
    if (!isNumRegex.test($('#txtDisplayTime').val())) {
      $('#txtDisplayTime').addClass('error');
      valid = false;
    } else {
      $('#txtDisplayTime').removeClass('error');
    }
    $('.tabSetting').each(function(idx, el) {
      if (!isNumRegex.test($('#txtCustomDisplayTime', el).val())) {
        $('#txtCustomDisplayTime', el).addClass('error');
        return valid = false;
      } else {
        return $('#txtCustomDisplayTime', el).removeClass('error');
      }
    });
    return valid;
  };

  gatherSettings = function() {
    var data;
    data = {
      time: parseInt($('#txtDisplayTime').val(), 10),
      reload: $('#chkAutoReload').prop('checked'),
      custom: []
    };
    $('.tabSetting').each(function(idx, el) {
      if ($(el).attr('state') === 'customized') {
        return data.custom.push({
          url: $(el).attr('url'),
          time: parseInt($('#txtCustomDisplayTime', el).val(), 10),
          reload: $('#chkCustomAutoReload', el).prop('checked')
        });
      }
    });
    return data;
  };

  txtDisplayTimeChange = function() {
    return $('.tabSetting').each(function(idx, el) {
      if ($(el).attr('state') === 'default') {
        return $('#txtCustomDisplayTime', el).val($('#txtDisplayTime').val());
      }
    });
  };

  chkAutoReloadChange = function() {
    return $('.tabSetting').each(function(idx, el) {
      if ($(el).attr('state') === 'default') {
        return $('#chkCustomAutoReload', el).prop('checked', $('#chkAutoReload').prop('checked'));
      }
    });
  };

  tableButsClick = function(e) {
    var but, chkReload, tr, txtTime;
    but = $(e.target);
    tr = but.closest('.tabSetting');
    txtTime = $('#txtCustomDisplayTime', tr);
    chkReload = $('#chkCustomAutoReload', tr);
    if (tr.attr('state') === 'default') {
      but.removeClass('btn-info');
      but.addClass('btn-success');
      but.text('Use Default');
      txtTime.removeClass('disabled');
      txtTime.removeAttr('disabled');
      txtTime.focus();
      chkReload.removeClass('disabled');
      chkReload.removeAttr('disabled');
      tr.attr('state', 'customized');
    } else {
      but.removeClass('btn-success');
      but.addClass('btn-info');
      but.text('Customize');
      txtTime.addClass('disabled');
      txtTime.attr('disabled', 'disabled');
      txtTime.val($('#txtDisplayTime').val());
      chkReload.addClass('disabled');
      chkReload.attr('disabled', 'disabled');
      chkReload.prop('checked', $('#chkAutoReload').prop('checked'));
      tr.attr('state', 'default');
    }
    return false;
  };

}).call(this);
