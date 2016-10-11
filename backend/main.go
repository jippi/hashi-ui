package main

import (
	"flag"
	"fmt"
	"os"
	"syscall"
	"time"

	"net/http"

	"github.com/gorilla/mux"
	"github.com/op/go-logging"
)

var logger = logging.MustGetLogger("nomad-ui")

func init() {
	logBackend := logging.NewLogBackend(os.Stderr, "", 0)

	format := logging.MustStringFormatter(
		`%{color}%{time:15:04:05.000} %{shortfile} ▶ %{level:.4s} %{color:reset} %{message}`,
	)
	logBackendFormatted := logging.NewBackendFormatter(logBackend, format)

	logBackendFormattedAndLeveled := logging.AddModuleLevel(logBackendFormatted)
	logBackendFormattedAndLeveled.SetLevel(logging.INFO, "")

	logging.SetBackend(logBackendFormattedAndLeveled)
}

type Config struct {
	Address       string
	ListenAddress string
}

func DefaultConfig() *Config {
	return &Config{
		Address:       "http://127.0.0.1:4646",
		ListenAddress: "0.0.0.0:3000",
	}
}

func flagDefault(value string) string {
	return fmt.Sprintf("(default: \"%s\")", value)
}

var (
	defaultConfig = DefaultConfig()

	flagAddress = flag.String("address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+flagDefault(defaultConfig.Address))
	flagListenAddress = flag.String("web.listen-address", "",
		"The address on which to expose the web interface. "+flagDefault(defaultConfig.ListenAddress))
)

func (c *Config) Parse() {
	flag.Parse()

	address, ok := syscall.Getenv("NOMAD_ADDR")
	if ok {
		c.Address = address
	}

	listenPort, ok := syscall.Getenv("NOMAD_PORT_http")
	if ok {
		c.ListenAddress = fmt.Sprintf("0.0.0.0:%s", listenPort)
	}

	if *flagAddress != "" {
		c.Address = *flagAddress
	}

	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}
}

func main() {
	cfg := DefaultConfig()
	cfg.Parse()
	logger.Infof("----------------------------------------------------------------------")
	logger.Infof("|                          NOMAD UI                                  |")
	logger.Infof("----------------------------------------------------------------------")
	logger.Infof("| address            : %-45s |", cfg.Address)
	logger.Infof("| web.listen-address : %-45s |", cfg.ListenAddress)
	logger.Infof("----------------------------------------------------------------------")
	logger.Infof("")

	broadcast := make(chan *Action)

	logger.Infof("Connecting to nomad ...")
	nomad, err := NewNomad(cfg.Address, broadcast)
	if err != nil {
		logger.Fatalf("Could not create client: %s", err)
	}

	go nomad.watchAllocs()
	go nomad.watchEvals()
	go nomad.watchJobs()
	go nomad.watchNodes()
	go nomad.watchMembers()

	hub := NewHub(nomad, broadcast)
	go hub.Run()

	router := mux.NewRouter()

	myAssetFS := assetFS()

	router.HandleFunc("/ws", hub.Handler)
	router.HandleFunc("/download/{path:.*}", nomad.downloadFile)
	router.PathPrefix("/static").Handler(http.FileServer(myAssetFS))
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if bs, err := myAssetFS.Open("/index.html"); err != nil {
			logger.Infof("%s", err)
		} else {
			http.ServeContent(w, r, "index.html", time.Now(), bs)
		}
	})

	logger.Infof("Listening ...")
	err = http.ListenAndServe(cfg.ListenAddress, router)
	if err != nil {
		logger.Fatal(err)
	}
}
