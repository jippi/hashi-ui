package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
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
	ReadOnly        bool
	Address         string
	ListenAddress   string
	ProxyAddress    string
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
		ReadOnly:        false,
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

	flagReadOnly = flag.Bool("nomad.read-only", false, "Whether Nomad should be allowed to modify state. "+
		"Overrides the NOMAD_READ_ONLY environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.ReadOnly)))

	flagAddress = flag.String("nomad.address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+flagDefault(defaultConfig.Address))

	flagListenAddress = flag.String("web.listen-address", "",
		"The address on which to expose the web interface. "+flagDefault(defaultConfig.ListenAddress))

	flagProxyAddress = flag.String("web.proxy-address", "",
		"The address used on an external proxy (exmaple: example.com/nomad) "+flagDefault(defaultConfig.ProxyAddress))

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

	readOnly, ok := syscall.Getenv("NOMAD_READ_ONLY")
	if ok {
		c.ReadOnly = readOnly != "0"
	}

	address, ok := syscall.Getenv("NOMAD_ADDR")
	if ok {
		c.Address = address
	}

	listenPort, ok := syscall.Getenv("NOMAD_PORT_http")
	if ok {
		c.ListenAddress = fmt.Sprintf("0.0.0.0:%s", listenPort)
	}

	proxyAddress, ok := syscall.Getenv("NOMAD_PROXY_ADDRESS")
	if ok {
		c.ProxyAddress = proxyAddress
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

	if *flagReadOnly == true {
		c.ReadOnly = *flagReadOnly
	}

	if *flagAddress != "" {
		c.Address = *flagAddress
	}

	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}

	if *flagProxyAddress != "" {
		c.ProxyAddress = *flagProxyAddress
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

	config := newrelic.NewConfig(cfg.NewRelicAppName, cfg.NewRelicLicense)
	config.Logger = newrelic.NewLogger(os.Stdout)

	if cfg.NewRelicAppName == "" || cfg.NewRelicLicense == "" {
		config.Enabled = false
	}

	app, err := newrelic.NewApplication(config)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	startLogging(cfg.LogLevel)

	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("|                             NOMAD UI                                     |")
	logger.Infof("----------------------------------------------------------------------------")

	if cfg.ReadOnly {
		logger.Infof("| nomad.read-only     : %-50s |", "Yes")
	} else {
		logger.Infof("| nomad.read-only     : %-50s |", "No (hashi-ui can change nomad state)")
	}

	logger.Infof("| nomad.address       : %-50s |", cfg.Address)
	logger.Infof("| web.listen-address  : http://%-43s |", cfg.ListenAddress)
	logger.Infof("| web.proxy-address   : %-50s |", cfg.ProxyAddress)
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

	myAssetFS := assetFS()

	router := mux.NewRouter()
	router.HandleFunc(newrelic.WrapHandleFunc(app, "/ws", hub.Handler))
	router.HandleFunc(newrelic.WrapHandleFunc(app, "/download/{path:.*}", nomad.downloadFile))
	router.HandleFunc(newrelic.WrapHandleFunc(app, "/config.js", func(w http.ResponseWriter, r *http.Request) {
		response := make([]string, 0)
		response = append(response, fmt.Sprintf("window.NOMAD_READ_ONLY=%s", strconv.FormatBool(cfg.ReadOnly)))
		response = append(response, fmt.Sprintf("window.NOMAD_ADDR=\"%s\"", cfg.Address))
		response = append(response, fmt.Sprintf("window.NOMAD_LOG_LEVEL=\"%s\"", cfg.LogLevel))

		var endpointURL string
		if cfg.ProxyAddress != "" {
			endpointURL = cfg.ProxyAddress
		} else {
			endpointURL = cfg.ListenAddress
		}
		response = append(response, fmt.Sprintf("window.NOMAD_ENDPOINT=\"%s\"", strings.TrimSuffix(endpointURL, "/")))

		w.Header().Set("Content-Type", "application/javascript")
		w.Write([]byte(strings.Join(response, "\n")))
	}))
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
