import React, { Component } from "react"
import PropTypes from "prop-types"
import { Card, CardTitle, CardText } from "material-ui/Card"
import { Table, TableHeader, TableRow, TableHeaderColumn, TableBody, TableRowColumn } from "../Table"

//
// borrowed from http://recharts.org/examples#CustomActiveShapePieChart
//

class DiskUtilizationTable extends Component {
  render() {
    const styles = { width: 100, textAlign: "right" }

    const rows = []
    this.props.data.forEach(disk => {
      rows.push(
        <TableRow key={disk.Mountpoint}>
          <TableRowColumn>
            {disk.Mountpoint}
          </TableRowColumn>
          <TableRowColumn style={styles}>
            {(disk.Size / 1024 / 1024 / 1024).toFixed(2)} GB
          </TableRowColumn>
          <TableRowColumn style={styles}>
            {(disk.Available / 1024 / 1024 / 1024).toFixed(2)} GB
          </TableRowColumn>
          <TableRowColumn style={styles}>
            {(disk.Used / 1024 / 1024 / 1024).toFixed(2)}
          </TableRowColumn>
          <TableRowColumn style={styles}>
            {disk.UsedPercent.toFixed(2)} %
          </TableRowColumn>
        </TableRow>
      )
    })

    return (
      <Card>
        <CardTitle title={this.props.title} />
        <CardText>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn key="Mountpoint">Mountpoint</TableHeaderColumn>
                <TableHeaderColumn style={styles} key="Size">
                  Size
                </TableHeaderColumn>
                <TableHeaderColumn style={styles} key="Available">
                  Available
                </TableHeaderColumn>
                <TableHeaderColumn style={styles} key="Used">
                  Used
                </TableHeaderColumn>
                <TableHeaderColumn style={styles} key="UsedPercent">
                  Utilization
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    )
  }
}

DiskUtilizationTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired
}

export default DiskUtilizationTable
