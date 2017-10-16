#!/bin/bash

echo "Looking for the secure.properties file"

if [ -e /etc/hashi-ui/vault.properties ];
then
    echo "File exists, executing..."
    source /etc/hashi-ui/vault.properties
else
    echo "secure.properties does not exist."
fi

echo "Starting the HASHI-UI..."
exec /hashi-ui
#exit $?
