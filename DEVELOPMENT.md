# Assumptions

The following assumptions are made for local development:

- the project is checked out into `$GOPATH/src/github.com/jippi/hashi-ui`
- `go` in a recent version (I use `1.7.3` but older 7.x might also work)
- `node` in a recent version (I use `7.2.1` but older versions should work too)
- `yarn` is installed (`brew install yarn` on OS X)

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
`make rebuild && NOMAD_LOG_LEVEL=debug NOMAD_ADDR=http://localhost:4646 ./build/nomad-ui-darwin-amd64`
