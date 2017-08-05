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
	ErrorNotification   = "APP_ERROR_NOTIFICATION"
	SuccessNotification = "APP_SUCCESS_NOTIFICATION"
)
