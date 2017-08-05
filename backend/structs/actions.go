package structs

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Index   uint64
	Payload interface{}
}

const (
	KeepAlive           = "INTERNAL_KEEP_ALIVE"
	ErrorNotification   = "ERROR_NOTIFICATION"
	SuccessNotification = "SUCCESS_NOTIFICATION"
)
