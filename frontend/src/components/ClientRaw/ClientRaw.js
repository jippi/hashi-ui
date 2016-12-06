import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import RawJson from '../RawJson/RawJson'

const ClientRaw = ({ node }) =>
  <div className='tab-pane active'>
    <div className='content'>
      <RawJson json={ node } />
    </div>
  </div>

function mapStateToProps ({ node }) {
  return { node }
}

ClientRaw.propTypes = {
  node: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ClientRaw)
