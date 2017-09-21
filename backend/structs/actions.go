package structs

import (
	"fmt"
)

const (
	KeepAlive           = "INTERNAL_KEEP_ALIVE"
	ErrorNotification   = "APP_ERROR_NOTIFICATION"
	SuccessNotification = "APP_SUCCESS_NOTIFICATION"
)

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Index   uint64
	Payload interface{}
}

// Responser interface
type Responser interface {
	Actions() []*Action
}

// Response implementation
type Response struct {
	actions []*Action
}

// Actions will return all actions buffered in the response
func (r *Response) Actions() []*Action {
	return r.actions
}

// Add will append a new action to the response
func (r *Response) Add(action *Action) {
	r.actions = append(r.actions, action)
}

// AddError will append a new error action to the response
func (r *Response) AddError(payload interface{}) {
	r.Add(&Action{Type: ErrorNotification, Payload: payload})
}

// AddSuccess will append a new success action to the response
func (r *Response) AddSuccess(payload interface{}) {
	r.Add(&Action{Type: SuccessNotification, Payload: payload})
}

// NewResponse will create a new Response instance
func NewResponse(kind string, payload interface{}) *Response {
	response := &Response{}
	response.Add(&Action{Type: kind, Payload: payload})

	return response
}

// NewResultWithIndex will create a new response with an action with Index value
func NewResultWithIndex(kind string, payload interface{}, index uint64) *Response {
	response := &Response{}
	response.Add(&Action{Type: kind, Payload: payload, Index: index})

	return response
}

// NewErrorResponse will return a Response with error message attached
func NewErrorResponse(msg interface{}, data ...interface{}) (*Response, error) {
	var message string

	switch msg.(type) {
	case string:
		message = msg.(string)
	case error:
		message = msg.(error).Error()
	default:
		panic(fmt.Sprintf("Unknown type %T for ErrorResponse", message))
	}

	return nil, fmt.Errorf(message, data...)
}

// NewSuccessResponse will return a new Response with a Success message attached and no error
func NewSuccessResponse(msg string, data ...interface{}) (*Response, error) {
	response := &Response{}
	response.AddSuccess(fmt.Sprintf(msg, data...))

	return response, nil
}
