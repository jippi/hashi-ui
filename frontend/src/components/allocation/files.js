import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import Table from '../table';
import {
    FETCH_NODE,
    FETCH_DIR,
    CLEAR_RECEIVED_FILE_DATA,
    CLEAR_FILE_PATH,
    UNWATCH_FILE,
    WATCH_FILE,
} from '../../sagas/event';

class AllocationFiles extends Component {

    constructor(props) {
        super(props);

        const node = props.node;
        const alloc = props.allocation;
        let path = this.findAllocNode(this.props) ? '/' : '';

        if (path === '/' && ('path' in props.location.query)) {
            path = props.location.query.path;
        }

        if (path !== '') {
            this.props.dispatch({
                type: FETCH_DIR,
                payload: {
                    addr: node.HTTPAddr,
                    path,
                    allocID: alloc.ID,
                },
            });
        }

        this.state = { path, contents: '', file: '/' };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.findAllocNode(nextProps)) return;

        let path = this.state.path;
        let contents = this.state.contents;

        // The node information was fetched, so transition to the root path
        // if we are initialising.
        if (this.state.path === '') {
            path = '/';
            if ('path' in nextProps.location.query) {
                path = nextProps.location.query.path;
            }
        }

        if (nextProps.file.Data) {
            contents += nextProps.file.Data;
            this.props.dispatch({
                type: CLEAR_RECEIVED_FILE_DATA,
                payload: {
                    File: nextProps.file.File,
                },
            });
        }

        this.setState({ ...this.state, path, contents });
    }

    componentWillUpdate(nextProps, nextState) {
        // Only update if we changed paths
        if (this.state.path !== nextState.path) {
            this.props.dispatch({
                type: FETCH_DIR,
                payload: {
                    addr: nextProps.node.HTTPAddr,
                    path: nextState.path,
                    allocID: nextProps.allocation.ID,
                },
            });
        }
        this.shouldScroll = (this.content.scrollTop + this.content.offsetHeight) === this.content.scrollHeight;
    }

    componentDidUpdate() {
        if (this.shouldScroll) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_FILE,
            payload: this.state.file,
        });
        this.props.dispatch({
            type: CLEAR_FILE_PATH,
        });
    }

    findAllocNode(props) {
        // Find the node that this alloc belongs to
        const allocNode = props.nodes.find(node => node.ID === props.allocation.NodeID);

        // No node for this alloc, so bail out
        if (allocNode === undefined) return false;

        // Fetch the correct node information if the alloc node changed
        if (props.node == null || allocNode.ID !== props.node.ID) {
            this.props.dispatch({
                type: FETCH_NODE,
                payload: allocNode.ID,
            });
            return false;
        }

        // We've located the alloc node so go ahead and query the filesystem
        return true;
    }

    handleClick(file) {
        if (file.IsDir) {
            let path = this.state.path;
            if (file.Name === 'back') {
                path = path.substr(0, path.lastIndexOf('/', path.length - 2) + 1);
            } else {
                path = `${this.state.path}${file.Name}/`;
            }
            this.setState({ ...this.state, path });
        } else {
            const filePath = this.state.path + file.Name;
            if (filePath !== this.state.file) {
                this.props.dispatch({
                    type: UNWATCH_FILE,
                    payload: this.state.file,
                });
                this.props.dispatch({
                    type: WATCH_FILE,
                    payload: {
                        addr: this.props.node.HTTPAddr,
                        path: filePath,
                        allocID: this.props.allocation.ID,
                    },
                });
                this.setState({ ...this.state, contents: '', file: filePath });
            }
        }
    }

    render() {
        const files = this.props.directory.map(file =>
          <tr className="pointer" onClick={ () => this.handleClick(file) } key={ file.Name }>
            <td>{ file.Name }{ file.IsDir ? '/' : '' }</td>
            <td>{ file.IsDir ? '' : file.Size }</td>
          </tr>
        );

        if (this.state.path !== '/') {
            files.unshift(
              <tr className="pointer" onClick={ () => this.handleClick({ Name: 'back', IsDir: true }) } key="back">
                <td id="back">..</td>
                <td id="back"></td>
              </tr>
            );
        }

        let hostname;
        if (process.env.NODE_ENV === 'production') {
            hostname = location.host;
        } else {
            hostname = `${location.hostname}:${process.env.GO_PORT}` || 3000;
        }

        const baseUrl = `${location.protocol}//${hostname}`;
        const downloadPath = `download${this.props.file.File}`;
        const downloadBtn = this.props.file.File.startsWith('<') ? '' :
          <form className="file-download" method="get" action={ `${baseUrl}/${downloadPath}` } >
            <input type="hidden" name="client" value={ this.props.node.HTTPAddr } />
            <input type="hidden" name="allocID" value={ this.props.allocation.ID } />
            <Button type="submit" className="btn-download">Download</Button>
          </form>;

        return (
          <div className="tab-pane active">
            <div className="row">
              <div className="col-md-3">
                <div className="card">
                  <div className="header">Path: { this.state.path }</div>
                  <div className="content">
                    <Table classes="table table-hover" headers={ ['Name', 'Size'] } body={ files } />
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <div className="card">
                  <div className="header">File: { this.props.file.File }
                    { downloadBtn }
                  </div>
                  <hr className="file-content-hr" />
                  <div className="content content-file" ref={ (c) => { this.content = c; } }>
                    { this.state.contents }
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
}

function mapStateToProps({ allocation, nodes, node, directory, file }) {
    return { allocation, nodes, node, directory, file };
}

AllocationFiles.propTypes = {
    node: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    allocation: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    file: PropTypes.object.isRequired,
    directory: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(AllocationFiles);
