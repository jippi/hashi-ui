package config

import (
	"flag"
	"fmt"
        "os"
	"strconv"
	"syscall"
)

var (
	defaultConfig = DefaultConfig()

	flagNomadEnable = flag.Bool("nomad-enable", false, "Whether Nomad engine should be started. "+
		"Overrides the NOMAD_ENABLE environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.NomadEnable)))

	flagNomadSkipVerify = flag.Bool("nomad-skip-verify", false, "Whether Hashi-UI should skip TLS verification, not recommended. "+
		"Overrides the NOMAD_SKIP_VERIFY environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.NomadSkipVerify)))

	flagNomadReadOnly = flag.Bool("nomad-read-only", false, "Whether Hashi-UI should be allowed to modify Nomad state. "+
		"Overrides the NOMAD_READ_ONLY environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.NomadReadOnly)))

	flagNomadAddress = flag.String("nomad-address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+FlagDefault(defaultConfig.NomadAddress))

	flagNomadCACert = flag.String("nomad-ca-cert", "", "Path to the Nomad TLS CA Cert File. "+
		"Overrides the NOMAD_CACERT environment variable if set. "+FlagDefault(defaultConfig.NomadCACert))

	flagNomadClientCert = flag.String("nomad-client-cert", "", "Path to the Nomad Client Cert File. "+
		"Overrides the NOMAD_CLIENT_CERT environment variable if set. "+FlagDefault(defaultConfig.NomadClientCert))

	flagNomadClientKey = flag.String("nomad-client-key", "", "Path to the Nomad Client Key File. "+
		"Overrides the NOMAD_CLIENT_KEY environment variable if set. "+FlagDefault(defaultConfig.NomadClientKey))

	flagNomadHideEnvData = flag.Bool("nomad-hide-env-data", false, "Whether Nomad env{} values should be hidden (will prevent updating jobs in the UI)"+FlagDefault(strconv.FormatBool(defaultConfig.NomadHideEnvData)))

	flagNomadHideEmbeddedTmpl = flag.Bool("nomad-hide-embedded-tmpl", false, "Whether Nomad EmbeddedTmpl should be hidden"+FlagDefault(strconv.FormatBool(defaultConfig.NomadHideEmbeddedTmpl)))

	flagNomadAllowStale = flag.Bool("nomad-allow-stale", true, "Whether Hashi-UI should use stale mode when connecting to the nomad-api servers"+
		"Overrides the NOMAD_ALLOW_STALE environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.NomadAllowStale)))

	flagConsulEnable = flag.Bool("consul-enable", false, "Whether Consul engine should be started. "+
		"Overrides the CONSUL_ENABLE environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.ConsulEnable)))

	flagConsulReadOnly = flag.Bool("consul-read-only", false, "Whether Hashi-UI should be allowed to modify Consul state. "+
		"Overrides the CONSUL_READ_ONLY environment variable if set. "+FlagDefault(strconv.FormatBool(defaultConfig.ConsulEnable)))

	flagConsulAddress = flag.String("consul-address", "", "The address of the Consul server. "+
		"Overrides the CONSUL_ADDR environment variable if set. "+FlagDefault(defaultConfig.ConsulAddress))

	flagConsulACLToken = flag.String("consul.acl-token", "", "A ACL token to use when talking to Consul. "+
		"Overrides the CONSUL_ACL_TOKEN environment variable if set. "+FlagDefault(defaultConfig.ConsulACLToken))

	flagLogLevel = flag.String("log-level", "",
		"The log level for hashi-ui to run under. "+FlagDefault(defaultConfig.LogLevel))

	flagProxyAddress = flag.String("proxy-address", "",
		"The address used on an external proxy (exmaple: example.com/nomad) "+FlagDefault(defaultConfig.ProxyAddress))

	flagListenAddress = flag.String("listen-address", "",
		"The address on which to expose the web interface. "+FlagDefault(defaultConfig.ListenAddress))

	flagHttpsEnable = flag.Bool("https-enable", false,
		"Use https protocol instead. "+FlagDefault(strconv.FormatBool(defaultConfig.HttpsEnable)))

	flagServerCert = flag.String("server-cert", "",
		"Server certificate to use when https protocol is enabled. "+FlagDefault(defaultConfig.ServerCert))

	flagServerKey = flag.String("server-key", "",
		"Server key to use when https protocol is enabled. "+FlagDefault(defaultConfig.ServerKey))

	flagNewRelicAppName = flag.String("newrelic-app-name", "hashi-ui",
		"The NewRelic app name. "+FlagDefault(defaultConfig.NewRelicAppName))

	flagNewRelicLicense = flag.String("newrelic-license", "",
		"The NewRelic license key. "+FlagDefault(defaultConfig.NewRelicLicense))
)

// Config for the hashi-ui server
type Config struct {
	LogLevel      string
	ProxyAddress  string
	ListenAddress string
	HttpsEnable   bool
	ServerCert    string
	ServerKey     string

	NewRelicAppName string
	NewRelicLicense string

	NomadEnable           bool
	NomadAddress          string
	NomadCACert           string
	NomadClientCert       string
	NomadClientKey        string
	NomadReadOnly         bool
	NomadSkipVerify       bool
	NomadHideEnvData      bool
	NomadHideEmbeddedTmpl bool
	NomadAllowStale       bool

	ConsulEnable   bool
	ConsulReadOnly bool
	ConsulAddress  string
	ConsulACLToken string
}

// Parse the env and cli flags and store the outcome in a Config struct
func (c *Config) Parse() {
	flag.Parse()

	ParseAppFlagConfig(c)
	ParseAppEnvConfig(c)

	ParseNomadFlagConfig(c)
	ParseNomadEnvConfig(c)

	ParseConsulFlagConfig(c)
	ParseConsulEnvConfig(c)

	ParseNewRelicConfig(c)
}

// DefaultConfig is the basic out-of-the-box configuration for hashi-ui
func DefaultConfig() *Config {
	return &Config{
		LogLevel:      "info",
		ListenAddress: "0.0.0.0:3000",
		HttpsEnable:   false,

		NewRelicAppName: "hashi-ui",

		NomadReadOnly:         false,
		NomadAddress:          "http://127.0.0.1:4646",
		NomadHideEnvData:      false,
		NomadHideEmbeddedTmpl: false,

		ConsulReadOnly: false,
		ConsulAddress:  "127.0.0.1:8500",
	}
}

func FlagDefault(value string) string {
	return fmt.Sprintf("(default: \"%s\")", value)
}

// ParseAppEnvConfig ...
func ParseAppEnvConfig(c *Config) {
	logLevel, ok := syscall.Getenv("LOG_LEVEL")
	if ok {
		c.LogLevel = logLevel
	}

	proxyAddress, ok := syscall.Getenv("PROXY_ADDRESS")
	if ok {
		c.ProxyAddress = proxyAddress
	}

	listenAddress, ok := syscall.Getenv("LISTEN_ADDRESS")
	if ok {
		c.ListenAddress = listenAddress
	}

	httpsEnable, ok := syscall.Getenv("HTTPS_ENABLE")
	if ok {
		c.HttpsEnable = httpsEnable != "0"
	}

	serverCert, ok := syscall.Getenv("SERVER_CERT")
	if ok {
		c.ServerCert = serverCert
	}

	serverKey, ok := syscall.Getenv("SERVER_KEY")
	if ok {
		c.ServerKey = serverKey
	}
}

// ParseAppFlagConfig ...
func ParseAppFlagConfig(c *Config) {
	if *flagLogLevel != "" {
		c.LogLevel = *flagLogLevel
	}

	if *flagListenAddress != "" {
		c.ListenAddress = *flagListenAddress
	}

	if *flagProxyAddress != "" {
		c.ProxyAddress = *flagProxyAddress
	}

	if *flagHttpsEnable {
		c.HttpsEnable = *flagHttpsEnable
	}

	if *flagServerCert != "" {
		c.ServerCert = *flagServerCert
	}

	if *flagServerKey != "" {
		c.ServerKey = *flagServerKey
	}

}

// ParseNewRelicConfig ...
func ParseNewRelicConfig(c *Config) {
	// env
	newRelicAppName, ok := syscall.Getenv("NEWRELIC_APP_NAME")
	if ok {
		c.NewRelicAppName = newRelicAppName
	}

	newRelicLicense, ok := syscall.Getenv("NEWRELIC_LICENSE")
	if ok {
		c.NewRelicLicense = newRelicLicense
	}

	// flags
	if *flagNewRelicAppName != "" {
		c.NewRelicAppName = *flagNewRelicAppName
	}

	if *flagNewRelicLicense != "" {
		c.NewRelicLicense = *flagNewRelicLicense
	}
}

// ParseNomadEnvConfig ...
func ParseNomadEnvConfig(c *Config) {
	nomadEnable, ok := syscall.Getenv("NOMAD_ENABLE")
	if ok {
		c.NomadEnable = nomadEnable != "0"
	}

	nomadReadOnly, ok := syscall.Getenv("NOMAD_READ_ONLY")
	if ok {
		c.NomadReadOnly = nomadReadOnly != "0"
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
	nomadSkipVerify, ok := syscall.Getenv("NOMAD_SKIP_VERIFY")
	if ok {
		c.NomadSkipVerify = nomadSkipVerify != "false"
	}
	hideEnvData, ok := syscall.Getenv("NOMAD_HIDE_ENV_DATA")
	if ok {
		c.NomadHideEnvData = hideEnvData != "false"
	}
	hideEmbeddedTmpl := os.Getenv("NOMAD_HIDE_EMBEDDED_TMPL")
	if hideEmbeddedTmpl != "" {
		hideEmbeddedTmplBool, err := strconv.ParseBool(hideEmbeddedTmpl)
		if err == nil {
			c.NomadHideEmbeddedTmpl = hideEmbeddedTmplBool
		}
	}
	nomadAllowStale, ok := syscall.Getenv("NOMAD_ALLOW_STALE")
	if ok {
		c.NomadAllowStale = nomadAllowStale != "true"
	}
}

// ParseNomadFlagConfig ...
func ParseNomadFlagConfig(c *Config) {
	if *flagNomadEnable {
		c.NomadEnable = *flagNomadEnable
	}

	if *flagNomadSkipVerify {
		c.NomadSkipVerify = *flagNomadSkipVerify
	}

	if *flagNomadReadOnly {
		c.NomadReadOnly = *flagNomadReadOnly
	}

	if *flagNomadHideEnvData {
		c.NomadHideEnvData = *flagNomadHideEnvData
	}

	if *flagNomadHideEmbeddedTmpl {
		c.NomadHideEmbeddedTmpl = *flagNomadHideEmbeddedTmpl
	}

	if *flagNomadAddress != "" {
		c.NomadAddress = *flagNomadAddress
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

	if *flagNomadAllowStale {
		c.NomadAllowStale = *flagNomadAllowStale
	}
}

// ParseConsulEnvConfig ...
func ParseConsulEnvConfig(c *Config) {
	consulEnable, ok := syscall.Getenv("CONSUL_ENABLE")
	if ok {
		c.ConsulEnable = consulEnable != "0"
	}

	consulReadOnly, ok := syscall.Getenv("CONSUL_READ_ONLY")
	if ok {
		c.ConsulReadOnly = consulReadOnly != "0"
	}

	consulAddress, ok := syscall.Getenv("CONSUL_ADDR")
	if ok {
		c.ConsulAddress = consulAddress
	}

	aclToken, ok := syscall.Getenv("CONSUL_ACL_TOKEN")
	if ok {
		c.ConsulACLToken = aclToken
	}
}

// ParseConsulFlagConfig ...
func ParseConsulFlagConfig(c *Config) {
	if *flagConsulEnable {
		c.ConsulEnable = *flagConsulEnable
	}

	if *flagConsulReadOnly {
		c.ConsulReadOnly = *flagConsulReadOnly
	}

	if *flagConsulAddress != "" {
		c.ConsulAddress = *flagConsulAddress
	}

	if *flagConsulACLToken != "" {
		c.ConsulACLToken = *flagConsulACLToken
	}
}
