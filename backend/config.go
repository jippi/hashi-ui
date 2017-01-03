package main

import (
	"flag"
	"fmt"
	"syscall"
)

var (
	flagLogLevel = flag.String("log-level", "",
		"The log level for hashi-ui to run under. "+flagDefault(defaultConfig.LogLevel))

	flagProxyAddress = flag.String("proxy-address", "",
		"The address used on an external proxy (exmaple: example.com/nomad) "+flagDefault(defaultConfig.ProxyAddress))

	flagListenAddress = flag.String("listen-address", "",
		"The address on which to expose the web interface. "+flagDefault(defaultConfig.ListenAddress))

	flagNewRelicAppName = flag.String("newrelic.app_name", "hashi-ui",
		"The NewRelic app name. "+flagDefault(defaultConfig.NewRelicAppName))

	flagNewRelicLicense = flag.String("newrelic.license", "",
		"The NewRelic license key. "+flagDefault(defaultConfig.NewRelicLicense))
)

// Config for the hashi-ui server
type Config struct {
	LogLevel      string
	ProxyAddress  string
	ListenAddress string

	NewRelicAppName string
	NewRelicLicense string

	NomadEnable     bool
	NomadAddress    string
	NomadCACert     string
	NomadClientCert string
	NomadClientKey  string
	NomadReadOnly   bool

	ConsulEnable   bool
	ConsulReadOnly bool
	ConsulAddress  string
}

// DefaultConfig is the basic out-of-the-box configuration for hashi-ui
func DefaultConfig() *Config {
	return &Config{
		LogLevel:      "info",
		ListenAddress: "0.0.0.0:3000",

		NewRelicAppName: "hashi-ui",

		NomadReadOnly: false,
		NomadAddress:  "http://127.0.0.1:4646",

		ConsulReadOnly: false,
		ConsulAddress:  "127.0.0.1:8500",
	}
}

func flagDefault(value string) string {
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
