function parseUserAgent(userAgent) {
  if (!userAgent) return { 
    device: 'Unknown', 
    browser: 'Unknown', 
    os: 'Unknown' 
  };

  // Detect Device
  let device = 'Desktop';
  if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';
  else if (/mobile/i.test(userAgent)) device = 'Mobile';

  // Detect Browser
  let browser = 'Unknown';
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) 
    browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) 
    browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  else if (/opera|opr/i.test(userAgent)) browser = 'Opera';
  else if (/msie|trident/i.test(userAgent)) browser = 'IE';

  // Detect OS
  let os = 'Unknown';
  if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'MacOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  return { device, browser, os };
}

module.exports = parseUserAgent;
