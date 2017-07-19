import React, { PropTypes } from "react"
import { Link, withRouter } from "react-router"
import { default as shortenUUID } from "../../helpers/uuid"

const EvaluationLink = ({ children, evaluationId, linkAppend, shortUUID, router }) => {
  let innerChildren = children

  if (children === undefined) {
    innerChildren = shortUUID ? shortenUUID(evaluationId) : evaluationId
  }

  return (
    <Link
      to={{
        pathname: `/nomad/${router.params.region}/evaluations/${evaluationId}${linkAppend}`,
      }}
    >
      {innerChildren}
    </Link>
  )
}

EvaluationLink.defaultProps = {
  linkAppend: "",
  shortUUID: true,
}

EvaluationLink.propTypes = {
  children: PropTypes.array,
  evaluationId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.boolean.isRequired,
  router: PropTypes.object.isRequired,
}

export default withRouter(EvaluationLink)
