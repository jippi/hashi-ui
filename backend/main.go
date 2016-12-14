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
	"github.com/imkira/go-observer"
	"github.com/newrelic/go-agent"
	"github.com/op/go-logging"
)

var logger = logging.MustGetLogger("hashi-ui")

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
	Address         string
	ListenAddress   string
	LogLevel        string
	NewRelicAppName string
	NewRelicLicense string
}

type BroadcastChannels struct {
	allocations        observer.Property
	allocationsShallow observer.Property
	evaluations        observer.Property
	jobs               observer.Property
	members            observer.Property
	nodes              observer.Property
	clusterStatistics  observer.Property
}

func DefaultConfig() *Config {
	return &Config{
		Address:         "http://127.0.0.1:4646",
		ListenAddress:   "0.0.0.0:3000",
		LogLevel:        "info",
		NewRelicAppName: "hashi-ui",
		NewRelicLicense: "",
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
		"The log level for hashi-ui to run under. "+flagDefault(defaultConfig.LogLevel))

	flagNewRelicAppName = flag.String("newrelic.app_name", "hashi-ui",
		"The NewRelic app name. "+flagDefault(defaultConfig.NewRelicAppName))

	flagNewRelicLicense = flag.String("newrelic.license", "",
		"The NewRelic license key. "+flagDefault(defaultConfig.NewRelicLicense))
)

func (c *Config) Parse() {
	flag.Parse()

	// env

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

	newRelicAppName, ok := syscall.Getenv("NEWRELIC_APP_NAME")
	if ok {
		c.NewRelicAppName = newRelicAppName
	}

	newRelicLicense, ok := syscall.Getenv("NEWRELIC_LICENSE")
	if ok {
		c.NewRelicLicense = newRelicLicense
	}

	// flags

	if *flagAddress != "" {
		c.Address = *flagAddress
	}

	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}

	if *flagLogLevel != "" {
		c.LogLevel = *flagLogLevel
	}

	if *flagNewRelicAppName != "" {
		c.NewRelicAppName = *flagNewRelicAppName
	}

	if *flagNewRelicLicense != "" {
		c.NewRelicLicense = *flagNewRelicLicense
	}
}

func main() {
	cfg := DefaultConfig()
	cfg.Parse()

	startLogging(cfg.LogLevel)

	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("|                             NOMAD UI                                     |")
	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("| nomad.address       : %-50s |", cfg.Address)
	logger.Infof("| web.listen-address  : http://%-43s |", cfg.ListenAddress)
	logger.Infof("| log.level           : %-50s |", cfg.LogLevel)

	if cfg.NewRelicAppName != "" && cfg.NewRelicLicense != "" {
		logger.Infof("| newrelic.app_name   : %-50s |", cfg.NewRelicAppName)
		logger.Infof("| newrelic.license    : %-50s |", strings.Repeat("*", len(cfg.NewRelicLicense)))
	}

	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("")

	broadcast := make(chan *Action)

	channels := &BroadcastChannels{}
	channels.allocations = observer.NewProperty(&Action{})
	channels.allocationsShallow = observer.NewProperty(&Action{})
	channels.evaluations = observer.NewProperty(&Action{})
	channels.jobs = observer.NewProperty(&Action{})
	channels.members = observer.NewProperty(&Action{})
	channels.nodes = observer.NewProperty(&Action{})
	channels.clusterStatistics = observer.NewProperty(&Action{})

	logger.Infof("Connecting to nomad ...")
	nomad, err := NewNomad(cfg.Address, broadcast, channels)
	if err != nil {
		logger.Fatalf("Could not create client: %s", err)
	}

	go nomad.watchAllocs()
	go nomad.watchAllocsShallow()
	go nomad.watchEvals()
	go nomad.watchJobs()
	go nomad.watchNodes()
	go nomad.watchMembers()
	go nomad.watchAggregateClusterStatistics()

	hub := NewHub(nomad, broadcast, channels)
	go hub.Run()

	if cfg.NewRelicAppName != "" && cfg.NewRelicLicense != "" {
		config := newrelic.NewConfig(cfg.NewRelicAppName, cfg.NewRelicLicense)
		_, err := newrelic.NewApplication(config)
		if err != nil {
			logger.Error(err)
			os.Exit(1)
		}
	}

	myAssetFS := assetFS()

	router := mux.NewRouter()
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
