node test/server &
SERVER_PID=$!

echo "Testing ./lib"
mocha test/index --reporter spec
echo "Testing 'tik {ticket-number}'"
mocha test/ticket --reporter spec --slow 800
echo "Testing 'tik ls'"
mocha test/ls --reporter spec --slow 800

kill $SERVER_PID
