package main

import (
	"encoding/json"
	"net/http"

	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
)

// StatusHandler establishes the websocket connection and calls the connection handler.
func StatusHandler(cfg *config.Config, nomadClient *nomad.Client, consulClient *consul.Client) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var healthy *bool

		status := struct {
			Healty *bool
			Consul map[string]interface{}
			Nomad  map[string]interface{}
		}{
			Consul: make(map[string]interface{}),
			Nomad:  make(map[string]interface{}),
		}

		healthy = newBool(true)
		if nomadClient != nil {
			leader, err := nomadClient.Status().Leader()
			status.Nomad["enabled"] = true
			status.Nomad["status"] = struct {
				Leader string
				Error  error
			}{leader, err}

			if err != nil {
				healthy = newBool(false)
			}
		} else {
			status.Nomad["enabled"] = false
		}

		if consulClient != nil {
			leader, err := consulClient.Status().Leader()
			status.Consul["enabled"] = true
			status.Consul["status"] = struct {
				Leader string
				Error  error
			}{leader, err}

			if err != nil {
				healthy = newBool(false)
			} else if healthy != nil {
				healthy = newBool(*healthy && true)
			}
		} else {
			status.Consul["enabled"] = false
		}

		status.Healty = healthy
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		if *healthy {
			w.WriteHeader(http.StatusOK)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}

		json.NewEncoder(w).Encode(status)
	}
}

func newBool(b bool) *bool {
	return &b
}
