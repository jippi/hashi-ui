import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
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

        // if the alloc node already in props
        // this only happens when you switch tab in the ui, this will never
        // trigger if /allocations/:id/files are the directly url and first page
        // you view
        if (this.findAllocNode(props)) {
            this.fetchDir(props, props.location.query.path || '/');
        }

        // push our initial state
        this.state = {
            contents: '',
            fileWatching: false,
            initialDirectoryFetched: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!this.findAllocNode(nextProps)) {
            return;
        }

        const nextState = this.state;

        const nextPath = nextProps.location.query.path;
        const currentPath = this.props.location.query.path;

        const nextFile = nextProps.location.query.file;
        const currentFile = this.props.location.query.file;

        if (currentPath !== nextPath || !this.state.initialDirectoryFetched) {
            this.fetchDir(nextProps, nextPath);
            nextState.initialDirectoryFetched = true;
        }

        if (this.state.fileWatching && currentFile && currentFile !== nextFile) {
            this.unwatchFile(nextProps, currentFile);
            nextState.contents = '';
            nextState.fileWatching = false;
        }

        if (!this.state.fileWatching && nextFile) {
            this.watchFile(nextProps);
            nextState.fileWatching = true;
        }

        if (this.state.fileWatching && nextProps.file.Data) {
            nextState.contents = this.state.contents + nextProps.file.Data;

            this.props.dispatch({
                type: CLEAR_RECEIVED_FILE_DATA,
                payload: {
                    File: nextProps.file.File,
                },
            });
        }

        if (this.state !== nextState) {
            this.setState(nextState);
        }
    }

    componentWillUpdate() {
        this.shouldScroll = (this.content.scrollTop + this.content.offsetHeight) === this.content.scrollHeight;
    }

    componentDidUpdate() {
        if (this.shouldScroll) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    componentWillUnmount() {
        this.unwatchFile(this.props, this.state);
        this.props.dispatch({
            type: CLEAR_FILE_PATH,
        });
    }

    findAllocNode(props) {
        // Find the node that this alloc belongs to
        const allocNode = props.nodes.find(node => node.ID === props.allocation.NodeID);

        // No node for this alloc, so bail out
        if (allocNode === undefined) {
            return false;
        }

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

    fetchDir(props, dir) {
        this.props.dispatch({
            type: FETCH_DIR,
            payload: {
                addr: props.node.HTTPAddr,
                path: dir || '/',
                allocID: props.allocation.ID,
            },
        });
    }

    watchFile(props) {
        if (!this.findAllocNode(props)) {
            return;
        }

        const filePath = props.location.query.path + props.location.query.file;

        this.props.dispatch({
            type: WATCH_FILE,
            payload: {
                addr: props.node.HTTPAddr,
                path: filePath,
                allocID: props.allocation.ID,
            },
        });
    }

    unwatchFile(props, file) {
        if (!this.findAllocNode(props)) {
            return;
        }

        props.dispatch({
            type: UNWATCH_FILE,
            payload: file,
        });
    }

    handleClick(file) {
        let path = this.props.location.query.path || '/';

        if (file.IsDir) {
            if (file.Name === 'back') {
                path = path.substr(0, path.lastIndexOf('/', path.length - 2) + 1);
            } else {
                path = `${path}${file.Name}/`;
            }

            this.props.history.push({
                pathname: this.props.location.pathname,
                query: { path },
            });
            return;
        }

        this.props.history.push({
            pathname: this.props.location.pathname,
            query: {
                path,
                file: file.Name,
            },
        });
    }

    collectFiles() {
        const files = this.props.directory.map(file =>
          <tr className="pointer" onClick={ () => this.handleClick(file) } key={ file.Name }>
            <td>{ file.Name }{ file.IsDir ? '/' : '' }</td>
            <td>{ file.IsDir ? '' : file.Size }</td>
          </tr>
        );

        if ((this.props.location.query.path || '/') !== '/') {
            files.unshift(
              <tr className="pointer" onClick={ () => this.handleClick({ Name: 'back', IsDir: true }) } key="back">
                <td id="back">..</td>
                <td id="back"></td>
              </tr>
            );
        }

        return files;
    }

    render() {
        let hostname;
        let fileName;

        if (process.env.NODE_ENV === 'production') {
            hostname = location.host;
        } else {
            hostname = `${location.hostname}:${process.env.GO_PORT}` || 3000;
        }

        if (this.state.fileWatching && this.props.file.File) {
            fileName = this.props.file.File;
        } else {
            fileName = '<please select a file>';
        }

        const oversizedWarning = !this.props.file.Oversized ? '' :
          <span>
            <i className="pe-7s-attention" data-tip data-for={ `tooltip-${this.props.file.File}` }></i>
            <span>
              <ReactTooltip id={ `tooltip-${this.props.file.File}` }>
                <span className="file-size-warning">
                  The file you are trying to view is too large.<br />
                  Tailing has started from the last 250 lines. <br />
                  Please download the file for the entire contents.
                </span>
              </ReactTooltip>
            </span>
          </span>;

        const baseUrl = `${location.protocol}//${hostname}`;
        const downloadPath = `download${this.props.file.File}`;

        const downloadBtn = this.props.file.File ? '' :
          <form className="file-download" method="get" action={ `${baseUrl}/${downloadPath}` } >
            <input type="hidden" name="client" value={ this.props.node.HTTPAddr } />
            <input type="hidden" name="allocID" value={ this.props.allocation.ID } />
            { oversizedWarning }
            <Button type="submit" className="btn-download">Download</Button>
          </form>;

        return (
          <div className="tab-pane active">
            <div className="row">
              <div className="col-md-3">
                <div className="card">
                  <div className="header">Path: { this.props.location.query.path || '/' }</div>
                  <div className="content">
                    <Table classes="table table-hover" headers={ ['Name', 'Size'] } body={ this.collectFiles() } />
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <div className="card">
                  <div className="header">File: { fileName }
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
    history: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(AllocationFiles);
