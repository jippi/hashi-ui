package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	nomad_helper "github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

type httpSocket struct {
	w      http.ResponseWriter
	r      *http.Request
	ch     chan structs.Action
	cc     <-chan bool
	qc     chan error
	logger *log.Entry
}

func NewHTTPSocket(w http.ResponseWriter, r *http.Request, logger *log.Entry) *httpSocket {
	socket := &httpSocket{
		w:      w,
		r:      r,
		cc:     w.(http.CloseNotifier).CloseNotify(),
		qc:     make(chan error, 1),
		logger: logger,
	}

	return socket
}

func (hs *httpSocket) drain() error {
	body, err := ioutil.ReadAll(hs.r.Body)
	if err != nil {
		return err
	}

	res := make([]structs.Action, 0)

	if strings.HasPrefix(string(body), "[") { // list of actions
		if err := json.Unmarshal(body, &res); err != nil {
			return err
		}
	} else if strings.HasPrefix(string(body), "{") { // a single action
		var action structs.Action
		if err := json.Unmarshal(body, &action); err != nil {
			return err
		}
		res = append(res, action)
	} else { // invalid JSON payload
		return fmt.Errorf("invalid JSON payload")
	}

	hs.ch = make(chan structs.Action, len(res))
	for _, action := range res {
		hs.ch <- action
	}

	return nil
}

func (hs *httpSocket) Close() error {
	hs.logger.Debugf("Calling fake Close() on httpSocket")
	return nil
}

func (hs *httpSocket) stop(err error) {
	if err != nil {
		http.Error(hs.w, err.Error(), http.StatusInternalServerError)
	} else {
		err = fmt.Errorf("connection complete")
	}

	hs.qc <- err
	hs.logger.Debugf("sent stop signal")
}

func (hs *httpSocket) WriteMessage(messageType int, data []byte) error {
	_, err := hs.w.Write(data)
	hs.stop(nil)
	return err
}

func (hs *httpSocket) WriteJSON(v interface{}) error {
	payload, err := json.Marshal(v)
	if err != nil {
		return err
	}

	return hs.WriteMessage(0, payload)
}

func (hs *httpSocket) ReadJSON(v interface{}) error {
	select {
	case <-hs.cc:
		return fmt.Errorf("client disconnect")

	case err := <-hs.qc:
		return err

	case msg := <-hs.ch:
		x := v.(*structs.Action)

		x.Type = msg.Type
		x.Payload = msg.Payload
		x.Index = msg.Index
	}

	return nil
}

// NomadAPIHandler establishes the websocket connection and calls the connection handler.
func NomadAPIHandler(cfg *config.Config, nomadClient *nomad.Client, consulClient *consul.Client) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		connectionID := uuid.NewV4()
		logger := log.WithField("connection_id", connectionID.String()[:8])
		logger.Debugf("transport: connection created")

		params := mux.Vars(r)
		region, _ := params["region"]

		socket := NewHTTPSocket(w, r, logger.WithField("source", "socket"))
		if err := socket.drain(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			logger.Errorf("transport: %s", err)
			return
		}
		defer socket.Close()

		client, _ := nomad_helper.NewRegionClient(cfg, region)
		c := NewConnection(socket, client, consulClient, logger.WithField("source", "connection"), connectionID, cfg)
		c.Handle()

		logger.Debugf("connection ended")
	}
}
