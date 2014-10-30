node test/server &
SERVER_PID=$!

mocha test/ls

kill $SERVER_PID
