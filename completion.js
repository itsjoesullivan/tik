var fs = require('fs');
process.stdout.write(fs.readFileSync(__dirname + '/completion.sh', 'utf8'));
process.stdout.on('error', function() {});
