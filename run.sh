#!/bin/sh

NOMAD_PORT=${NOMAD_PORT:-"4646"}

sed -i "s~__NOMAD_API_URL__~http://$NOMAD_ADDR:$NOMAD_PORT/v1~g" main*.js

PORT=${PORT:-"3000"} exec lighttpd -D -f /lighttpd.conf
