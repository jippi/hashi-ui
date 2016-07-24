#!/bin/sh

sed -i "s~__NOMAD_API_URL__~http://$NOMAD_ADDR:$NOMAD_PORT/v1~g" main*.js

exec lighttpd -D -f /lighttpd.conf
