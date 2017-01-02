import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { List, ListItem } from 'material-ui/List'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontIcon from 'material-ui/FontIcon'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader'
import { red500 } from 'material-ui/styles/colors'
import {
  SET_CONSUL_KV_PAIR, GET_CONSUL_KV_PAIR,
  WATCH_CONSUL_KV_PATH, UNWATCH_CONSUL_KV_PATH,
  DELETE_CONSUL_KV_FOLDER, CLEAR_CONSUL_KV_PAIR,
  DELETE_CONSUL_KV_PAIR
} from '../sagas/event'

class ConsulKV extends Component {

  constructor (props) {
    super(props)

    this.state = {
      key: '',
      value: '',
      index: 0,
    }

    this._onClickPath = this.changePath.bind(this)
    this._onClickFIle = this.editKey.bind(this)
  }

  componentDidMount() {
    // setup subscription for a URL "splat" (whatever is after /consul/dc1/kv/*)
    // or the root path if no splat is provided
    if (this.props.routeParams.splat) {
      this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: this.getPath(this.props) })
    } else {
      this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: "/" })
    }

    // if we got a file query argument, read that kv pair into props
    if ('file' in this.props.location.query) {
      this.props.dispatch({
        type: GET_CONSUL_KV_PAIR,
        payload: this.getPath(this.props) + this.props.location.query.file,
      })
    }
  }

  componentWillUnmount() {
    // cleanup watches when the component is removed
    if (this.props.routeParams.splat) {
      this.props.dispatch({
        type: UNWATCH_CONSUL_KV_PATH,
        payload: this.getPath(this.props)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    // if the consul key is different, reset internal state
    if (nextProps.consulKVPair.Key != this.props.consulKVPair.Key) {
      this.resetState();
    }

    // Change internal state if we got a KV Pair in props
    if ('Key' in nextProps.consulKVPair) {
      this.setState({
        key: this.baseName(nextProps.consulKVPair.Key),
        value: nextProps.consulKVPair.Value ? atob(nextProps.consulKVPair.Value) : '',
        index: nextProps.consulKVPair.ModifyIndex,
      })
    }
  }

  componentDidUpdate(prevProps) {
    // if path did not change, don't bother changing subscriptions
    if (prevProps.routeParams.splat == this.props.routeParams.splat) {
      return;
    }

    // unwatch the old path
    this.props.dispatch({ type: UNWATCH_CONSUL_KV_PATH, payload: this.getPath(prevProps) })

    // watch the new path
    this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: this.getPath(this.props) })
  }

  /**
   * Return a path with a trailing slash
   */
  getPath(props) {
    if ('splat' in props.routeParams) {
      return props.routeParams.splat + "/"
    }

    return "/"
  }

  /**
   * Get the basename (filename) from a path
   */
  baseName(str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1) {
      base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
  }

  /**
   * Change key path
   */
  changePath(path) {
    if (path == '..') {
      path = this.props.routeParams.splat.split('/')
      path.pop();
      path = path.join('/')
      if (path) {
        path + "/"
      }
    }

    this.props.router.push({ pathname: `/consul/${this.props.router.params.region}/kv/${path}` })
    this.resetState(false, true);
  }

  /**
   * Start flow for editing key
   */
  editKey(file) {
    this.props.dispatch({
      type: GET_CONSUL_KV_PAIR,
      payload: file,
    })

    this.props.router.push({
      pathname: this.props.location.pathname,
      query: { file: this.baseName(file) }
    })
  }

  /**
   * Get visible path for display, chop off the base path and show
   * only the key name
   */
  getHumanPathName(path) {
    path = path.split('/')
    path.pop()
    return path.pop()
  }

  /**
   * Get visible file name for display, chop off the base path and
   * show only the file name
   */
  getHumanFileName(path) {
    path = path.split('/')
    return path.pop()
  }

  /**
   * Sort keys, directories first, and then files
   */
  sortKeys(keys) {
    keys.sort((a, b) => {
      // comparing directories should compare string wise
      if (a.slice(-1) == '/' && b.slice(-1) === '/') {
        return a.localeCompare(b)
      }

      // if a is a directory, but b is not, put a before b
      if (a.slice(-1) == '/' && b.slice(-1) != '/') {
        return -1
      }

      // if b is a directory, but a is not, put a after b
      if (a.slice(-1) != '/' && b.slice(-1) == '/') {
        return 1
      }

      // compare using natural sorting order
      return a.localeCompare(b)
    })

    // remove current path from keys
    const i = keys.indexOf(this.getPath(this.props))
    if (i != -1) {
      delete(keys[i])
    }

    return keys
  }

  /**
   * Update internal state for a key
   * when editing the input fields
   */
  handleChange(key, event) {
    const obj = {}
    obj[key] = event.target.value,

    this.setState(obj)
  }

  /**
   * Ensure a path is relative, by removing a leading /
   */
  relativePath(path) {
    if (path[0] === '/') {
      return path.slice(1)
    }

    return path
  }

  /**
   * Save a key pair
   */
  handleSave() {
    const filePath = this.relativePath(this.getPath(this.props) + this.state.key);
    const isDirectory = filePath[filePath.length - 1] === '/'

    this.props.dispatch({
      type: SET_CONSUL_KV_PAIR,
      payload: {
        path: filePath,
        value: this.state.value,
        index: this.state.index,
      }
    })

    // reset state when creating directories
    if (isDirectory) {
      this.resetState();
      return
    }

    // open the new key up for editing
    this.editKey(filePath)
  }

  /**
   * Reset internal state
   */
  resetState(includeUrl = false, clear = false) {
    if (includeUrl) {
      this.props.router.push({ pathname: this.props.location.pathname })
    }

    if (clear) {
      this.props.dispatch({ type: CLEAR_CONSUL_KV_PAIR })
    }

    this.setState({
      key: '',
      value: '',
      index: 0,
    })
  }

  /**
   * Delete a key-value pair
   */
  deleteKey() {
    if (!this.props.consulKVPair.Key) {
      return;
    }

    this.props.dispatch({
      type: DELETE_CONSUL_KV_PAIR,
      payload: {
        path: this.relativePath(this.getPath(this.props)) + this.state.key,
        index: this.props.consulKVPair.ModifyIndex,
      }
    })
  }

  /**
   * Delete a key tree (a path and everything nested below)
   */
  deleteKeyTree() {
    this.props.dispatch({
      type: DELETE_CONSUL_KV_FOLDER,
      payload: this.props.routeParams.splat,
    })

    this.resetState()
    this.changePath('..')
  }

  render() {
    const paths = this.sortKeys(this.props.consulKVPaths ? this.props.consulKVPaths : [])

    return (
      <Grid fluid style={{ padding: 0 }}>
        <Row>
          <Col key='navigation-pane' xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <Subheader>
              <div style={{ float: 'left' }}>
                { `Path: /${this.props.routeParams.splat ? '' + this.props.routeParams.splat : '' }` }
              </div>
              <div style={{ float: 'right' }}>
                { this.props.routeParams.splat
                    ? <FlatButton
                      label='Delete folder'
                      style={{ color: 'white' }}
                      backgroundColor={ red500 }
                      onClick={ () => { this.deleteKeyTree() } }
                      />
                    : null
                  }
              </div>
            </Subheader>
          </Col>
        </Row>
        <Row>
          <Col key='navigation-pane' xs={ 6 } sm={ 6 } md={ 4 } lg={ 3 }>
            <Card>
              <CardTitle
                title={ `keys & directories` }
              />
              <CardText>
                <List>
                  { this.props.routeParams.splat
                    ? <ListItem
                      onTouchTap={ () => this._onClickPath("..") }
                      leftIcon={ <FontIcon className='material-icons'>arrow_upward</FontIcon> }
                      primaryText={ ".." } />
                    : null
                  }
                  { paths.length > 0 ? null : <strong>no files or folders found</strong> }
                  { paths.map(path => {
                    // Directory
                    if (path.slice(-1) === '/') {
                      return (
                        <ListItem
                          onTouchTap={ () => this._onClickPath(path) }
                          leftIcon={ <FontIcon className='material-icons'>folder</FontIcon> }
                          primaryText={ this.getHumanPathName(path) } />
                      )
                    } else {
                      return (
                        <ListItem
                          onTouchTap={ () => this._onClickFIle(path) }
                          leftIcon={ <FontIcon className='material-icons'>insert_drive_file</FontIcon>  }
                          primaryText={ this.getHumanFileName(path) } />
                      )
                    }
                  })}
                </List>
              </CardText>
            </Card>
          </Col>
          <Col key='value-pane' xs={ 6 } sm={ 6 } md={ 8 } lg={ 9 }>
            <Card>
              <CardTitle title='Manage' />
              <CardText>
                <TextField
                  id='kv-key'
                  floatingLabelText='key'
                  fullWidth
                  value={ this.state.key }
                  onChange={ (event) => { this.handleChange('key', event)} }
                  disabled={ this.props.consulKVPair.ModifyIndex }
                />
                <div>To create a folder, end the key with <code>/</code></div>

                { this.state.key.slice(-1) != '/'
                  ? <span>
                    <TextField
                      id='kv-value'
                      floatingLabelText='value'
                      fullWidth
                      multiLine
                      rows={ 4 }
                      value={ this.state.value }
                      onChange={ (event) => { this.handleChange('value', event)} }
                    />
                    <br />
                    <br />
                    <RaisedButton
                      onClick={ () => { this.handleSave() } }
                      label='Save'
                      primary
                    />
                    &nbsp;
                    &nbsp;
                    <RaisedButton
                      onClick={ () => { this.resetState(true, true) } }
                      label='Cancel'
                    />
                    &nbsp;
                    &nbsp;
                    { this.props.consulKVPair.Key
                    ? <RaisedButton
                      style={{ float: 'right' }}
                      backgroundColor={ red500 }
                      onClick={ () => { this.deleteKey() } }
                      label='Delete'
                      />
                    : null
                    }
                  </span>
                  : <RaisedButton onClick={ () => { this.handleSave() } } label='Create folder' primary />
                }
              </CardText>
            </Card>
          </Col>
        </Row>
      </Grid>
    )
  }
}

function mapStateToProps ({ consulKVPaths, consulKVPair }) {
  return { consulKVPaths, consulKVPair }
}

ConsulKV.defaultProps = {
  consulKVPaths: [],
  consulKVPair: {},
}

ConsulKV.propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  routeParams: PropTypes.object.isRequired,
  consulKVPaths: PropTypes.array.isRequired,
  consulKVPair: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(withRouter(ConsulKV))
