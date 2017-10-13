import React from "react"
import { Cell } from "fixed-data-table-2"
import AllocationConsulHealth from "../AllocationConsulHealth/AllocationConsulHealth"

const AllocationConsulHealthCell = ({ rowIndex, data, ...props }) => (
  <Cell rowIndex={rowIndex} data={data} {...props}>
    <AllocationConsulHealth allocation={data[rowIndex]} />
  </Cell>
)

export default AllocationConsulHealthCell
