package main

import (
	"syscall"
	"path"
	"flag"
	"os"
	"fmt"

	"net/http"

	"github.com/gorilla/mux"
	"github.com/op/go-logging"
)

var log = logging.MustGetLogger("nomad-ui")

func init() {
	var format = logging.MustStringFormatter(
		`%{color}%{time:15:04:05.000} %{shortfunc} ▶ %{level:.4s} %{color:reset} %{message}`,
	)

	logBackend := logging.NewLogBackend(os.Stderr, "", 0)

	logBackendLeveled := logging.AddModuleLevel(logBackend)
	logBackendLeveled.SetLevel(logging.INFO, "")
	backend2Formatter := logging.NewBackendFormatter(logBackendLeveled, format)
	logging.SetBackend(backend2Formatter)
}

type Config struct {
	Address       string
	ListenAddress string
	Endpoint      string
}

func DefaultConfig() *Config {
	return &Config{
		Address: "http://127.0.0.1:4646",
		ListenAddress: "0.0.0.0:3000",
		Endpoint: "/",
	}
}

func flagDefault(value string) string {
	return fmt.Sprintf("(default: \"%s\")", value)
}

var (
	defaultConfig = DefaultConfig()

	flagAddress = flag.String("address", "", "The address of the Nomad server. " +
		"Overrides the NOMAD_ADDR environment variable if set. " + flagDefault(defaultConfig.Address))
	flagListenAddress = flag.String("web.listen-address", "",
		"The address on which to expose the web interface. " + flagDefault(defaultConfig.ListenAddress))
	flagEndpoint = flag.String("web.path", "",
		"Path under which to expose the web interface. " + flagDefault(defaultConfig.Endpoint))
)

func (c *Config) Parse() {
	flag.Parse()

	address, ok := syscall.Getenv("NOMAD_ADDR")
	if ok {
		c.Address = address
	}
	if *flagAddress != "" {
		c.Address = *flagAddress
	}
	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}
	if *flagEndpoint != "" {
		c.Endpoint = *flagEndpoint
	}
}

func main() {
	cfg := DefaultConfig()
	cfg.Parse()
	log.Infof("----------------------------------------------------------------------")
	log.Infof("|                          NOMAD UI                                  |")
	log.Infof("----------------------------------------------------------------------")
	log.Infof("| address            : %-45s |", cfg.Address)
	log.Infof("| web.listen-address : %-45s |", cfg.ListenAddress)
	log.Infof("| web.path           : %-45s |", cfg.Endpoint)
	log.Infof("----------------------------------------------------------------------")
	log.Infof("")

	broadcast := make(chan *Action)

	log.Infof("Connecting to nomad ...")
	nomad, err := NewNomad(cfg.Address, broadcast)
	if err != nil {
		log.Fatalf("Could not create client: %s", err)
	}

	go nomad.watchAllocs()
	go nomad.watchEvals()
	go nomad.watchJobs()
	go nomad.watchNodes()
	go nomad.watchMembers()

	hub := NewHub(nomad, broadcast)
	go hub.Run()

	router := mux.NewRouter()
	router.HandleFunc(path.Join(cfg.Endpoint, "ws"), hub.Handler)
	router.PathPrefix(cfg.Endpoint).Handler(http.FileServer(assetFS()))

	log.Infof("Listening ...")
	err = http.ListenAndServe(cfg.ListenAddress, router)
	if err != nil {
		log.Fatal(err)
	}
}
