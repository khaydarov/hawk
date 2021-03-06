let request = require('request');
let Twig = require('twig');
let email = require('../modules/email');

/** Notifications config **/
let config = require('../config/notifications');

module.exports = function () {

  const templatesPath = 'views/notifies/';
  const templates = {
    messenger: 'messenger.twig',
    email: 'email/notify.twig'
  };

  let timers = {};
  /* Time to wait before send notification about repeated events */
  const GROUP_TIME = config.GROUP_TIME;

  /**
   * Send notifications about new event using user settings
   *
   * Available services
   * - Telegram
   * - Slack
   * - Email
   *
   * @param user
   * @param domain
   * @param event
   * @times times
   */
  let send_ =function (user, domain, event, times) {

    if (!times) {

      return;

    }

    let renderParams = {
      event: event,
      domain: domain,
      hostName: process.env.HOST_NAME,
      times: times
    };


    Twig.renderFile(templatesPath + templates.messenger, renderParams, function (err, html) {

      if (err) {

        logger.error('Can not render notify template because of ', err);
        return;

      }

      if (user.notifies.tg && user.tgHook) {

        request.post({url: user.tgHook, form: {message: html, parse_mode: 'HTML'}});

      }

      if (user.notifies.slack && user.slackHook) {

        request.post({url: user.slackHook, form: {message: html, parse_mode: 'HTML'}});

      }

    });

    if (user.notifies.email) {

      Twig.renderFile(templatesPath + templates.email, renderParams, function (err, html) {

        if (err) {

          logger.error('Can not render notify template because of ', err);
          return;

        }

        email.init();
        email.send(
          user.email,
          'Error on ' + domain,
          '',
          html
        );

      });

    }

  };

  /**
   * Set new Timeout for event and send notification about first event.
   * If there are no more new events in timeout was set, notification will send by private send_ method
   * Otherwise, if new events are coming, Timeout will be restart
   *
   * @param user
   * @param domain
   * @param event
   */
  let send = function (user, domain, event) {


    let timer = timers[event.groupHash];

    /* Check if this event has come few time ago */
    if (timer) {

      clearTimeout(timer.timeout);

    } else {

      send_(user, domain, event, 1);

      timers[event.groupHash] = {
        times: 0
      };

      timer = timers[event.groupHash];

    }

    timer.timeout = setTimeout(send_, GROUP_TIME, user, domain, event, timer.times);
    timer.times++;

  };

  return {
    send: send
  };

}();
