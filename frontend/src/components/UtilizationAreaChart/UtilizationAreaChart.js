import React, { Component } from "react"
import PropTypes from "prop-types"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardTitle, CardText } from "material-ui/Card"

//
// borrowed from http://recharts.org/examples/#/en-US/examples/StackedAreaChart
//
// input:
//     data: [{name: 'x-axis-value', key1: value1, key2: value2, ... }]
//     items: [{name: 'y-axis-name', stroke: '#3060a0', fill: '#205090'}]
//

class UtilizationAreaChart extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let data = []
    this.props.data.map((item, index) =>
      data.push(item)
    )
    return (
      <Card>
        <CardTitle title={this.props.title} />
        <CardText>
          <AreaChart width={500} height={400} data={data} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            {this.props.items.map((item) =>
              <Area key={item.name} isAnimationActive={false} type='monotone' dataKey={item.name} stackId="1" stroke={item.stroke} fill={item.fill} />
            )}
          </AreaChart>

          <div style={{ marginTop: "1rem" }}>
            <dl className="metrics">
              {this.props.items.map((item) => [
                <dt style={{ color: item.stroke }}>
                  {item.name}
                </dt>,
                <dd style={{ color: item.stroke }}>
                  {this.props.data[this.props.data.length -1][item.name].toFixed(0)}
                </dd>
              ])}
            </dl>
          </div>
        </CardText>
      </Card>
    )
  }
}

UtilizationAreaChart.propTypes = {
  data: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}

export default UtilizationAreaChart
