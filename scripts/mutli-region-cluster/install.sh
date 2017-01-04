#!/bin/bash

set -e
# set -x

echo Fetching Nomad...
cd /tmp/
curl -sSL https://releases.hashicorp.com/nomad/0.5.2/nomad_0.5.2_linux_amd64.zip -o nomad.zip
echo Installing Nomad...
unzip nomad.zip
sudo chmod +x nomad
sudo mv nomad /usr/bin/nomad