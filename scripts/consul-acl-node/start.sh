#!/bin/bash

set -e
set -u
# set -x

command -v consul >/dev/null 2>&1 || { echo >&2 "I require 'consul' in the PATH but it's not there.  Aborting."; exit 1; }
command -v consul-cli >/dev/null 2>&1 || { echo >&2 "I require 'consul-cli' in the PATH but it's not there.  Aborting."; exit 1; }

current_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

handler() {
    kill $consul_pid
}

trap handler SIGINT

# start US region server
echo "Starting server"
consul agent -server -dev -config-file $current_dir/config.json &
consul_pid=$!

echo "Waiting for consul server to be responding: "
while ! echo "" | nc localhost 8500;
do
    echo "."
    sleep 1
done
echo "Consul server is successfully running"

echo "Waiting 15s for consul to be ready..."
sleep 15;

echo "Submitting ACL config"
consul-cli \
    --token="398073a8-5091-4d9c-871a-bbbeb030d1f6" acl create \
    --name "sample default rule" \
    --rule='key:writable/:write' \
    --rule='key:readable/:read' \
    --rule='key:nope/:deny'
# consul-cli --token="398073a8-5091-4d9c-871a-bbbeb030d1f6" acl create --name "sample default rule" --rule='key:readable/:read'
# consul-cli --token="398073a8-5091-4d9c-871a-bbbeb030d1f6" acl create --name "sample default rule" --rule='key:nope/:deny'

wait $consul_pid
