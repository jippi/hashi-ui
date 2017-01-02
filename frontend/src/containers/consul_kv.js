import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { List, ListItem } from 'material-ui/List'
import { Card, CardTitle, CardText } from 'material-ui/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'
import FontIcon from 'material-ui/FontIcon'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton';
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
    this._onClickFIle = this.editFile.bind(this)
  }

  componentDidMount() {
    if (this.props.routeParams.splat) {
      this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: this.getPath(this.props) })
    } else {
      this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: "/" })
    }

    if ('file' in this.props.location.query) {
      this.props.dispatch({
        type: GET_CONSUL_KV_PAIR,
        payload: this.getPath(this.props) + this.props.location.query.file,
      })
    }
  }

  componentWillUnmount() {
    if (this.props.routeParams.splat) {
      this.props.dispatch({
        type: UNWATCH_CONSUL_KV_PATH,
        payload: this.getPath(this.props)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
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
    if (prevProps.routeParams.splat == this.props.routeParams.splat) {
      return;
    }

    this.props.dispatch({ type: UNWATCH_CONSUL_KV_PATH, payload: this.getPath(prevProps) })
    this.props.dispatch({ type: WATCH_CONSUL_KV_PATH, payload: this.getPath(this.props) })
  }

  getPath(props) {
    if ('splat' in props.routeParams) {
      return props.routeParams.splat + "/"
    }

    return "/"
  }

  baseName(str) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1) {
      base = base.substring(0, base.lastIndexOf("."));
    }
    return base;
  }

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
    this.resetState();
  }

  editFile(file) {
    this.props.dispatch({
      type: GET_CONSUL_KV_PAIR,
      payload: file,
    })

    this.props.router.push({ pathname: this.props.location.pathname, query: { file: this.baseName(file) } })
  }

  getHumanPathName(path) {
    path = path.split('/')
    path.pop()
    return path.pop()
  }

  getHumanFileName(path) {
    path = path.split('/')
    return path.pop()
  }

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

  handleChange(key, event) {
    const obj = {}
    obj[key] = event.target.value,

    this.setState(obj)
  }

  relativePath(path) {
    if (path[0] === '/') {
      return path.slice(1)
    }

    return path
  }

  handleSubmit() {
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

    // this.resetState();
    if (isDirectory) {
      this.resetState();
    }

    if (!isDirectory && !('file' in this.props.location.query)) {
      this.editFile(filePath)
    }
  }

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

  deleteCurrentFolder() {
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
          <Col key='navigation-pane' xs={ 6 } sm={ 6 } md={ 4 } lg={ 3 }>
            <Card>
              <CardTitle
                title={ `Browse ${this.props.routeParams.splat ? ': ' + this.props.routeParams.splat : '' }` }
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
                { this.props.routeParams.splat
                  ? <RaisedButton
                    label='Delete folder'
                    labelColor='white'
                    backgroundColor={ red500 }
                    style={{ marginRight: 12 }}
                    onClick={ () => { this.deleteCurrentFolder() } }
                    />
                  : null
                }
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
                      onClick={ () => { this.handleSubmit() } }
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
                  : <RaisedButton onClick={ () => { this.handleSubmit() } } label='Create folder' primary />
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
