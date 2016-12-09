import React, { Component, PropTypes } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { green500, red500, blue500, yellow500 } from 'material-ui/styles/colors'
import { Card, CardTitle, CardText } from 'material-ui/Card'

//
// borrowed from http://recharts.org/examples#CustomActiveShapePieChart
//

class Progressbar extends Component {

  constructor(props) {
    super(props);
    this.state = { activeIndex: 0, showLabel: true }
  }

  onPieEnter(data, index) {
    this.setState({ activeIndex: index, showLabel: false });
  }

  onPieLeave() {
    this.setState({ showLabel: true })
  }

  renderActiveShape(props) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const p = (percent * 100).toFixed(0)

    const textY = cy - 25

    return (
      <g>
        <text x={ cx } y={ textY } dy={ 8 } textAnchor='middle' fill={ fill }>
          <tspan x={ cx } dy='1.2em'>{ payload.name }</tspan>
          <tspan x={ cx } dy='1.2em'>{ payload.value }</tspan>
          <tspan x={ cx } dy='1.2em'>{ p }%</tspan>
        </text>
        <Sector
          cx={ cx }
          cy={ cy }
          innerRadius={ innerRadius }
          outerRadius={ outerRadius }
          startAngle={ startAngle }
          endAngle={ endAngle }
          fill={ fill }
        />
        <Sector
          cx={ cx }
          cy={ cy }
          startAngle={ startAngle }
          endAngle={ endAngle }
          innerRadius={ outerRadius + 6 }
          outerRadius={ outerRadius + 8 }
          fill={ fill }
        />
      </g>
    )
  }

  colorIndex (index) {
    return {
      // client status
      ready: green500,
      initializing: red500,
      down: blue500,

      // server status
      alive: green500,
      leaving: red500,
      left: blue500,
      shutdown: yellow500,

      // job status
      running: green500,
      pending: red500,
      dead: blue500,

      // job type
      service: green500,
      batch: red500,
      system: blue500,

      // task states
      // running: 'success',
      starting: green500,
      queued: red500,
      failed: blue500,
      lost: yellow500
    }[index]
  }

  render () {
    const keys = Object.keys(this.props.data)
    const normalizedValues = {}
    keys.forEach(key => (normalizedValues[key.toLowerCase()] = this.props.data[key]))
    const normalizedKeys = keys.map(string => string.toLowerCase())

    let data = normalizedKeys.map((index) => {
      return {
        name: index,
        value: normalizedValues[index]
      }
    })

    return (
      <Card>
        <CardTitle title={ this.props.title } />
        <CardText>
          <ResponsiveContainer minHeight={ 200 } minWidth={ 200 }>
            <PieChart
              onMouseEnter={ (data, index) => { this.onPieEnter(data, index) } }
              onMouseLeave={ (data, index) => { this.onPieLeave(data, index) } }
            >
              <Pie
                activeIndex={ this.state.activeIndex }
                activeShape={ this.renderActiveShape }
                data={ data }
                innerRadius={ 60 }
                outerRadius={ 80 }
                isAnimationActive={ false }
                label={ this.state.showLabel }
              >
                {
                  data.map((entry) => <Cell fill={ this.colorIndex(entry.name) } />)
                }
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardText>
      </Card>
    )
  }
}

Progressbar.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
}

export default Progressbar
