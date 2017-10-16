#!/bin/bash

echo "Looking for the vault.env file"

if [ -e /etc/hashi-ui/vault.env ];
then
    echo "File exists, executing..."
    source /etc/hashi-ui/vault.env
else
    echo "vault.env file does not exist."
fi

echo "Starting the HASHI-UI..."
exec /hashi-ui
#exit $?
