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

// RegionChannels ...
type RegionChannels map[string]*BroadcastChannels

// RegionClients ...
type RegionClients map[string]*NomadRegion

// Config for the hashi-ui server
type Config struct {
	ReadOnly        bool
	Address         string
	ListenAddress   string
	ProxyAddress    string
	LogLevel        string
	NewRelicAppName string
	NewRelicLicense string
	CACert          string
	ClientCert      string
	ClientKey       string
}

// BroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type BroadcastChannels struct {
	allocations        observer.Property
	allocationsShallow observer.Property
	evaluations        observer.Property
	jobs               observer.Property
	members            observer.Property
	nodes              observer.Property
	clusterStatistics  observer.Property
}

// DefaultConfig is the basic out-of-the-box configuration for hashi-ui
func DefaultConfig() *Config {
	return &Config{
		ReadOnly:        false,
		Address:         "http://127.0.0.1:4646",
		ListenAddress:   "0.0.0.0:3000",
		LogLevel:        "info",
		NewRelicAppName: "hashi-ui",
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

	flagNomadCACert = flag.String("nomad.ca_cert", "", "Path to the Nomad TLS CA Cert File. "+
		"Overrides the NOMAD_CACERT environment variable if set. "+flagDefault(defaultConfig.CACert))

	flagNomadClientCert = flag.String("nomad.client_cert", "", "Path to the Nomad Client Cert File. "+
		"Overrides the NOMAD_CLIENT_CERT environment variable if set. "+flagDefault(defaultConfig.ClientCert))

	flagNomadClientKey = flag.String("nomad.client_key", "", "Path to the Nomad Client Key File. "+
		"Overrides the NOMAD_CLIENT_KEY environment variable if set. "+flagDefault(defaultConfig.ClientKey))

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

// Parse the env and cli flags and store the outcome in a Config struct
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

	nomadCACert, ok := syscall.Getenv("NOMAD_CACERT")
	if ok {
		c.CACert = nomadCACert
	}

	nomadClientCert, ok := syscall.Getenv("NOMAD_CLIENT_CERT")
	if ok {
		c.ClientCert = nomadClientCert
	}

	nomadClientKey, ok := syscall.Getenv("NOMAD_CLIENT_KEY")
	if ok {
		c.ClientKey = nomadClientKey
	}

	// flags

	if *flagReadOnly {
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

	if *flagNomadCACert != "" {
		c.CACert = *flagNomadCACert
	}

	if *flagNomadClientCert != "" {
		c.ClientCert = *flagNomadClientCert
	}

	if *flagNomadClientKey != "" {
		c.ClientKey = *flagNomadClientKey
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

	_, err := newrelic.NewApplication(config)
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
	logger.Infof("| nomad.ca_cert       : %-50s |", cfg.CACert)
	logger.Infof("| nomad.client_cert   : %-50s |", cfg.ClientCert)
	logger.Infof("| nomad.client_key    : %-50s |", cfg.ClientKey)
	logger.Infof("| web.listen-address  : http://%-43s |", cfg.ListenAddress)
	logger.Infof("| web.proxy-address   : %-50s |", cfg.ProxyAddress)
	logger.Infof("| log.level           : %-50s |", cfg.LogLevel)

	if cfg.NewRelicAppName != "" && cfg.NewRelicLicense != "" {
		logger.Infof("| newrelic.app_name   : %-50s |", cfg.NewRelicAppName)
		logger.Infof("| newrelic.license    : %-50s |", strings.Repeat("*", len(cfg.NewRelicLicense)))
	}

	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("")

	nomadClient, err := CreateNomadRegionClient(cfg, "")
	if err != nil {
		logger.Fatalf("Could not create Nomad API Client: %s", err)
		return
	}

	regions, err := nomadClient.Regions().List()
	if err != nil {
		logger.Fatalf("Could not fetch nomad regions from API: %s", err)
		return
	}

	regionChannels := RegionChannels{}
	regionClients := RegionClients{}

	for _, region := range regions {
		logger.Infof("Starting handlers for region: %s", region)

		channels := &BroadcastChannels{}
		channels.allocations = observer.NewProperty(&Action{})
		channels.allocationsShallow = observer.NewProperty(&Action{})
		channels.evaluations = observer.NewProperty(&Action{})
		channels.jobs = observer.NewProperty(&Action{})
		channels.members = observer.NewProperty(&Action{})
		channels.nodes = observer.NewProperty(&Action{})
		channels.clusterStatistics = observer.NewProperty(&Action{})

		regionChannels[region] = channels

		regionClient, clientErr := CreateNomadRegionClient(cfg, region)
		if clientErr != nil {
			logger.Fatalf("  -> Could not create client: %s", clientErr)
			return
		}

		logger.Infof("  -> Connecting to nomad")
		nomad, nomadErr := NewNomad(cfg, regionClient, channels)
		if nomadErr != nil {
			logger.Fatalf("    -> Could not create client: %s", nomadErr)
			return
		}

		regionClients[region] = nomad

		logger.Info("  -> Starting resource watchers")
		nomad.StartWatchers()
	}

	myAssetFS := assetFS()

	hub := NewHub(regionClients, regionChannels)
	go hub.Run()

	router := mux.NewRouter()
	router.HandleFunc("/ws", hub.Handler)
	router.HandleFunc("/ws/{service}", hub.Handler)
	router.HandleFunc("/ws/{service}/{region}", hub.Handler)
	// router.HandleFunc(newrelic.WrapHandleFunc(app, "/download/{path:.*}", nomad.downloadFile))
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		responseFile := "/index.html"

		if idx := strings.Index(r.URL.Path, "static/"); idx != -1 {
			responseFile = r.URL.Path[idx:]
		}

		if idx := strings.Index(r.URL.Path, "favicon.png"); idx != -1 {
			responseFile = "/favicon.png"
		}

		if idx := strings.Index(r.URL.Path, "config.js"); idx != -1 {
			response := make([]string, 0)
			response = append(response, fmt.Sprintf("window.NOMAD_READ_ONLY=%s", strconv.FormatBool(cfg.ReadOnly)))
			response = append(response, fmt.Sprintf("window.NOMAD_ADDR=\"%s\"", cfg.Address))
			response = append(response, fmt.Sprintf("window.NOMAD_LOG_LEVEL=\"%s\"", cfg.LogLevel))

			var endpointURL string
			if cfg.ProxyAddress != "" {
				endpointURL = fmt.Sprintf("\"%s\"", strings.TrimSuffix(cfg.ProxyAddress, "/"))
			} else {
				endpointURL = "document.location.hostname + ':' + (window.NOMAD_ENDPOINT_PORT || document.location.port)"
			}

			response = append(response, fmt.Sprintf("window.NOMAD_ENDPOINT=%s", endpointURL))

			w.Header().Set("Content-Type", "application/javascript")
			w.Write([]byte(strings.Join(response, "\n")))
			return
		}

		if bs, assetErr := myAssetFS.Open(responseFile); err != nil {
			logger.Errorf("%s: %s", responseFile, assetErr)
		} else {
			http.ServeContent(w, r, responseFile[1:], time.Now(), bs)
		}
	})

	logger.Infof("Listening ...")
	err = http.ListenAndServe(cfg.ListenAddress, router)
	if err != nil {
		logger.Fatal(err)
	}
}
