/**
 * Google AdSense Auto Ads Injector
 * 
 * This script injects the Google AdSense script into the head of the document.
 * It is designed to work with "Auto Ads" which automatically places ads (vignettes, anchors)
 * without requiring manual ad unit placement in the HTML.
 */

// Run immediately as it's injected dynamically after load
initAds();

function initAds() {
    // PREVENT DUPLICATES: Check if AdSense is already loaded
    if (document.getElementById('adsense-script')) {
        return;
    }

    // CONFIGURATION
    // TODO: USER must replace this with their actual Client ID
    const AD_CLIENT_ID = 'ca-pub-2517157784711414'; 
    
    // Create script element
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;
    script.crossOrigin = 'anonymous';

    // Error handling
    script.onerror = function() {
        console.warn('AdSense script failed to load. This may be due to an ad blocker.');
    };

    // Inject into head
    document.head.appendChild(script);
    
    console.log('AdSense script injected');
}
