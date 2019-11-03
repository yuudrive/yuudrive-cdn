var testAd = document.createElement('div');
testAd.innerHTML = '&nbsp;';
testAd.className = 'adsbygoogle';
document.body.appendChild(testAd);
window.setTimeout(function() {
  if (testAd.offsetHeight === 0) {
    $('html').load('/page/ad-detect.html');
  } testAd.remove();
}, 500);