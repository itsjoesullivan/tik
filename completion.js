var fs = require('fs');
process.stdout.write(fs.readFileSync(__dirname + '/completion.sh', 'binary'));
process.stdout.on('error', function() {});
