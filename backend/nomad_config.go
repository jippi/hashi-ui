package main

import (
	"flag"
	"fmt"
	"strconv"
	"syscall"
)

var (
	flagNomadEnable = flag.Bool("nomad-enable", false, "Whether Nomad engine should be started. "+
		"Overrides the NOMAD_ENABLE environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.NomadEnable)))

	flagNomadReadOnly = flag.Bool("nomad-read-only", false, "Whether Hashi-UI should be allowed to modify Nomad state. "+
		"Overrides the NOMAD_READ_ONLY environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.NomadReadOnly)))

	flagNomadAddress = flag.String("nomad-address", "", "The address of the Nomad server. "+
		"Overrides the NOMAD_ADDR environment variable if set. "+flagDefault(defaultConfig.NomadAddress))

	flagNomadCACert = flag.String("nomad-ca-cert", "", "Path to the Nomad TLS CA Cert File. "+
		"Overrides the NOMAD_CACERT environment variable if set. "+flagDefault(defaultConfig.NomadCACert))

	flagNomadClientCert = flag.String("nomad-client-cert", "", "Path to the Nomad Client Cert File. "+
		"Overrides the NOMAD_CLIENT_CERT environment variable if set. "+flagDefault(defaultConfig.NomadClientCert))

	flagNomadClientKey = flag.String("nomad-client-key", "", "Path to the Nomad Client Key File. "+
		"Overrides the NOMAD_CLIENT_KEY environment variable if set. "+flagDefault(defaultConfig.NomadClientKey))
)

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
}

// ParseNomadFlagConfig ...
func ParseNomadFlagConfig(c *Config) {
	if *flagNomadEnable {
		c.NomadEnable = *flagNomadEnable
	}

	if *flagNomadReadOnly {
		c.NomadReadOnly = *flagNomadReadOnly
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
}
