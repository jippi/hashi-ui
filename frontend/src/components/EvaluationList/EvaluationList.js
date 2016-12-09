import React, { PropTypes } from 'react'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from '../Table'
import { Card, CardText } from 'material-ui/Card'
import EvaluationLink from '../EvaluationLink/EvaluationLink'
import JobLink from '../JobLink/JobLink'

const EvaluationList = ({ evaluations }) =>
  <Card>
    <CardText>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={{ width: 150 }}>ID</TableHeaderColumn>
            <TableHeaderColumn>Job</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 150 }}>Type</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 150 }}>Priority</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 150 }}>Status</TableHeaderColumn>
            <TableHeaderColumn>Status Description</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 150 }}>Parent</TableHeaderColumn>
            <TableHeaderColumn style={{ width: 150 }}>Triggered by</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          { evaluations.map(evaluation =>
            <TableRow key={ evaluation.ID }>
              <TableRowColumn><EvaluationLink evaluationId={ evaluation.ID } /></TableRowColumn>
              <TableRowColumn><JobLink jobId={ evaluation.JobID } /></TableRowColumn>
              <TableRowColumn>{ evaluation.Type }</TableRowColumn>
              <TableRowColumn>{ evaluation.Priority }</TableRowColumn>
              <TableRowColumn>{ evaluation.Status }</TableRowColumn>
              <TableRowColumn>{ evaluation.StatusDescription }</TableRowColumn>
              <TableRowColumn><EvaluationLink evaluationId={ evaluation.PreviousEval } /></TableRowColumn>
              <TableRowColumn>{ evaluation.TriggeredBy }</TableRowColumn>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CardText>
  </Card>

EvaluationList.defaultProps = {
  evaluations: []
}

EvaluationList.propTypes = {
  evaluations: PropTypes.array.isRequired
}

export default EvaluationList
