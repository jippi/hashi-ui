package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	broadcast := make(chan *Action)

	nomad := NewNomad("http://192.168.250.100:4646", broadcast)
	go nomad.watchAllocs()
	go nomad.watchEvals()
	go nomad.watchNodes()
	go nomad.watchJobs()

	hub := NewHub(nomad, broadcast)
	go hub.Run()

	router.HandleFunc("/ws", hub.Handler)
	// router.PathPrefix("/").Handler(http.FileServer(assetFS()))

	log.Println("Starting server...")
	log.Fatal(http.ListenAndServe(":6464", router))
}
