import React, { PureComponent, PropTypes } from 'react'
import { Table, Column, Cell } from 'fixed-data-table-2';
import { Card, CardText } from 'material-ui/Card'
import EvaluationLink from '../EvaluationLink/EvaluationLink'
import JobLink from '../JobLink/JobLink'

/* eslint-disable react/prop-types */

const TextCell = ({ rowIndex, data, col, ...props }) => (
  <Cell { ...props }>
    { data[rowIndex][col] }
  </Cell>
);

const JobLinkCell = ({ rowIndex, data, ...props }) => (
  <Cell { ...props }>
    <JobLink jobId={ data[rowIndex].JobID } />
  </Cell>
);

const EvaluationLinkCell = ({ rowIndex, data, col, ...props }) => (
  <Cell { ...props }>
    <EvaluationLink evaluationId={ data[rowIndex][col] } />
  </Cell>
);

/* eslint-disable react/prop-types */

class EvaluationList extends PureComponent {

  updateDimensions() {
    this.setState({
      ...this.state,
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.updateDimensions());
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateDimensions());
  }

  render() {
    const evaluations = this.props.evaluations;
    const width = this.state.width - 30
    let height = this.state.height - 170

    if (this.props.nested) {
      height = height - 120
    }

    if (height < 300) {
      height = 300
    }

    return (
      <Card>
        <CardText>
          <Table
            rowHeight={ 35 }
            headerHeight={ 35 }
            rowsCount={ evaluations.length }
            height={ height }
            width={ width }
            touchScrollEnabled
            { ...this.props }
          >
            <Column
              header={ <Cell>ID</Cell> }
              cell={ <EvaluationLinkCell data={ evaluations } col='ID' /> }
              width={ 150 }
            />
            <Column
              header={ <Cell>Job</Cell> }
              cell={ <JobLinkCell data={ evaluations } /> }
              flexGrow={ 2 }
              width={ 200 }
            />
            <Column
              header={ <Cell>Type</Cell> }
              cell={ <TextCell data={ evaluations } col='Type' /> }
              width={ 150 }
            />
            <Column
              header={ <Cell>Priority</Cell> }
              cell={ <TextCell data={ evaluations } col='Priority' /> }
              width={ 150 }
            />
            <Column
              header={ <Cell>Status</Cell> }
              cell={ <TextCell data={ evaluations } col='Status' /> }
              width={ 150 }
            />
            <Column
              header={ <Cell>Status Description</Cell> }
              cell={ <TextCell data={ evaluations } col='StatusDescription' /> }
              flexGrow={ 2 }
              width={ 150 }
            />
            <Column
              header={ <Cell>Parent</Cell> }
              cell={ <EvaluationLinkCell data={ evaluations } col='PreviousEval' /> }
              width={ 150 }
            />
            <Column
              header={ <Cell>Triggered by</Cell> }
              cell={ <TextCell data={ evaluations } col='TriggeredBy' /> }
              width={ 150 }
            />
          </Table>
        </CardText>
      </Card>
    )
  }
}

EvaluationList.defaultProps = {
  evaluations: [],
  nested: false,
}

EvaluationList.propTypes = {
  evaluations: PropTypes.array.isRequired,
  nested: PropTypes.bool.isRequired,
}

export default EvaluationList
