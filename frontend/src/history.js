import { createHistory } from "history"
import { useRouterHistory } from "react-router"

const trimSlash = s => (s.endsWith("/") ? s.substr(0, s.length - 1) : s)

const browserHistory = useRouterHistory(createHistory)({
  basename: trimSlash(HASHI_PATH_PREFIX)
})

export default browserHistory
