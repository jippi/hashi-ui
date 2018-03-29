import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { List, ListItem } from "material-ui/List"
import { Card, CardHeader, CardText } from "material-ui/Card"
import FontIcon from "material-ui/FontIcon"
import { NOMAD_FETCH_REGIONS, NOMAD_SET_REGION } from "../sagas/event"

class SelectNomadRegion extends Component {
  constructor(props) {
    super(props)
    this._onClick = this.handleChangeNomadRegion.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: NOMAD_FETCH_REGIONS })
  }

  handleChangeNomadRegion(region) {
    this.props.dispatch({
      type: NOMAD_SET_REGION,
      payload: region
    })
  }

  render() {
    return (
      <Card>
        <CardHeader title="Please select a nomad region" />
        <CardText>
          <List>
            {Object.keys(this.props.nomadRegions).map(region => {
              const regionName = this.props.nomadRegions[region]
              return (
                <ListItem
                  key={regionName}
                  leftIcon={<FontIcon className="material-icons">public</FontIcon>}
                  primaryText={regionName}
                  onTouchTap={() => this._onClick(regionName)}
                />
              )
            })}
          </List>
        </CardText>
      </Card>
    )
  }
}

function mapStateToProps({ nomadRegions }) {
  return { nomadRegions }
}

SelectNomadRegion.defaultProps = {
  nomadRegions: []
}

SelectNomadRegion.propTypes = {
  nomadRegions: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(SelectNomadRegion)
