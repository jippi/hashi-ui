package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	broadcast := make(chan *Action)

	nomadAddr := os.Getenv("NOMAD_ADDR")
	if nomadAddr == "" {
		log.Fatalf("Please provide NOMAD_ADDR in the environment, which points to the Nomad server.")
	}
	nomadPort := os.Getenv("NOMAD_PORT")
	if nomadPort == "" {
		nomadPort = "4646"
	}
	nomad := NewNomad(fmt.Sprintf("http://%s:%s", nomadAddr, nomadPort), broadcast)
	go nomad.watchAllocs()
	go nomad.watchEvals()
	go nomad.watchNodes()
	go nomad.watchJobs()

	hub := NewHub(nomad, broadcast)
	go hub.Run()

	router.HandleFunc("/ws", hub.Handler)
	router.PathPrefix("/").Handler(http.FileServer(assetFS()))

	log.Println("Starting server...")
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}
