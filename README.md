Nomad UI
========

An awesome user interface for an awesome scheduler, plain and simple :-)

![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-2.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-3.jpg)

# Usage

Since Nomad UI is a web-based application it needs to connect to the Nomad server directly. In order to make this work you need to enable CORS for the Nomad server. You can use the following config as an example:

```
http_api_response_headers {
  Access-Control-Allow-Origin   = "*"
  Access-Control-Expose-Headers = "x-nomad-index"
  Access-Control-Allow-Methods  = "GET, POST, OPTIONS"
}
```

The easiest way to run nomad-ui is through Docker. This way you won't have to
install any dependencies. Run the following command to start a webserver that
will serve the application.

```
docker run -e NOMAD_ADDR=... -p 8000:3000 iverberk/nomad-ui
```

The user interface will be accessible on localhost, port 8000. Adjust the Docker
run parameters as needed. If you need to change the port that Nomad is listening
on, you can use the additional ```-e NOMAD_PORT=...``` environment variable.

NOMAD_ADDR (IP or DNS name) and NOMAD_PORT should point to the correct location of your Nomad
server. It is also possible to specify the listening port for the lighttpd server that is running in the Docker container with ```-e PORT=...```. If you have a Node environment you can also build the production version
yourself with:

```
npm install
NODE_ENV=production webpack -p --progress
```

This requires that the webpack command is available somewhere in your path. The
resulting files will be stored in the dist/ folder and can be served by any webserver.
You will have to adjust the value in config/settings.prod.json to the correct URL for
the Nomad API.

# Development

Just run ```npm install``` and ```npm start``` and start developing. Hot reloading is enabled, so any
changes will be visible in the browser immediately. Unfortunately there are no tests yet.

If you would like to contribute please open a pull-request.

# Credits

The awesome dashboard theme is created by [Creative Tim](www.creative-tim.com)
and can be found [here](http://www.creative-tim.com/product/light-bootstrap-dashboard-pro)
