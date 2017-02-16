#!/bin/bash

command -v nginx >/dev/null 2>&1 || { echo >&2 "I require 'nginx' in the PATH but it's not there.  Aborting."; exit 1; }

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

exec nginx -c "$DIR/site.conf"
