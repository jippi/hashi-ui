import React, { Component } from "react"
import PropTypes from "prop-types"
import { withRouter } from "react-router"
import { Grid, Row, Col } from "react-flexbox-grid"
import ReactTooltip from "react-tooltip"
import { connect } from "react-redux"
import RaisedButton from "material-ui/RaisedButton"
import Menu from "material-ui/Menu"
import MenuItem from "material-ui/MenuItem"
import FontIcon from "material-ui/FontIcon"
import Paper from "material-ui/Paper"
import {
  NOMAD_FETCH_NODE,
  NOMAD_FETCH_DIR,
  NOMAD_CLEAR_RECEIVED_FILE_DATA,
  NOMAD_CLEAR_FILE_PATH,
  NOMAD_UNWATCH_FILE,
  NOMAD_WATCH_FILE,
  NOMAD_WATCH_NODES,
  NOMAD_UNWATCH_NODES
} from "../../sagas/event"

const MAX_OUTPUT_LENGTH = 50000

class AllocationFiles extends Component {
  constructor(props) {
    super(props)

    // if the alloc node already in props
    // this only happens when you switch tab in the ui, this will never
    // trigger if /allocations/:id/files are the directly url and first page
    // you view
    if (this.findAllocNode(props)) {
      this.fetchDir(props, props.location.query.path || "/")
    }

    this.resizeHandler = this.updateDimensions.bind(this)

    // push our initial state
    this.state = {
      contents: "",
      fileWatching: false,
      initialDirectoryFetched: false,
      width: undefined
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.findAllocNode(nextProps)) {
      return
    }

    let stateHaveChanged = false
    const nextState = this.state

    const nextPath = nextProps.location.query.path
    const currentPath = this.props.location.query.path

    const nextFile = nextProps.location.query.file
    const currentFile = this.props.location.query.file

    if (currentPath !== nextPath || !this.state.initialDirectoryFetched) {
      this.fetchDir(nextProps, nextPath)
      nextState.initialDirectoryFetched = true
      stateHaveChanged = true
    }

    if (this.state.fileWatching && currentFile && currentFile !== nextFile) {
      this.unwatchFile(this.props)

      nextState.contents = ""
      nextState.fileWatching = false
      stateHaveChanged = true
    }

    if (!this.state.fileWatching && nextFile) {
      this.watchFile(nextProps)
      nextState.fileWatching = true
      stateHaveChanged = true
    }

    if (this.state.fileWatching && nextProps.file.Data) {
      stateHaveChanged = true
      nextState.contents = this.state.contents + nextProps.file.Data

      // ensure we keep small amount of text output in the browser
      if (nextState.contents.length > MAX_OUTPUT_LENGTH) {
        nextState.contents = nextState.contents.slice(MAX_OUTPUT_LENGTH * -1)
      }

      this.props.dispatch({
        type: NOMAD_CLEAR_RECEIVED_FILE_DATA,
        payload: {
          File: nextProps.file.File
        }
      })
    }

    if (stateHaveChanged) {
      this.setState(nextState)
    }
  }

  componentWillUpdate() {
    this.shouldScroll = this.content.scrollTop + this.content.offsetHeight === this.content.scrollHeight
  }

  componentDidUpdate() {
    if (this.shouldScroll) {
      this.content.scrollTop = this.content.scrollHeight
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.resizeHandler)
    this.props.dispatch({ type: NOMAD_WATCH_NODES })
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler)

    this.props.dispatch({ type: NOMAD_UNWATCH_NODES })
    this.props.dispatch({ type: NOMAD_CLEAR_FILE_PATH })

    if (!this.state.fileWatching) {
      return
    }

    this.unwatchFile(this.props)

    this.setState({
      contents: "",
      fileWatching: false,
      initialDirectoryFetched: false
    })
  }

  updateDimensions() {
    const element = document.getElementById("file_browser_pane")
    const positionInfo = element.getBoundingClientRect()
    const width = positionInfo.width - 75

    this.setState({ width })
  }

  findAllocNode(props) {
    // Find the node that this alloc belongs to
    const allocNode = props.nodes.find(node => node.ID === props.allocation.NodeID)

    // No node for this alloc, so bail out
    if (allocNode === undefined) {
      return false
    }

    // Fetch the correct node information if the alloc node changed
    if (props.node == null || allocNode.ID !== props.node.ID) {
      this.props.dispatch({
        type: NOMAD_FETCH_NODE,
        payload: allocNode.ID
      })

      return false
    }

    // We've located the alloc node so go ahead and query the filesystem
    return true
  }

  fetchDir(props, dir) {
    this.props.dispatch({
      type: NOMAD_FETCH_DIR,
      payload: {
        addr: props.node.HTTPAddr,
        secure: props.node.TLSEnabled,
        path: dir || "/",
        allocID: props.allocation.ID
      }
    })
  }

  watchFile(props) {
    if (!this.findAllocNode(props)) {
      return
    }

    const filePath = props.location.query.path + props.location.query.file

    this.props.dispatch({
      type: NOMAD_WATCH_FILE,
      payload: {
        addr: props.node.HTTPAddr,
        secure: props.node.TLSEnabled,
        path: filePath,
        allocID: props.allocation.ID
      }
    })
  }

  unwatchFile(props) {
    props.dispatch({
      type: NOMAD_UNWATCH_FILE,
      payload: {
        allocID: props.allocation.ID,
        path: props.location.query.path + props.location.query.file
      }
    })
  }

  handleClick(file) {
    let path = this.props.location.query.path || "/"

    if (file.IsDir) {
      if (file.Name === "back") {
        path = path.substr(0, path.lastIndexOf("/", path.length - 2) + 1)
      } else {
        path = `${path}${file.Name}/`
      }

      this.props.router.push({
        pathname: this.props.location.pathname,
        query: { path }
      })

      return
    }

    this.props.router.push({
      pathname: this.props.location.pathname,
      query: {
        path,
        file: file.Name
      }
    })
  }

  formatSizeUnits(bytes) {
    if (bytes >= 1073741824) {
      bytes = (bytes / 1073741824).toFixed(2) + " GB"
    } else if (bytes >= 1048576) {
      bytes = (bytes / 1048576).toFixed(2) + " MB"
    } else if (bytes >= 1024) {
      bytes = (bytes / 1024).toFixed(2) + " KB"
    } else if (bytes > 1) {
      bytes = bytes + " bytes"
    } else if (bytes === 1) {
      bytes = "1 byte"
    } else {
      bytes = "0 bytes"
    }
    return bytes
  }

  collectFiles() {
    const files = this.props.directory.map(file => {
      const pathSuffix = file.IsDir ? "/" : ""
      const primaryText = file.Name + pathSuffix
      const secondaryText = file.IsDir ? "" : this.formatSizeUnits(file.Size)
      const leftIcon = file.IsDir ? (
        <FontIcon className="material-icons">folder</FontIcon>
      ) : (
        <FontIcon className="material-icons">attachment</FontIcon>
      )

      return (
        <MenuItem
          key={file.Name}
          innerDivStyle={{ paddingRight: 0 }}
          onClick={() => this.handleClick(file)}
          leftIcon={leftIcon}
          primaryText={primaryText}
          secondaryText={secondaryText}
        />
      )
    })

    if ((this.props.location.query.path || "/") !== "/") {
      const leftIcon = <FontIcon className="material-icons">arrow_upward</FontIcon>

      files.unshift(
        <MenuItem
          key="back"
          onClick={() => this.handleClick({ Name: "back", IsDir: true })}
          leftIcon={leftIcon}
          primaryText=".."
        />
      )
    }

    return files
  }

  render() {
    let fileName

    if (this.state.fileWatching && this.props.file.File) {
      fileName = this.props.file.File
    } else {
      fileName = "<please select a file>"
    }

    const oversizedWarning = !this.props.file.Oversized ? (
      ""
    ) : (
      <span
        style={{
          display: "inline-block",
          position: "relative",
          top: 7,
          right: 6
        }}
      >
        <FontIcon className="material-icons" data-tip data-for={`tooltip-${this.props.file.File}`}>
          report_problem
        </FontIcon>
        <span>
          <ReactTooltip id={`tooltip-${this.props.file.File}`}>
            <span className="file-size-warning">
              The file you are trying to view is too large.<br />
              Tailing has started from the last 250 lines. <br />
              Please download the file for the entire contents.
            </span>
          </ReactTooltip>
        </span>
      </span>
    )

    const downloadPath = `nomad/${this.props.router.params.region}/download${this.props.file.File}`

    const downloadBtn =
      this.props.file.File.indexOf("<") >= 0 ? (
        ""
      ) : (
        <form method="get" action={`${HASHI_PATH_PREFIX}${downloadPath}`}>
          <input type="hidden" name="client" value={this.props.node.HTTPAddr} />
          <input type="hidden" name="allocID" value={this.props.allocation.ID} />
          {oversizedWarning}
          <RaisedButton label="Download" type="submit" className="btn-download" />
        </form>
      )

    const title = (
      <span>
        Current path: <strong>{this.props.location.query.path || "/"}</strong>
      </span>
    )
    const padding = { padding: 10 }
    const headline = {
      ...padding,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center  "
    }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key="files-pane" xs={12} sm={12} md={6} lg={4}>
            <Paper key="files" id="file_browser_pane">
              <div key="files-header" style={{ padding: 10, paddingBottom: 0 }}>
                {title}
              </div>
              <Menu key="files-menu" desktop style={{ width: this.state.width }}>
                {this.collectFiles()}
              </Menu>
            </Paper>
          </Col>
          <Col key="content-pane" xs={12} sm={12} md={6} lg={8}>
            <Paper>
              <div key="headline" style={headline}>
                File: {fileName} {downloadBtn}
              </div>
              <div
                key="contents"
                style={padding}
                className="content-file"
                ref={content => {
                  this.content = content
                }}
              >
                {this.state.contents}
              </div>
            </Paper>
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps({ allocation, nodes, node, directory, file }) {
  return { allocation, nodes, node, directory, file }
}

AllocationFiles.propTypes = {
  node: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  file: PropTypes.object.isRequired,
  directory: PropTypes.array.isRequired,
  router: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(withRouter(AllocationFiles))
