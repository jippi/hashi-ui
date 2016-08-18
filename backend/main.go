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
	backend2Formatter := logging.NewBackendFormatter(logBackend, format)
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
		ListenAddress: ":3000",
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

	router := mux.NewRouter()

	broadcast := make(chan *Action)

	nomad := NewNomad(cfg.Address, broadcast)
	go nomad.watchAllocs()
	go nomad.watchEvals()
	go nomad.watchNodes()
	go nomad.watchJobs()

	hub := NewHub(nomad, broadcast)
	go hub.Run()

	router.HandleFunc(path.Join(cfg.Endpoint, "ws"), hub.Handler)
	router.PathPrefix(cfg.Endpoint).Handler(http.FileServer(assetFS()))

	log.Infof("Listening on %s", cfg.ListenAddress)
	err := http.ListenAndServe(cfg.ListenAddress, router)
	if err != nil {
		log.Fatal(err)
	}
}
