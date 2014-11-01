node test/server &
SERVER_PID=$!

echo "Testing 'tik {ticket-number}'"
mocha test/ticket
echo "Testing 'tik ls'"
mocha test/ls

kill $SERVER_PID
