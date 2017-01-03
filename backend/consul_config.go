package main

import (
	"flag"
	"strconv"
	"syscall"
)

var (
	flagConsulEnable = flag.Bool("consul.enable", false, "Whether Consul engine should be started. "+
		"Overrides the CONSUL_ENABLE environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.ConsulEnable)))

	flagConsulReadOnly = flag.Bool("consul.read-only", false, "Whether Hashi-UI should be allowed to modify Consul state. "+
		"Overrides the CONSUL_READ_ONLY environment variable if set. "+flagDefault(strconv.FormatBool(defaultConfig.ConsulEnable)))

	flagConsulAddress = flag.String("consul.address", "", "The address of the Consul server. "+
		"Overrides the CONSUL_ADDR environment variable if set. "+flagDefault(defaultConfig.ConsulAddress))
)

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
}
