import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import AllocationList from "../AllocationList/AllocationList"

const EvaluationAllocations = ({ allocations, evaluation, nodes }) => {
  const allocs = allocations.filter(allocation => allocation.EvalID === evaluation.ID)

  return <AllocationList allocations={allocs} nodes={nodes} nested />
}

function mapStateToProps({ evaluation, allocations, nodes }) {
  return { evaluation, allocations, nodes }
}

EvaluationAllocations.propTypes = {
  allocations: PropTypes.array.isRequired,
  evaluation: PropTypes.object.isRequired,
  nodes: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(EvaluationAllocations)
