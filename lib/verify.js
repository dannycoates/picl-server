var request = require('request');

// sends an assertion to a verification server
module.exports = function verify(assertion, audience, verifier_url, cb, allowUnverified) {
  request(
    {
      method: 'POST',
      url: verifier_url,
      json: {
        assertion: assertion,
        audience: audience,
        allowUnverified: !!allowUnverified
      }
    },
    function (err, response, data) {
      if (err) {
        return cb(err);
      }
      if (data.status !== 'okay') {
        return cb(new Error(data.reason));
      }
      cb(null, data);
    }
  );
};
