Nomad UI
========

An awesome user interface for an awesome scheduler, plain and simple :-)

![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-2.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-3.jpg)

# Usage

Download the latest release from the Github repository and start it with:
```
./nomad-ui-${operating system}
```
This will start the nomad-ui server. The frontend can be accessed on port `3000`
by default. You can override this with the `-web.listen-address`.

Another way to run nomad-ui is through Docker. Run the following command to
start a webserver that will serve the application.

```
docker run -e NOMAD_ADDR=... -p 8000:3000 iverberk/nomad-ui:0.1.0
```
Check the releases page on Github to see which version is current.

The user interface will be accessible on localhost, port `8000`. Adjust the Docker
run parameters as needed. If you need to change the port that Nomad is listening
on, you should do it with ```-e NOMAD_ADDR``` environment variable that contains
both hostname and port.

NOMAD_ADDR (IP or DNS name) should point to the correct location of your Nomad server.
If you have a Node and Go environment you can also build the production version yourself.

1. Build the webapp

```
npm install
npm run-script build
```

This requires that the webpack command is available somewhere in your path. The
resulting files will be stored in the dist/ folder and can be served by any webserver.

2. Build the backend server

```
install glide (instructions: https://glide.sh)
install go-bindata (instructions: https://github.com/elazarl/go-bindata-assetfs#readme)
go-bindata-assetfs dist/...
mv bindata_assetfs.go backend/
cd backend/
glide update
go build -o nomad-ui .
```
This leaves you with a nomad-ui binary that contains both the backend server and
the frontend webapp.

# Development

Just run ```npm install``` and ```npm start``` and start developing. Hot reloading is enabled, so any
changes will be visible in the browser immediately. Unfortunately there are no tests yet.

If you would like to contribute please open a pull-request.

# Credits

The awesome dashboard theme is created by [Creative Tim](www.creative-tim.com)
and can be found [here](http://www.creative-tim.com/product/light-bootstrap-dashboard-pro)
