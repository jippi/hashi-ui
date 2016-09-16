## v0.1.3

FIX:
  * Fix broken taskgroup constraint rendering

## v0.1.2

IMPROVEMENTS:
  * Allow dynamic listen port for Nomad

FIX:
  * Use https for external content loading
  * Don't block on send channel after unexpected websocket termination


## v0.1.1

IMPROVEMENTS:
  * Add Nomad job specification
  * Add CLI flags to specify Nomad and listen address
  * Add Server members overview
  * Improved logging
  * Lot's of build and release automation added
  * Added TaskGroup and Tasks section to Job view

Special thanks to Alexander Krasnukhin who has done most of the work!

## v0.1.0 (August 8, 2016)

IMPROVEMENTS:
  * Introduce Go backend to query the Nomad server
  * Use websockets instead of long-polling
  * Real-time streaming of files to the UI

## unspecified version (July 24, 2016)

  * Initial release
