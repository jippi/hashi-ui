import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { withRouter } from "react-router"
import { Table, Column, Cell } from "fixed-data-table-2"
import { Grid, Row, Col } from "react-flexbox-grid"
import { Card, CardText } from "material-ui/Card"
import SelectField from "material-ui/SelectField"
import MenuItem from "material-ui/MenuItem"
import FilterFreetext from "../FilterFreetext/FilterFreetext"
import JobTypeFilter from "../JobTypeFilter/JobTypeFilter"
import EvaluationLink from "../EvaluationLink/EvaluationLink"
import JobLink from "../JobLink/JobLink"
import DeploymentLink from "../DeploymentLink/DeploymentLink"

/* eslint-disable react/prop-types */

const TextCell = ({ rowIndex, data, col, ...props }) => <Cell {...props}>{data[rowIndex][col]}</Cell>

const JobLinkCell = ({ rowIndex, data, ...props }) => (
  <Cell {...props}>
    <JobLink jobId={data[rowIndex].JobID} />
  </Cell>
)

const EvaluationLinkCell = ({ rowIndex, data, col, ...props }) => (
  <Cell {...props}>
    <EvaluationLink evaluationId={data[rowIndex][col]} />
  </Cell>
)

const DeploymentLinkCell = ({ rowIndex, data, col, ...props }) => (
  <Cell {...props}>
    <DeploymentLink deploymentId={data[rowIndex][col]} />
  </Cell>
)

/* eslint-disable react/prop-types */

class EvaluationList extends PureComponent {
  updateDimensions() {
    this.setState({
      ...this.state,
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener("resize", () => this.updateDimensions())
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.updateDimensions())
  }

  filtered() {
    const query = this.props.location.query || {}
    let evaluations = this.props.evaluations

    if ("job" in query) {
      evaluations = evaluations.filter(evaluation => evaluation.JobID.indexOf(query.job) != -1)
    }

    if ("id" in query) {
      evaluations = evaluations.filter(evaluation => evaluation.ID.indexOf(query.id) != -1)
    }

    if ("status" in query) {
      evaluations = evaluations.filter(evaluation => evaluation.Status === query.status)
    }

    if ("type" in query) {
      evaluations = evaluations.filter(evaluation => evaluation.Type === query.type)
    }

    return evaluations
  }

  render() {
    const evaluations = this.filtered()
    const width = this.state.width - 240
    const query = this.props.location.query || {}
    let height = this.state.height - 90

    if (this.props.nested) {
      height = height - 120
    }

    if (height < 300) {
      height = 300
    }

    const handleChange = (event, index, value) => {
      this.props.router.push({
        pathname: location.pathname,
        query: { ...query, status: value }
      })
    }

    return (
      <div>
        <Card>
          <CardText>
            <Grid fluid style={{ padding: 0, margin: 0 }}>
              <Row>
                <Col key="job-name-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <FilterFreetext query="job" label="Job" focusOnLoad />
                </Col>
                <Col key="eval-id-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <FilterFreetext query="id" label="ID" />
                </Col>
                <Col key="eval-status-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <SelectField
                    floatingLabelText="Status"
                    maxHeight={200}
                    value={query.status || undefined}
                    onChange={handleChange}
                  >
                    <MenuItem />
                    <MenuItem value="complete" primaryText="Complete" />
                    <MenuItem value="blocked" primaryText="Blocked" />
                    <MenuItem value="canceled" primaryText="Canceled" />
                  </SelectField>
                </Col>
                <Col key="job-type-filter-pane" xs={6} sm={3} md={3} lg={3}>
                  <JobTypeFilter />
                </Col>
              </Row>
            </Grid>
          </CardText>
        </Card>

        <Card style={{ marginTop: "1rem" }}>
          <CardText>
            <Table
              rowHeight={35}
              headerHeight={35}
              rowsCount={evaluations.length}
              height={height}
              width={width}
              touchScrollEnabled
              {...this.props}
            >
              <Column header={<Cell>ID</Cell>} cell={<EvaluationLinkCell data={evaluations} col="ID" />} width={100} />
              <Column header={<Cell>Job</Cell>} cell={<JobLinkCell data={evaluations} />} flexGrow={2} width={200} />
              <Column
                header={<Cell>Triggered by</Cell>}
                cell={<TextCell data={evaluations} col="TriggeredBy" />}
                width={150}
              />
              <Column header={<Cell>Status</Cell>} cell={<TextCell data={evaluations} col="Status" />} width={150} />
              <Column
                header={<Cell>Deployment</Cell>}
                cell={<DeploymentLinkCell data={evaluations} col="DeploymentID" />}
                width={100}
              />
              <Column
                header={<Cell>Status Description</Cell>}
                cell={<TextCell data={evaluations} col="StatusDescription" />}
                flexGrow={2}
                width={150}
              />

              <Column
                header={<Cell>Parent</Cell>}
                cell={<EvaluationLinkCell data={evaluations} col="PreviousEval" />}
                width={100}
              />
              <Column header={<Cell>Type</Cell>} cell={<TextCell data={evaluations} col="Type" />} width={100} />
              <Column
                header={<Cell>Priority</Cell>}
                cell={<TextCell data={evaluations} col="Priority" />}
                width={100}
              />
            </Table>
          </CardText>
        </Card>
      </div>
    )
  }
}

EvaluationList.defaultProps = {
  evaluations: [],
  nested: false
}

EvaluationList.propTypes = {
  evaluations: PropTypes.array.isRequired,
  nested: PropTypes.bool.isRequired
}

export default withRouter(EvaluationList)
