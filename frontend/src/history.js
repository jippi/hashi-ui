import { createHistory } from 'history'
import { useRouterHistory } from 'react-router'

const browserHistory = useRouterHistory(createHistory)({
  // attempt to remove host+port from NOMAD_ENDPOINT
  // long term this could be done by splitting on "/" and take chunk "1..."
  basename: window['NOMAD_ENDPOINT'].replace(/^[-.a-zA-Z0-9]+:?[0-9]*/, '')
})

export default browserHistory