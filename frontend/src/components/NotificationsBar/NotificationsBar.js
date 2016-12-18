import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Snackbar from 'material-ui/Snackbar'
import { green500, red500 } from 'material-ui/styles/colors'
import { CLEAR_ERROR_NOTIFICATION, CLEAR_SUCCESS_NOTIFICATION } from '../../sagas/event'

class NotificationsBar extends Component {

  constructor (props) {
    super(props)

    this.state = {
      showErrorMessage: false,
      errorMessage: '',

      showSuccessMessage: false,
      successMessage: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.successNotification.message) {
      this.setState({
        ...this.state,
        showSuccessMessage: true,
        successMessage: nextProps.successNotification.message
      })
    }

    if (nextProps.errorNotification.message) {
      this.setState({
        ...this.state,
        showErrorMessage: true,
        errorMessage: nextProps.errorNotification.message
      })
    }
  }

  resetSuccessMessage() {
    this.props.dispatch({ type: CLEAR_SUCCESS_NOTIFICATION });

    this.setState({
      ...this.state,
      showSuccessMessage: false,
      successMessage: ''
    })
  }

  resetErrorMessage() {
    this.props.dispatch({ type: CLEAR_ERROR_NOTIFICATION });

    this.setState({
      ...this.state,
      showErrorMessage: false,
      errorMessage: ''
    })
  }

  render() {
    return (
      <div>
        <Snackbar
          open={ this.state.showErrorMessage }
          message={ this.state.errorMessage }
          autoHideDuration={ 5000 }
          style={{ width: '100%', textAlign: 'center' }}
          bodyStyle={{ backgroundColor: red500, width: '100%', maxWidth: 'none' }}
          onRequestClose={ () => { this.resetErrorMessage() } }
        />

        <Snackbar
          open={ this.state.showSuccessMessage }
          message={ this.state.successMessage }
          autoHideDuration={ 5000 }
          style={{ width: '100%', textAlign: 'center' }}
          bodyStyle={{ backgroundColor: green500, width: '100%', maxWidth: 'none' }}
          onRequestClose={ () => { this.resetSuccessMessage() } }
        />
      </div>
    )
  }
}

NotificationsBar.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

function mapStateToProps ({ errorNotification, successNotification }) {
  return { errorNotification, successNotification }
}

NotificationsBar.defaultProps = {
  successNotification: {},
  errorNotification: {},
}

NotificationsBar.propTypes = {
  successNotification: PropTypes.object,
  errorNotification: PropTypes.object,
}

export default connect(mapStateToProps)(NotificationsBar)
