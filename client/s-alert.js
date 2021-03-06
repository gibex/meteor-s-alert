'use strict';

// helper functions
var conditionSet = function (self, msg, condition, customSettings) {
    var settings = {};
    var effects = ['jelly', 'genie', 'stackslide', 'scale', 'slide', 'flip', 'bouncyflip'];
    var currentEffect;
    var sAlertId;
    if (!_.isObject(customSettings)) {
        customSettings = {};
    }
    if (_.isObject(msg) && _.isString(condition)) {
        settings = _.extend(settings, self.settings, msg, {condition: condition}, customSettings);
    }
    if (_.isString(msg) && _.isString(condition)) {
        settings = _.extend(settings, self.settings, {message: msg}, {condition: condition}, customSettings);
    }
    currentEffect = settings && settings.effect;
    if (_.contains(effects, currentEffect) && !Package['juliancwirko:s-alert-' + currentEffect] && typeof console !== 'undefined') {
        console.info('Install "' + currentEffect + '" effect by running "meteor add juliancwirko:s-alert-' + currentEffect + '"');
    }
    if (_.isObject(settings)) {
        sAlertId = sAlert.collection.insert(settings);
    }
    return sAlertId;
};

var EVENTS = 'webkitAnimationEnd oAnimationEnd animationEnd msAnimationEnd animationend';
var sAlertClose = function (alertId) {
    var closingTimeout;
    if (document.hidden || document.webkitHidden || $('.s-alert-box').css('animationName') === 'none') {
        sAlert.collection.remove(alertId);
    } else {
        $('.s-alert-box#' + alertId).removeClass('s-alert-show');
        closingTimeout = Meteor.setTimeout(function () {
            $('.s-alert-box#' + alertId).addClass('s-alert-hide');
        }, 100);
        $('.s-alert-box#' + alertId).off(EVENTS);
        $('.s-alert-box#' + alertId).on(EVENTS, function () {
            sAlert.collection.remove(alertId);
            Meteor.clearTimeout(closingTimeout);
        });
    }
};

// sAlert object
sAlert = {
    settings: {
        effect: '',
        position: 'right-top',
        timeout: 5000,
        html: false
    },
    config: function (configObj) {
        var self = this;
        if (_.isObject(configObj)) {
            self.settings = _.extend(self.settings, configObj);
        } else {
            throw new Meteor.Error(400, 'Config must be an object!');
        }
    },
    closeAll: function () {
        sAlert.collection.remove({});
    },
    close: function (id) {
        if (_.isString(id)) {
            sAlertClose(id);
        }
    },
    info: function (msg, customSettings) {
        return conditionSet(this, msg, 'info', customSettings);
    },
    error: function (msg, customSettings) {
        return conditionSet(this, msg, 'error', customSettings);
    },
    success: function (msg, customSettings) {
        return conditionSet(this, msg, 'success', customSettings);
    },
    warning: function (msg, customSettings) {
        return conditionSet(this, msg, 'warning', customSettings);
    }
};

// routers clean
Meteor.startup(function () {
    if (typeof Iron !== 'undefined' && typeof Router !== 'undefined') {
        Router.onBeforeAction(function () {
            sAlert.collection.remove({});
            this.next();
        });
    }
    if (typeof FlowRouter !== 'undefined') {
        FlowRouter.middleware(function (path, next) {
            sAlert.collection.remove({});
            next();
        });
    }
});
