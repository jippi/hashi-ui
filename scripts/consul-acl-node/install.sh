#!/bin/sh

if [ -e ~/bin/consul-cli ]; then
    echo "consul-cli already installed"
    exit 0
fi

if [ ! -e consul-cli_0.3.1_darwin_amd64.tar.gz ]; then
    wget -q https://github.com/CiscoCloud/consul-cli/releases/download/v0.3.1/consul-cli_0.3.1_darwin_amd64.tar.gz
fi

if [ ! -e consul-cli_0.3.1_darwin_amd64 ]; then
    tar zxf consul-cli_0.3.1_darwin_amd64.tar.gz
fi

mv consul-cli_0.3.1_darwin_amd64/consul-cli ~/bin/

# cleanup
rm consul-cli_0.3.1_darwin_amd64.tar.gz
rm -rf consul-cli_0.3.1_darwin_amd64

echo "install of consul-cli complete"
