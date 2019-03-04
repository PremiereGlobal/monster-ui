define(function(require) {
	var $ = require('jquery'),
		_ = require('lodash'),
		monster = require('monster');

	var alerts = {
		// Defines API requests not included in the SDK
		requests: {},

		// Define the events available for other apps
		subscribe: {
			'core.alerts.refresh': 'alertsRender'
		},

		/**
		 * Trigger the alerts pulling process from API.
		 */
		alertsRender: function() {
			var self = this,
				initTemplate = function initTemplate(alerts) {
					var alertsCount = alerts.length,
						dataTemplate = {
							alertsCount: alertsCount === 0 ? null : alertsCount > 9 ? '9+' : alertsCount.toString()
						},
						$template = $(self.getTemplate({
							name: 'nav',
							data: dataTemplate,
							submodule: 'alerts'
						}));

					monster.ui.tooltips($template);

					// TODO: Bind events. For UI-3319, clicking the topbar icon should clear the badge that shows the notification count.

					return $template;
				};

			monster.waterfall([
				function(callback) {
					self.alertsRequestListAlerts({
						success: function(data) {
							callback(null, data);
						},
						error: function(parsedError) {
							callback(parsedError);
						}
					});
				}
			], function(err, alerts) {
				var $navLinks = $('#main_topbar_nav'),
					$topbarAlert = $navLinks.find('#main_topbar_alert'),
					templateAlerts = err ? [] : alerts,
					$template = initTemplate(templateAlerts);

				if ($topbarAlert.length === 0) {
					$template.insertBefore($navLinks.find('#main_topbar_signout'));
				} else {
					$topbarAlert.replaceWith($template);
				}
			});
		},

		/**
		 * Formats the alert data received from the API, into UI categories
		 * @param    {Object}   args
		 * @param    {Object[]} args.data  Array of alerts
		 * @returns  {Object}              Grouped alerts by UI categories
		 */
		alertsFormatData: function(args) {
			var self = this;

			return _.groupBy(args.data, function(alert) {
				var alertType;

				if (alert.clearable) {
					alertType = 'manual';
				} else if (_.includes([ 'low_balance', 'no_payment_token', 'expired_payment_token' ], alert.category)) {
					alertType = 'system';
				} else {
					alertType = 'apps';
				}

				return alertType;
			}).value();
		},

		/**
		 * Request alerts list from API
		 * @param  {Object}   args
		 * @param  {Function} [args.success]  Success callback
		 * @param  {Function} [args.error]    Error callback
		 */
		alertsRequestListAlerts: function(args) {
			var self = this;

			self.callApi({
				resource: 'alert.list',
				data: {
					accountId: monster.apps.auth.currentAccount.id
				},
				success: function(data, status) {
					_.has(args, 'success') && args.success(data.data, status);
				},
				error: function(parsedError) {
					_.has(args, 'error') && args.error(parsedError);
				}
			});
		}
	};

	return alerts;
});
