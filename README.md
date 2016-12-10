Hashi UI [![Build Status](https://travis-ci.org/jippi/hashi-ui.svg?branch=master)](https://travis-ci.org/jippi/hashi-ui)
========

[![Join the chat at https://gitter.im/hashi-ui/Lobby](https://badges.gitter.im/hashi-ui/Lobby.svg)](https://gitter.im/hashi-ui/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An awesome user interface (even for mobile devices!) for an awesome scheduler, plain and simple :-)

![Hashi UI](https://dl.dropboxusercontent.com/u/27514/nomad-screenshots/0.5/cluster-overview-small.jpg)

[More screenshots](https://github.com/jippi/hashi-ui/blob/master/SCREENSHOTS.md)

# Usage

Download the latest release from the Github repository and start it with:

```
./hashi-ui-<os>-<arch>
```

This will start the hashi-ui server that will try to connect to local
nomad server. The frontend can be accessed on port `3000` by default.
You can override this with the `-web.listen-address`.

Another way to run hashi-ui is through Docker. Run the following command to
start a webserver that will serve the application.

```
docker run -e NOMAD_ADDR=... -p 8000:3000 jippi/hashi-ui
```

Check the releases page on GitHub to see which version is current.

The user interface will be accessible on localhost, port `8000`. Adjust the Docker
run parameters as needed. If you need to change the port that Nomad is listening
on, you should do it with ```-e NOMAD_ADDR``` environment variable that contains
both hostname and port.

# Configuration

hashi-ui can be controlled by both ENV or CLI flags as described below

| Environment        	| Flag                  	| Default                 	| Description                                                                                          	|
|-------------------	|-----------------------	|-------------------------	|------------------------------------------------------------------------------------------------------	|
| `NOMAD_ADDR`      	| `--nomad.address`      	| `http://127.0.0.1:4646` 	| Must point to the correct location of your Nomad server.                                             	|
| `NOMAD_PORT_http` 	| `--web.listen-address` 	| `0.0.0.0:3000`          	| The IP + PORT to listen on                                                                           	|
| `NOMAD_LOG_LEVEL` 	| `--log.level`          	| `info`                  	| Log level to use while running the hashi-ui server - (`critical`, `error`, `warning`, `notice`, `info`, `debug`) 	|

# Try

You need a running nomad server to try Hashi UI:

```
nomad agent -server -client -bootstrap-expect 1 -data-dir /tmp/nomad
```

Now you can run Hashi UI in other terminal (we assume you have it in PATH):

```
hashi-ui-<os>-<arch>
```

Open browser and visit [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Build

Project is built using make:

```
make
```

The resulting files will be stored in `build/` folder:

```
build/webpack              - frontend webapp that can be served by any webserver
build/hashi-ui-<os>-<arch> - hashi-ui binary containing both the backend server and frontend webapp
```

By default it builds binary for host system. You can cross-compile and
build binaries for different systems and architectures as well:

```
GOBUILD='linux-amd64 windows-386 <GOOS>-<GOARCH>' make
```

See [docs](https://golang.org/doc/install/source) for the whole list of available `GOOS` and `GOARCH`
values.

# Development

If you would like to contribute please open a pull-request. See [DEVELOPMENT.md](https://github.com/jippi/hashi-ui/blob/master/DEVELOPMENT.md)
