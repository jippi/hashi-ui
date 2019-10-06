import { APP_CLEAR_ERROR_NOTIFICATION, APP_CLEAR_SUCCESS_NOTIFICATION } from "../../sagas/event"
import { connect } from "react-redux"
import { green, amber } from "@material-ui/core/colors"
import { makeStyles } from "@material-ui/core/styles"
import CheckCircleIcon from "@material-ui/icons/CheckCircle"
import CloseIcon from "@material-ui/icons/Close"
import ErrorIcon from "@material-ui/icons/Error"
import InfoIcon from "@material-ui/icons/Info"
import WarningIcon from "@material-ui/icons/Info"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Snackbar from "@material-ui/core/Snackbar"
import IconButton from "@material-ui/core/IconButton"
import SnackbarContent from "@material-ui/core/SnackbarContent"
import clsx from "clsx"

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
}

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}))
function MySnackbarContentWrapper(props) {
  const classes = useStyles1()
  const { className, message, onClose, variant, ...other } = props
  const Icon = variantIcon[variant]

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      {...other}
    />
  )
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(["error", "info", "success", "warning"]).isRequired
}

class NotificationsBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showErrorMessage: false,
      errorMessage: "",

      showSuccessMessage: false,
      successMessage: ""
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
    this.props.dispatch({ type: APP_CLEAR_SUCCESS_NOTIFICATION })

    this.setState({
      ...this.state,
      showSuccessMessage: false,
      successMessage: ""
    })
  }

  resetErrorMessage() {
    this.props.dispatch({ type: APP_CLEAR_ERROR_NOTIFICATION })

    this.setState({
      ...this.state,
      showErrorMessage: false,
      errorMessage: ""
    })
  }

  render() {
    return (
      <div>
        <Snackbar
          open={this.state.showErrorMessage}
          autoHideDuration={5000}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          onClose={() => {
            this.resetErrorMessage()
          }}
        >
          <MySnackbarContentWrapper variant="error" message={this.state.errorMessage} />
        </Snackbar>

        <Snackbar
          open={this.state.showSuccessMessage}
          autoHideDuration={5000}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          onClose={() => {
            this.resetSuccessMessage()
          }}
        >
          <MySnackbarContentWrapper variant="success" message={this.state.successMessage} />
        </Snackbar>
      </div>
    )
  }
}

NotificationsBar.propTypes = {
  job: PropTypes.object.isRequired,
  taskGroup: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps({ errorNotification, successNotification }) {
  return { errorNotification, successNotification }
}

NotificationsBar.defaultProps = {
  successNotification: {},
  errorNotification: {}
}

NotificationsBar.propTypes = {
  successNotification: PropTypes.object,
  errorNotification: PropTypes.object
}

export default connect(mapStateToProps)(NotificationsBar)
