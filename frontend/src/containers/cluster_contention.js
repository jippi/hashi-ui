import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Helmet } from "react-helmet"
import {GridList, GridTile} from "material-ui/GridList"
import { Grid } from "react-flexbox-grid"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

import {
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../sagas/event"

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  },
};

class Contention extends Component {
  componentWillMount() {
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
  }

  componentWillUnmount() {
    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
  }


  render() {
    let grids = [];
    {this.props.nodes.map(node => {
      console.log(this.props.params.nodeClass, node.NodeClass);
      if (this.props.params.nodeClass === undefined || node.NodeClass === this.props.params.nodeClass) {
        console.log('selected');
        grids.push(
          <GridTile
            key={node.ID}
            title={node.Name + (node.NodeClass!==undefined?"(Class: " + node.NodeClass + ")":"")}
            titleStyle={{textDecoration: node.Drain!==undefined?"line-through":"none"}}
          >
            <BarChart width={200} height={100} data={[
              {name: "cpu", value: node.Stats.cpuAllocated},
              {name: "mem", value: node.Stats.memAllocated},
              {name: "disk", value: node.Stats.diskAllocated},
              {name: "allocs", value: node.Stats.allocations},
            ]}>
              <Bar dataKey='value' fill='#8884d8' isAnimationActive={false} label={true}/>
              <XAxis dataKey="name"/>
              <YAxis type="number" domain={[0, 100]} hide={true}/>
            </BarChart>
          </GridTile>
        )
      }
    })}

    return (
      <span>
        <Helmet>
          <title>Contention - Nomad - Hashi-UI</title>
        </Helmet>

        <Grid fluid style={{ padding: 0 }}>
          <div style={styles.root}>
          <GridList
            cellHeight={140}
            cols={6}
            style={styles.gridList}
          >
            {grids}
          </GridList>
          </div>
        </Grid>
      </span>
    )
  }
}

function mapStateToProps({ nodes }) {
  return { nodes }
}

Contention.propTypes = {
  nodes: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired
}

export default connect(mapStateToProps)(Contention)
