import { createHistory } from "history"
import { useRouterHistory } from "react-router"

const getBasename = function() {
  const parser = document.createElement("a")
  parser.href = window.HASHI_ENDPOINT
  return parser.pathname !== "/" ? parser.pathname : ""
}

const browserHistory = useRouterHistory(createHistory)({
  basename: getBasename()
})

export default browserHistory
