const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 4000,
  path: '/health',
  timeout: 2000
};

const healthCheck = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', function (err) {
  console.error('ERROR:', err);
  process.exit(1);
});

healthCheck.end(); 