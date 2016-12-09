Nomad UI [![Build Status](https://travis-ci.org/iverberk/nomad-ui.svg?branch=master)](https://travis-ci.org/iverberk/nomad-ui)
========

[![Join the chat at https://gitter.im/nomad-ui/Lobby](https://badges.gitter.im/nomad-ui/Lobby.svg)](https://gitter.im/nomad-ui/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An awesome user interface for an awesome scheduler, plain and simple :-)

![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-2.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-3.jpg)

# Usage

Download the latest release from the Github repository and start it with:

```
./nomad-ui-<os>-<arch>
```

This will start the nomad-ui server that will try to connect to local
nomad server. The frontend can be accessed on port `3000` by default.
You can override this with the `-web.listen-address`.

Another way to run nomad-ui is through Docker. Run the following command to
start a webserver that will serve the application.

```
docker run -e NOMAD_ADDR=... -p 8000:3000 iverberk/nomad-ui
```

Check the releases page on GitHub to see which version is current.

The user interface will be accessible on localhost, port `8000`. Adjust the Docker
run parameters as needed. If you need to change the port that Nomad is listening
on, you should do it with ```-e NOMAD_ADDR``` environment variable that contains
both hostname and port.

# Configuration

Nomad-UI can be controlled by both ENV or CLI flags as described below

| Environment        	| Flag                  	| Default                 	| Description                                                                                          	|
|-------------------	|-----------------------	|-------------------------	|------------------------------------------------------------------------------------------------------	|
| `NOMAD_ADDR`      	| `--nomad.address`      	| `http://127.0.0.1:4646` 	| Must point to the correct location of your Nomad server.                                             	|
| `NOMAD_PORT_http` 	| `--web.listen-address` 	| `0.0.0.0:3000`          	| The IP + PORT to listen on                                                                           	|
| `NOMAD_LOG_LEVEL` 	| `--log.level`          	| `info`                  	| Log level to use while running the nomad-ui server - (`critical`, `error`, `warning`, `notice`, `info`, `debug`) 	|

# Try

You need a running nomad server to try nomad ui:

```
nomad agent -server -client -bootstrap-expect 1 -data-dir /tmp/nomad
```

Now you can run nomad ui in other terminal (we assume you have it in PATH):

```
nomad-ui-<os>-<arch>
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
build/nomad-ui-<os>-<arch> - nomad-ui binary containing both the backend server and frontend webapp
```

By default it builds binary for host system. You can cross-compile and
build binaries for different systems and architectures as well:

```
GOBUILD='linux-amd64 windows-386 <GOOS>-<GOARCH>' make
```

See [docs](https://golang.org/doc/install/source) for the whole list of available `GOOS` and `GOARCH`
values.

# Development

Just run ```npm install``` and ```npm start``` and start developing. Hot reloading is enabled, so any
changes will be visible in the browser immediately. Unfortunately there are no tests yet.

If you would like to contribute please open a pull-request.
