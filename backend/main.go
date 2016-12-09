package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/op/go-logging"
)

var logger = logging.MustGetLogger("nomad-ui")

func startLogging(logLevel string) {
	logBackend := logging.NewLogBackend(os.Stderr, "", 0)

	format := logging.MustStringFormatter(
		`%{color}%{time:15:04:05.000} %{shortfile} ▶ %{level:.5s} %{color:reset} %{message}`,
	)
	logBackendFormatted := logging.NewBackendFormatter(logBackend, format)

	logBackendFormattedAndLeveled := logging.AddModuleLevel(logBackendFormatted)

	realLogLevel, err := logging.LogLevel(strings.ToUpper(logLevel))
	if err != nil {
		fmt.Printf("%s (%s)", err, logLevel)
		os.Exit(1)
	}

	logBackendFormattedAndLeveled.SetLevel(realLogLevel, "")

	logging.SetBackend(logBackendFormattedAndLeveled)
}

type Config struct {
	Address       string
	ListenAddress string
	LogLevel      string
}

func DefaultConfig() *Config {
	return &Config{
		Address:       "http://127.0.0.1:4646",
		ListenAddress: "0.0.0.0:3000",
		LogLevel:      "info",
	}
}

func flagDefault(value string) string {
	return fmt.Sprintf("(default: \"%s\")", value)
}

var (
	defaultConfig = DefaultConfig()

	flagAddress = flag.String("nomad.address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+flagDefault(defaultConfig.Address))

	flagListenAddress = flag.String("web.listen-address", "",
		"The address on which to expose the web interface. "+flagDefault(defaultConfig.ListenAddress))

	flagLogLevel = flag.String("log.level", "",
		"The log level for nomad-ui to run under. "+flagDefault(defaultConfig.LogLevel))
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

	logLevel, ok := syscall.Getenv("NOMAD_LOG_LEVEL")
	if ok {
		c.LogLevel = logLevel
	}

	if *flagAddress != "" {
		c.Address = *flagAddress
	}

	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}

	if *flagLogLevel != "" {
		c.LogLevel = *flagLogLevel
	}
}

func main() {
	cfg := DefaultConfig()
	cfg.Parse()

	startLogging(cfg.LogLevel)

	logger.Infof("---------------------------------------------------------------------------")
	logger.Infof("|                            NOMAD UI                                     |")
	logger.Infof("---------------------------------------------------------------------------")
	logger.Infof("| nomad.address      : %-50s |", cfg.Address)
	logger.Infof("| web.listen-address : http://%-43s |", cfg.ListenAddress)
	logger.Infof("| log.level          : %-50s |", cfg.LogLevel)
	logger.Infof("---------------------------------------------------------------------------")
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
