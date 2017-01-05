# Development flow and help

- [Assumptions](#assumptions)
  * [Go configuration](#go-configuration)
- [Workflow](#workflow)
- [Development](#development)
- [Building](#building)

# Assumptions

The following assumptions are made for local development:

- the project is checked out into `$GOPATH/src/github.com/jippi/hashi-ui`
- `go` in a recent version (I use `1.7.3` but older 7.x might also work)
- `node` in a recent version (I use `7.2.1` but older versions should work too)
- `yarn` is installed (`brew install yarn` on OS X)

## Go configuration

I use environment like this for Go development

```
export GOPATH=$HOME/src/go-lang
export PATH=$PATH:$GOPATH/bin

mkdir -p ~/src/go-lang/src/github.com/jippi
cd ~/src/go-lang/src/github.com/jippi
git clone git@github.com:jippi/hashi-ui.git
cd hashi-ui
```
## Vagrant

The option to use Vagrant is also an available. Vagrant must be previously installed. See the Vagrant [docs](https://www.vagrantup.com/docs/getting-started/) for how to get started.

From the root folder, run ``` vagrant up ``` to create the guest machine with go and the go environment pre-configured.

Once Vagrant has provisioned the virtual machine, run ``` vagrant ssh ``` to access the ssh session.

# Workflow

Both the `frontend/` and the `backend/` directory got their own specialized `Makefile`.

They share some common commands like `install`, `build`, `clean` and `dist-clean`.

The root `/Makefile` mirror these commands, and simply run them for you in both directories.

To build the project simply run `make -j build` in the root of the project, and both frontend and backend will be
installed and setup for you, including any dependencies needed for a successful build.

`make build` will build both the frontend and backend projects. Running the command a 2nd time will not compile anything,
since all binaries will exist in the build output directories.

For continuous workflow, use `make -j rebuild` which will remove any build artifact (`make clean`) before running `make build`.

`make rebuild` will also delete the frontend build artifacts, which will cause `webpack` to run again to crate the static
HTML, JS and CSS bundles needed to be embedded in the Go binary at compile time. This process can take a while, so if you
don't need to re-bundle new frontend assets in the Go binary, use `KEEP_BINDATA_ASSETFS=1 make -j rebuild` which will prevent
the deletion of the binary frontend bundle, and just recompile the Go code.

# Development

Run `make -j build` in the root directory to get all dependencies and binaries setup and built.

If the work you plan to do only involve the frontend, run a command similar to this to get the Go server API available:
`NOMAD_LOG_LEVEL=debug NOMAD_ADDR=http://localhost:4646 ./backend/build/hashi-ui-darwin-amd64`

Once the hashi-ui server is running, go to the `frontend/` directory and run `yarn start`.
Once its running you can access http://0.0.0.0:3333 for the hot-reloading reactjs frontend, which will automatically
update your browser with any JS changes you do in your editor on file save.

If your code involve Go changes as well, a workflow like the following is fairly efficient (from the `backend/`) directory
`KEEP_BINDATA_ASSETFS=1 make -j rebuild && NOMAD_LOG_LEVEL=debug NOMAD_ADDR=http://localhost:4646 ./build/hashi-ui-darwin-amd64`


# Building

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