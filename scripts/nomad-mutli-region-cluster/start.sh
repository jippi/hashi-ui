#!/bin/bash

set -e
# set -x

command -v nomad >/dev/null 2>&1 || { echo >&2 "I require 'nomad' in the PATH but it's not there.  Aborting."; exit 1; }

current_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

handler() {
    kill $us_dc_pid
    kill $eu_dc_pid
}

trap handler SIGINT

# start US region server
echo "Starting US region server"
nomad agent -server -dev -config $current_dir/dc-us.hcl &
us_dc_pid=$!

echo "Waiting for US region server to be responding: "
while ! echo "" | nc localhost 4747;
do
    echo "."
    sleep 1
done
echo "US region server is successfully running"

# start EU region server
echo "Starting EU region server"
nomad agent -server -dev -config $current_dir/dc-eu.hcl &
eu_dc_pid=$!

echo "Waiting for EU region server to be responding: "
while ! echo "hello" | nc localhost 4646;
do
    echo "."
    sleep 1
done
echo "EU region server is successfully running"

# Join EU and US region clusters
nomad server-join 127.0.0.1:4748

# Schedule EU and US job
nomad run $current_dir/job-eu.nomad
nomad run $current_dir/job-us.nomad

wait $eu_dc_pid $us_dc_pid