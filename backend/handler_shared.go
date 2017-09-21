package main

import (
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/jippi/hashi-ui/backend/structs"
	log "github.com/sirupsen/logrus"
)

var websocketUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func sendAction(socket *websocket.Conn, action *structs.Action, logger *log.Entry) {
	if err := socket.WriteJSON(action); err != nil {
		logger.Errorf(" %s", err)
	}
}
