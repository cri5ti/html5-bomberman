var base64ToString = function(str) {
	return (new Buffer(str || "", "base64")).toString("ascii");
};

var base64UrlToString = function(str) {
	return base64ToString( base64UrlToBase64(str) );
};

var base64UrlToBase64 = function(str) {
	var paddingNeeded = (4- (str.length%4));
	for (var i = 0; i < paddingNeeded; i++) {
		str = str + '=';
	}
	return str.replace(/\-/g, '+').replace(/_/g, '/')
};

module.exports = {

    setup: function(opts) {

        var appId = opts.appId;
        var appSecret = opts.appSecret;

        return {

            auth: function(opt) {

                var redirectUrl = opt.redirectUrl;

                return function(req,res,next) {
                    var signed_request = req.param('signed_request');
                    if (!signed_request)
                        return next();

                    var parts = signed_request.split('.');

                    var sig = base64UrlToBase64(parts[0]);
                    var payload = parts[1];

                    req.fb = JSON.parse(base64UrlToString(payload));

                    console.log("FACEBOOK data: ", req.fb);

                    if (!req.fb.user_id) {
                        // Redirect to authentication.
                        var auth_url = "http://www.facebook.com/dialog/oauth?client_id=" + appId + "&redirect_uri=" + encodeURIComponent(redirectUrl);
                        res.send("<script> top.location.href='" +auth_url + "'; </script>");
                        res.end();
                        // auth...
                    } else {
                        if (req.fb.algorithm.toUpperCase() !== 'HMAC-SHA256') {
                            // FIXME
                            res.send('Unknown algorithm. Expected HMAC-SHA256');
                            next();
                        }

                        var hmac = require('crypto').createHmac('sha256', appSecret);
                        hmac.update(payload);
                        var expected_sig = hmac.digest('base64');

                        if (sig != expected_sig){
                            console.log('Bad signature! - expected [' + expected_sig + '] got [' + sig + ']');
                            res.send("Bad request");
                            res.end();
                        }
                        next();
                    }
                }

            }

        }

    }

};
