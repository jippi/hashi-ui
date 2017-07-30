import React, { Component } from "react"
import PropTypes from "prop-types"
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import { Card, CardTitle, CardText } from "material-ui/Card"

//
// borrowed from http://recharts.org/examples#CustomActiveShapePieChart
//

class UtilizationPieChart extends Component {
  constructor(props) {
    super(props)
    this.state = { activeIndex: 0, showLabel: true }
  }

  onPieEnter(data, index) {
    this.setState({ activeIndex: index, showLabel: false })
  }

  onPieLeave() {
    this.setState({ showLabel: true })
  }

  renderActiveShape(props) {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
    const p = (percent * 100).toFixed(0)

    const textY = cy - 25
    const fValue = payload.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 5) * cos
    const sy = cy + (outerRadius + 5) * sin
    const mx = cx + (outerRadius + 8) * cos
    const my = cy + (outerRadius + 8) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? "start" : "end"

    return (
      <g>
        <text x={cx} y={textY} dy={4} textAnchor="middle" fill={fill}>
          <tspan x={cx} dy="1.2em">
            {payload.name}
          </tspan>
          <tspan x={cx} dy="1.2em">
            {fValue}
          </tspan>
          <tspan x={cx} dy="1.2em">
            {p}%
          </tspan>
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
          {`${payload.humanValue}`}
        </text>
      </g>
    )
  }

  render() {
    return (
      <Card>
        <CardTitle title={this.props.title} />
        <CardText>
          <ResponsiveContainer minHeight={200} minWidth={200}>
            <PieChart
              onMouseEnter={(data, index) => {
                this.onPieEnter(data, index)
              }}
              onMouseLeave={(data, index) => {
                this.onPieLeave(data, index)
              }}
              onClick={(data, index) => {
                this.onPieEnter(data, index)
              }}
            >
              <Pie
                activeIndex={this.state.activeIndex}
                activeShape={this.renderActiveShape}
                startAngle={90}
                endAngle={-365}
                data={this.props.data}
                innerRadius={60}
                outerRadius={80}
                isAnimationActive={false}
              >
                {this.props.data.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div style={{ marginTop: "1rem" }}>
            <dl className="metrics">
              {this.props.data.map(entry => [
                <dt style={{ color: entry.color }}>
                  {entry.name}
                </dt>,
                <dd style={{ color: entry.color }}>
                  {entry.humanValue}
                </dd>
              ])}
            </dl>
          </div>
        </CardText>
      </Card>
    )
  }
}

UtilizationPieChart.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired
}

export default UtilizationPieChart
