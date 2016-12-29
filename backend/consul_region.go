package main

import (
	"time"

	"github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
)

// ConsulRegionChannels ...
type ConsulRegionChannels map[string]*ConsulRegionBroadcastChannels

// ConsulRegionClients ...
type ConsulRegionClients map[string]*ConsulRegion

// ConsulService ...
type ConsulService struct {
	Name  string
	Nodes []string
	Tags  []string
}

// ConsulServices ...
type ConsulServices map[string]*ConsulService

// ConsulRegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type ConsulRegionBroadcastChannels struct {
	services observer.Property
}

// ConsulRegion keeps track of the ConsulRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the ConsulRegion server.
type ConsulRegion struct {
	Client            *api.Client
	broadcastChannels *ConsulRegionBroadcastChannels
	regions           []string
	servicesRaw       map[string][]string
	services          *ConsulServices
	serviceChannels   map[string]chan string
}

// CreateConsulRegionClient ...
func CreateConsulRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = waitTime
	config.Datacenter = region
	// config.TLSConfig = &api.TLSConfig{
	// 	CACert:     c.CACert,
	// 	ClientCert: c.ClientCert,
	// 	ClientKey:  c.ClientKey,
	// }

	return api.NewClient(config)
}

// NewConsulRegion configures the Consul API client and initializes the internal state.
func NewConsulRegion(c *Config, client *api.Client, channels *ConsulRegionBroadcastChannels) (*ConsulRegion, error) {
	return &ConsulRegion{
		Client:            client,
		broadcastChannels: channels,
		regions:           make([]string, 0),
		servicesRaw:       make(map[string][]string, 0),
		services:          &ConsulServices{},
		serviceChannels:   make(map[string]chan string, 0),
	}, nil
}

// StartWatchers derp
func (c *ConsulRegion) StartWatchers() {
	go c.watchServices()
}

func (c *ConsulRegion) watchServices() {
	q := &api.QueryOptions{WaitIndex: 1}

	for {
		services, meta, err := c.Client.Catalog().Services(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch services: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Services index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Services index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		for serviceName := range services {
			if _, ok := c.serviceChannels[serviceName]; !ok {
				logger.Infof("Starting detailed monitoring of service: %s", serviceName)

				quitChan := make(chan string, 0)
				c.serviceChannels[serviceName] = quitChan

				go c.watchService(serviceName, quitChan)
			}
		}

		for monitoredServiceName, channel := range c.serviceChannels {
			if _, ok := services[monitoredServiceName]; !ok {
				logger.Infof("Stopping monitoring of service: %s", monitoredServiceName)
				close(channel)
			}
		}

		c.servicesRaw = services
		c.broadcastChannels.services.Update(&Action{Type: fetchedConsulServices, Payload: services, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

func (c *ConsulRegion) watchService(name string, quit chan string) {
	defer delete(c.serviceChannels, name)

	var q *api.QueryOptions
	var remoteWaitIndex uint64
	var localWaitIndex uint64
	WaitTime, _ := time.ParseDuration("60s")

	q = &api.QueryOptions{WaitIndex: 1, WaitTime: WaitTime}

	for {
		select {

		case <-quit:
			return

		default:
			_, meta, err := c.Client.Catalog().Service(name, "", q)
			if err != nil {
				logger.Errorf("watch: unable to fetch services: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex = meta.LastIndex
			localWaitIndex = q.WaitIndex

			// only work if the WaitIndex have changed
			if remoteWaitIndex == localWaitIndex {
				logger.Debugf("Service %s index is unchanged (%d == %d)", name, localWaitIndex, remoteWaitIndex)
				continue
			}

			logger.Debugf("Service %s index is changed (%d <> %d)", name, localWaitIndex, remoteWaitIndex)

			// (*c.services)[name] = &ConsulService{
			// 	Name: name,
			// }

			//c.broadcastChannels.services.Update(&Action{Type: fetchedConsulServices, Payload: services, Index: remoteWaitIndex})
			q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: WaitTime}
		}
	}
}
