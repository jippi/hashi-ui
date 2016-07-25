Nomad UI
========

An awesome user interface for an awesome scheduler, plain and simple :-)

![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-2.jpg)
![Nomad UI](http://www.ivoverberk.nl/dl/nomad-ui-3.jpg)

# Usage

The easiest way to run nomad-ui is through Docker. This way you won't have to
install any dependencies. Run the following command to start a webserver that
will serve the application.

```
docker run -e NOMAD_ADDR=... -e NOMAD_PORT=... -p 8000:3000 iverberk/nomad-ui
```

The user interface will be accessible on localhost, port 8000. Adjust the Docker
run parameters as needed.

NOMAD_ADDR (IP or DNS name) and NOMAD_PORT should point to the correct location of your Nomad
server. If you have a Node environment you can also build the production version
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
