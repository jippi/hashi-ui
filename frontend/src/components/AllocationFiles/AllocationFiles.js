import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'
import {
    FETCH_NODE,
    FETCH_DIR,
    CLEAR_RECEIVED_FILE_DATA,
    CLEAR_FILE_PATH,
    UNWATCH_FILE,
    WATCH_FILE
} from '../../sagas/event'

class AllocationFiles extends Component {

  constructor (props) {
    super(props)

    // if the alloc node already in props
    // this only happens when you switch tab in the ui, this will never
    // trigger if /allocations/:id/files are the directly url and first page
    // you view
    if (this.findAllocNode(props)) {
      this.fetchDir(props, props.location.query.path || '/')
    }

    // push our initial state
    this.state = {
      contents: '',
      fileWatching: false,
      initialDirectoryFetched: false,
      width: undefined
    }
  }

  componentWillReceiveProps (nextProps) {
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
      this.unwatchFile(nextProps, currentFile)
      nextState.contents = ''
      nextState.fileWatching = false
      stateHaveChanged = true
    }

    if (!this.state.fileWatching && nextFile) {
      this.watchFile(nextProps)
      nextState.fileWatching = true
      stateHaveChanged = true
    }

    if (this.state.fileWatching && nextProps.file.Data) {
      nextState.contents = this.state.contents + nextProps.file.Data
      stateHaveChanged = true

      this.props.dispatch({
        type: CLEAR_RECEIVED_FILE_DATA,
        payload: {
          File: nextProps.file.File
        }
      })
    }

    if (stateHaveChanged) {
      this.setState(nextState)
    }
  }

  componentWillUpdate () {
    this.shouldScroll = (this.content.scrollTop + this.content.offsetHeight) === this.content.scrollHeight
  }

  componentDidUpdate () {
    if (this.shouldScroll) {
      this.content.scrollTop = this.content.scrollHeight
    }
  }

  componentDidMount () {
    window.addEventListener('resize', () => this.updateDimensions())
    this.updateDimensions()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', () => this.updateDimensions())

    this.props.dispatch({
      type: CLEAR_FILE_PATH
    })

    if (!this.state.fileWatching) {
      return
    }

    this.unwatchFile(this.props, this.props.location.query.file)

    this.setState({
      contents: '',
      fileWatching: false,
      initialDirectoryFetched: false
    })
  }

  updateDimensions () {
    const element = document.getElementById('file_browser_pane')
    const positionInfo = element.getBoundingClientRect()
    const width = positionInfo.width - 75

    this.setState({ width })
  }

  findAllocNode (props) {
    // Find the node that this alloc belongs to
    const allocNode = props.nodes.find(node => node.ID === props.allocation.NodeID)

    // No node for this alloc, so bail out
    if (allocNode === undefined) {
      return false
    }

    // Fetch the correct node information if the alloc node changed
    if (props.node == null || allocNode.ID !== props.node.ID) {
      this.props.dispatch({
        type: FETCH_NODE,
        payload: allocNode.ID
      })

      return false
    }

    // We've located the alloc node so go ahead and query the filesystem
    return true
  }

  fetchDir (props, dir) {
    this.props.dispatch({
      type: FETCH_DIR,
      payload: {
        addr: props.node.HTTPAddr,
        path: dir || '/',
        allocID: props.allocation.ID
      }
    })
  }

  watchFile (props) {
    if (!this.findAllocNode(props)) {
      return
    }

    const filePath = props.location.query.path + props.location.query.file

    this.props.dispatch({
      type: WATCH_FILE,
      payload: {
        addr: props.node.HTTPAddr,
        path: filePath,
        allocID: props.allocation.ID
      }
    })
  }

  unwatchFile (props, file) {
    if (!this.findAllocNode(props)) {
      return
    }

    props.dispatch({
      type: UNWATCH_FILE,
      payload: file
    })
  }

  handleClick (file) {
    let path = this.props.location.query.path || '/'

    if (file.IsDir) {
      if (file.Name === 'back') {
        path = path.substr(0, path.lastIndexOf('/', path.length - 2) + 1)
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

  formatSizeUnits (bytes) {
    if (bytes >= 1073741824) {
      bytes = (bytes / 1073741824).toFixed(2) + ' GB'
    } else if (bytes >= 1048576) {
      bytes = (bytes / 1048576).toFixed(2) + ' MB'
    } else if (bytes >= 1024) {
      bytes = (bytes / 1024).toFixed(2) + ' KB'
    } else if (bytes > 1) {
      bytes = bytes + ' bytes'
    } else if (bytes === 1) {
      bytes = bytes + ' byte'
    } else {
      bytes = '0 byte'
    }
    return bytes
  }

  collectFiles () {
    const files = this.props.directory.map((file) => {
      const a = file.IsDir ? '/' : ''
      const b = file.Name + a
      const c = file.IsDir ? '' : this.formatSizeUnits(file.Size)
      const i = file.IsDir
        ? <FontIcon className='material-icons'>folder</FontIcon>
        : <FontIcon className='material-icons'>attachment</FontIcon>

      return <MenuItem
        innerDivStyle={{ paddingRight: 0 }}
        onTouchTap={ () => this.handleClick(file) }
        leftIcon={ i }
        primaryText={ b }
        secondaryText={ c }
      />
    })

    if ((this.props.location.query.path || '/') !== '/') {
      const x = <FontIcon className='material-icons'>arrow_upward</FontIcon>

      files.unshift(
        <MenuItem
          onTouchTap={ () => this.handleClick({ Name: 'back', IsDir: true }) }
          leftIcon={ x }
          primaryText='..'
        />
      )
    }

    return files
  }

  render () {
    let hostname
    let fileName

    if (process.env.NODE_ENV === 'production') {
      hostname = location.host
    } else {
      hostname = `${location.hostname}:${process.env.GO_PORT}` || 3000
    }

    if (this.state.fileWatching && this.props.file.File) {
      fileName = this.props.file.File
    } else {
      fileName = '<please select a file>'
    }

    const oversizedWarning = !this.props.file.Oversized ? '' : (
      <span>
        <i className='pe-7s-attention' data-tip data-for={ `tooltip-${this.props.file.File}` }></i>
        <span>
          <ReactTooltip id={ `tooltip-${this.props.file.File}` }>
            <span className='file-size-warning'>
              The file you are trying to view is too large.<br />
              Tailing has started from the last 250 lines. <br />
              Please download the file for the entire contents.
            </span>
          </ReactTooltip>
        </span>
      </span>
    )

    const baseUrl = `${location.protocol}//${hostname}`
    const downloadPath = `download${this.props.file.File}`

    const downloadBtn = this.props.file.File ? '' :
      (<form className='file-download' method='get' action={ `${baseUrl}/${downloadPath}` } >
        <input type='hidden' name='client' value={ this.props.node.HTTPAddr } />
        <input type='hidden' name='allocID' value={ this.props.allocation.ID } />
        { oversizedWarning }
        <Button type='submit' className='btn-download'>Download</Button>
      </form>)

    const title = <span>Current path: <strong>{this.props.location.query.path || '/'}</strong></span>
    const padding = { padding: 10 }

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='files-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 4 }>
            <Paper key='files' id='file_browser_pane'>
              <div key='files-header' style={{ padding: 10, paddingBottom: 0 }}>{ title }</div>
              <Menu key='files-menu' desktop style={{ width: this.state.width }}>{ this.collectFiles() }</Menu>
            </Paper>
          </Col>
          <Col key='content-pane' xs={ 12 } sm={ 12 } md={ 6 } lg={ 8 }>
            <Paper>
              <div key='headline' style={ padding }>File: { fileName } { downloadBtn }</div>
              <div key='contents' style={ padding } className='content-file' ref={ (c) => { this.content = c } }>
                { this.state.contents }
              </div>
            </Paper>
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps ({ allocation, nodes, node, directory, file }) {
  return { allocation, nodes, node, directory, file }
}

AllocationFiles.propTypes = {
  node: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  allocation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  file: PropTypes.object.isRequired,
  directory: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(AllocationFiles)
