
declare var FB: any;
var promise = null;
export function loadFacebookLoginCode() {
    if (promise) 
        return promise;
    promise = new Promise((resolve, reject) => {
        (window as any).fbAsyncInit = function () {
            FB.init({
                appId: '1592924161233838',
                xfbml: true,
                version: 'v17.0'
            });
            resolve(FB);
        };
    
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    });
    return promise;
}