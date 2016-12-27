import React, { PureComponent, PropTypes } from 'react'
import { Link } from 'react-router'
import shortUUID from '../../helpers/uuid'

class EvaluationLink extends PureComponent {

  render () {
    const evaluationId = this.props.evaluationId
    let linkAppend = this.props.linkAppend
    let children = this.props.children

    if (children === undefined) {
      children = this.props.shortUUID ? shortUUID(evaluationId) : evaluationId
    }

    return <Link to={{ pathname: `/nomad/evaluations/${evaluationId}${linkAppend}` }}>{ children }</Link>
  }
}

EvaluationLink.defaultProps = {
  linkAppend: '',
  shortUUID: true
}

EvaluationLink.propTypes = {
  children: PropTypes.array,
  evaluationId: PropTypes.string.isRequired,
  linkAppend: PropTypes.string,
  shortUUID: PropTypes.boolean.isRequired
}

export default EvaluationLink
