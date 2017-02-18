Hashi UI [![Build Status](https://travis-ci.org/jippi/hashi-ui.svg?branch=master)](https://travis-ci.org/jippi/hashi-ui)
========

[![Join the chat at https://gitter.im/hashi-ui/Lobby](https://badges.gitter.im/hashi-ui/Lobby.svg)](https://gitter.im/hashi-ui/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Docker Stars](https://img.shields.io/docker/stars/jippi/hashi-ui.svg)](https://hub.docker.com/r/jippi/hashi-ui/)
[![Docker Pulls](https://img.shields.io/docker/pulls/jippi/hashi-ui.svg)](https://hub.docker.com/r/jippi/hashi-ui/)

An awesome user interface (even for mobile devices!) for HashiCorp Consul & Nomad, plain and simple :-)

![Hashi UI](https://dl.dropboxusercontent.com/u/27514/nomad-screenshots/0.5/cluster-overview-small.jpg)

[View more screenshots of Nomad & Consul interface](https://github.com/jippi/hashi-ui/blob/master/SCREENSHOTS.md)

# TOC

- [Why](#why)
- [Usage](#usage)
- [Configuration](#configuration)
  * [General Configuration](#general-configuration)
  * [Nomad Configuration](#nomad-configuration)
  * [Consul Configuration](#consul-configuration)
  * [Instrumentation Configuration](#instrumentation-configuration)
  * [Running in AWS](#running-in-aws)
- [Try](#try)
  * [Nomad](#nomad)
  * [Consul](#consul)
- [Development & Build](#development---build)

# Why

For Nomad, it was quite simple, no mobile-optimized, (somewhat) feature-complete and live-updating interface existed.

For Consul, the built-in UI is decent, but lacks a variety of essential features:

- Live update of Services, Nodes and Key/Value lists (nobody likes to refresh)
- More API complete (e.g. unregister services and services checks directly from UI)
- CAS (Check-And-Set) support in both Write and Delete actions for KV, preventing accidental modification or deleting of keys that have changed since you loaded them.
- KV breadcrumbs could not be used for navigation
- Sorting KV folders and keys separately (always folders first)
- More inter-linking between services/nodes

Today the Consul and Nomad UI exist in the same binary, but do not "cross-talk" to each other, but long term goal is to integrate them even closer, so from Nomad Job UI you can see Consul health check status for the job tasks, and vice versa be able to cross-link between two otherwise distinct systems.

Long term, **Vault** support would be an amazing addition to the UI, contributions are more than welcome on this!

# Usage

> Until Hash-UI reaches 1.x, development efforts will focus on the latest versions of HashiCorp products

Download the latest release from the Github repository and start it with:

```
# if you got Nomad running on localhost
./hashi-ui-<os>-<arch> --nomad-enable

# if you got Nomad running on a specific Protocol/IP/Port
./hashi-ui-<os>-<arch> --nomad-enable --nomad-address http://IP:Port

# if you got Consul running on localhost
./hashi-ui-<os>-<arch> --consul-enable

# if you got Consul running on a specific IP/Port
./hashi-ui-<os>-<arch> --consul-enable  --consul-address IP:Port

# if you got nomad and Consul running on localhost
./hashi-ui-<os>-<arch> --nomad-enable --consul-enable
```

This will start the hashi-ui server that will try to connect to local
nomad server. The frontend can be accessed on port `3000` by default.
You can override this with the `-listen-address`.

Another way to run hashi-ui is through Docker. Run the following command to
start a webserver that will serve the application.

```sh
# nomad only
docker run -e NOMAD_ENABLE=1 -e NOMAD_ADDR=... -p 8000:3000 jippi/hashi-ui
# consul only
docker run -e CONSUL_ENABLE=1 -e CONSUL_ADDR=... -p 8000:3000 jippi/hashi-ui
# nomad + consul
docker run -e NOMAD_ENABLE=1 -e NOMAD_ADDR=... -e CONSUL_ENABLE=1 -e CONSUL_ADDR=... -p 8000:3000 jippi/hashi-ui
```

Check the releases page on GitHub to see which version is current.

The user interface will be accessible on localhost, port `8000`. Adjust the Docker
run parameters as needed. If you need to change the port that Nomad is listening
on, you should do it with `-e NOMAD_ADDR` environment variable that contains
both hostname and port.

# Configuration

hashi-ui can be controlled by both ENV or CLI flags as described below

## General Configuration

| Environment        	    | CLI (`--flag`)      		  | Default                 	| Description                                                                                                      |
|-------------------------|---------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------|
| `LOG_LEVEL` 	          | `log-level`               | `info`                  	| Log level to use while running the hashi-ui server - (`critical`, `error`, `warning`, `notice`, `info`, `debug`) |
| `PROXY_ADDRESS`         | `proxy-address` 	        | `<empty>`               	| (optional) The base URL of the UI when running behind a reverse proxy (ie: example.com/nomad/)                   |
| `LISTEN_ADDRESS`        | `listen-address`          | `0.0.0.0:3000`            | The IP + PORT to listen on                                                                                       |

## Nomad Configuration

| Environment        	    | CLI (`--flag`)    		  | Default                 	| Description                                                                                                      |
|-------------------------|-------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------|
| `NOMAD_ENABLE`          | `nomad-enable`      	  | `false` 	                | Use `--nomad.enable` or env `NOMAD_ENABLE=1` to enable Nomad backend                                             |
| `NOMAD_ADDR`            | `nomad-address`      	  | `http://127.0.0.1:4646` 	| Protocol + Host + Port for your .                                                                                |
| `NOMAD_READ_ONLY`    	  | `nomad-read-only`   	  | `false` 		        	    | Should hash-ui allowed to modify Nomad state (stop/start jobs and so forth)	                                     |
| `NOMAD_CACERT`      	  | `nomad-ca-cert`      	  | `<empty>`   	            | (optional) path to a CA Cert file (remember to use `https://` in `NOMAD_ADDR` if you enable TLS)                 |
| `NOMAD_CLIENT_CERT`  	  | `nomad-client-cert`     | `<empty>` 	              | (optional) path to a client cert file (remember to use `https://` in `NOMAD_ADDR` if you enable TLS)             |
| `NOMAD_CLIENT_KEY`  	  | `nomad-client-key`      | `<empty>` 	              | (optional) path to a client key file (remember to use `https://` in `NOMAD_ADDR` if you enable TLS)          	   |
| `NOMAD_PORT_http` 	    | `<none>` 	              | `0.0.0.0:3000`          	| The IP + PORT to listen on (will overwrite `LISTEN_ADDRESS`)                                                     |

## Consul Configuration

| Environment        	    | CLI (`--flag`)    		  | Default                 	| Description                                                                                                      |
|-------------------------|-------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------|
| `CONSUL_ENABLE`         | `consul.enable`      	  | `false` 	                | Use `--consul.enable` or env `CONSUL_ENABLE=1` to enable Consul backend                                          |
| `CONSUL_ADDR`           | `consul.address`    	  | `127.0.0.1:8500           | Host + Port for your Consul server, e.g. `localhost:8500` (Do not include protocol)                              |
| `CONSUL_READ_ONLY`  	  | `consul.read-only`   	  | `false` 		            	| Should hash-ui allowed to modify Consul state (modify KV, Services and so forth)                                 |
| `CONSUL_ACL_TOKEN`  	  | `consul.acl-token`   	  | `<empty>` 		          	| Should hash-ui allowed to modify Consul state (modify KV, Services and so forth)                                 |

## Instrumentation Configuration

| Environment        	    | CLI (`--flag`)    		  | Default                 	| Description                                                                                                      |
|-------------------------|-------------------------|---------------------------|------------------------------------------------------------------------------------------------------------------|
| `NEWRELIC_APP_NAME`     | `newrelic.app_name`  	  | `hashi-ui`               	| (optional) NewRelic application name                                                                             |
| `NEWRELIC_LICENSE`      | `newrelic.license`  	  | `<empty>`          	  		| (optional) NewRelic license key               


## Running in AWS

When Running Hashi UI behind AWS ELB (even with Nginx/Traefik in between), ELB should be configured with TCP not HTTP Listeners (HTTP Listener doesn't support websockets)

# Try

## Nomad

You need a running nomad server to try Hashi UI:

```
nomad agent -server -client -bootstrap-expect 1 -data-dir /tmp/nomad
```

Now you can run Hashi UI in other terminal (we assume you have it in PATH):

```
hashi-ui-<os>-<arch> --nomad-enable
```

Open browser and visit [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Consul

You can run the Consul UI against the official HashiCorp Consul demo like this:

```
hashi-ui-<os>-<arch> --consul-enable --consul-address demo.consul.io
```

Open browser and visit [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Troubleshooting

- Log lines like `19:25:54.105 nomad_hub.go:69 ▶ ERROR  transport: websocket upgrade failed: websocket: could not find connection header with token 'upgrade'` and the web interface is not working.
  - Ensure your load balancer is treating the services as TCP on port 80 (and SSL on 443). Websockets can't use HTTP/HTTPS mode.

# Contributing & Development

If you would like to contribute (Thanks ! <3) please open a pull-request with your code change or a RFC issue.

See [DEVELOPMENT.md](https://github.com/jippi/hashi-ui/blob/master/DEVELOPMENT.md) for information on how to get started with hacking on hashi-ui.
