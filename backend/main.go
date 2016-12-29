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

// Config for the hashi-ui server
type Config struct {
	ConsulAddress   string
	ListenAddress   string
	LogLevel        string
	NewRelicAppName string
	NewRelicLicense string
	NomadAddress    string
	NomadCACert     string
	NomadClientCert string
	NomadClientKey  string
	NomadReadOnly   bool
	ProxyAddress    string
}

// DefaultConfig is the basic out-of-the-box configuration for hashi-ui
func DefaultConfig() *Config {
	return &Config{
		NomadReadOnly:   false,
		NomadAddress:    "http://127.0.0.1:4646",
		ConsulAddress:   "127.0.0.1:4646",
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

	flagNomadReadOnly = flag.Bool("nomad.read-only", false, "Whether Nomad should be allowed to modify state. "+
		"Overrides the NOMAD_READ_ONLY environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.NomadReadOnly)))

	flagConsulAddress = flag.String("consul.address", "", "The address of the Consul server. "+
		"Overrides the CONSUL_ADDR environment variable if set. "+flagDefault(defaultConfig.ConsulAddress))

	flagNomadAddress = flag.String("nomad.address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+flagDefault(defaultConfig.NomadAddress))

	flagNomadCACert = flag.String("nomad.ca_cert", "", "Path to the Nomad TLS CA Cert File. "+
		"Overrides the NOMAD_CACERT environment variable if set. "+flagDefault(defaultConfig.NomadCACert))

	flagNomadClientCert = flag.String("nomad.client_cert", "", "Path to the Nomad Client Cert File. "+
		"Overrides the NOMAD_CLIENT_CERT environment variable if set. "+flagDefault(defaultConfig.NomadClientCert))

	flagNomadClientKey = flag.String("nomad.client_key", "", "Path to the Nomad Client Key File. "+
		"Overrides the NOMAD_CLIENT_KEY environment variable if set. "+flagDefault(defaultConfig.NomadClientKey))

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

	NomadReadOnly, ok := syscall.Getenv("NOMAD_READ_ONLY")
	if ok {
		c.NomadReadOnly = NomadReadOnly != "0"
	}

	consulAddress, ok := syscall.Getenv("CONSUL_ADDR")
	if ok {
		c.ConsulAddress = consulAddress
	}

	nomadAddress, ok := syscall.Getenv("NOMAD_ADDR")
	if ok {
		c.NomadAddress = nomadAddress
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
		c.NomadCACert = nomadCACert
	}

	nomadClientCert, ok := syscall.Getenv("NOMAD_CLIENT_CERT")
	if ok {
		c.NomadClientCert = nomadClientCert
	}

	nomadClientKey, ok := syscall.Getenv("NOMAD_CLIENT_KEY")
	if ok {
		c.NomadClientKey = nomadClientKey
	}

	// flags

	if *flagConsulAddress != "" {
		c.ConsulAddress = *flagConsulAddress
	}

	if *flagNomadReadOnly {
		c.NomadReadOnly = *flagNomadReadOnly
	}

	if *flagNomadAddress != "" {
		c.NomadAddress = *flagNomadAddress
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
		c.NomadCACert = *flagNomadCACert
	}

	if *flagNomadClientCert != "" {
		c.NomadClientCert = *flagNomadClientCert
	}

	if *flagNomadClientKey != "" {
		c.NomadClientKey = *flagNomadClientKey
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

	if cfg.NomadReadOnly {
		logger.Infof("| nomad.read-only     : %-50s |", "Yes")
	} else {
		logger.Infof("| nomad.read-only     : %-50s |", "No (hashi-ui can change nomad state)")
	}

	logger.Infof("| nomad.address       : %-50s |", cfg.NomadAddress)
	logger.Infof("| nomad.ca_cert       : %-50s |", cfg.NomadCACert)
	logger.Infof("| nomad.client_cert   : %-50s |", cfg.NomadClientCert)
	logger.Infof("| nomad.client_key    : %-50s |", cfg.NomadClientKey)
	logger.Infof("| web.listen-address  : http://%-43s |", cfg.ListenAddress)
	logger.Infof("| web.proxy-address   : %-50s |", cfg.ProxyAddress)
	logger.Infof("| log.level           : %-50s |", cfg.LogLevel)

	if cfg.NewRelicAppName != "" && cfg.NewRelicLicense != "" {
		logger.Infof("| newrelic.app_name   : %-50s |", cfg.NewRelicAppName)
		logger.Infof("| newrelic.license    : %-50s |", strings.Repeat("*", len(cfg.NewRelicLicense)))
	}

	logger.Infof("----------------------------------------------------------------------------")
	logger.Infof("")

	myAssetFS := assetFS()
	router := mux.NewRouter()

	nomadHub, success := InitializeNomad(cfg)
	if success {
		logger.Infof("Nomad client successfully initialized")

		router.HandleFunc("/ws/nomad", nomadHub.Handler)
		router.HandleFunc("/ws/nomad/{region}", nomadHub.Handler)
		router.HandleFunc("/nomad/{region}/download/{path:.*}", nomadHub.downloadFile)
	} else {
		logger.Errorf("")
		logger.Errorf("Failed to start Nomad hub, please check your configuration")
		logger.Errorf("")
	}

	consulHub, success := InitializeConsul(cfg)
	if success {
		logger.Infof("Consul client successfully initialized")

		router.HandleFunc("/ws/consul", consulHub.Handler)
		router.HandleFunc("/ws/consul/{region}", consulHub.Handler)
	} else {
		logger.Errorf("")
		logger.Errorf("Failed to start Consul hub, please check your configuration")
		logger.Errorf("")
	}

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
			response = append(response, fmt.Sprintf("window.NOMAD_READ_ONLY=%s", strconv.FormatBool(cfg.NomadReadOnly)))
			response = append(response, fmt.Sprintf("window.NOMAD_ADDR=\"%s\"", cfg.NomadAddress))
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
