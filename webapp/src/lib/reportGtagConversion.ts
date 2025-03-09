export function gtag_report_conversion(data) {
    // var callback = function () {
    //   if (typeof(url) != 'undefined') {
    //     window.location = url;
    //   }
    // };
    (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-10814930481/tqmMCLCci58ZELH8-qQo',
        'value': 1.99,
        'currency': 'USD',
        // 'event_callback': callback
    });
    return false;
  }
  