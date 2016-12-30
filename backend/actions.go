package main

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Index   uint64
	Payload interface{}
}

const (
	errorNotification   = "ERROR_NOTIFICATION"
	successNotification = "SUCCESS_NOTIFICATION"
)
