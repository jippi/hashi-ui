import { createHistory } from "history"
import { useRouterHistory } from "react-router"

const browserHistory = useRouterHistory(createHistory)({
  basename: HASHI_ASSETS_ROOT
})

export default browserHistory
