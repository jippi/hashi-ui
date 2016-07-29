import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FETCH_NODE, FETCH_DIR, UNWATCH_FILE, WATCH_FILE } from '../../sagas/event'

import Table from '../table'

class AllocFiles extends Component {

    constructor(props) {
        super(props)

        const path = this.findAllocNode(this.props) ? '/' : ''

        if (path === '/') {
            this.props.dispatch({
                type: FETCH_DIR,
                payload: {
                    addr: props.node.HTTPAddr,
                    path: '/',
                    allocID: props.allocation.ID
                }
            })
        }
        this.state = { path: path, contents: '', file: '/' };
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: UNWATCH_FILE,
            payload: this.state.file
        })
    }

    findAllocNode(props) {
        // Find the node that this alloc belongs to
        const node = props.nodes.find((node) => {
            return node.ID === props.allocation.NodeID
        })

        // No node for this alloc, so bail out
        if (node === undefined) return false

        // Fetch the correct node information if the alloc node changed
        if (props.node == null || node.ID !== props.node.ID) {
            this.props.dispatch({
                type: FETCH_NODE,
                payload: node.ID
            })
            return false
        }

        // We've located the alloc node so go ahead and query the filesystem
        return true
    }

    componentWillReceiveProps(nextProps) {
        if (!this.findAllocNode(nextProps)) return

        let path = this.state.path
        let contents = this.state.contents

        // The node information was fetched, so transition to the root path
        // if we are initialising.
        if (this.state.path === '') {
            path = '/'
        }

        if (nextProps.file.Offset !== this.props.file.Offset) {
            contents += nextProps.file.Data
        }
        this.setState({ ...this.state, 'path': path, 'contents': contents })
    }

    componentWillUpdate(nextProps, nextState) {
        // Only update if we changed paths
        if (this.state.path !== nextState.path) {
            this.props.dispatch({
                type: FETCH_DIR,
                payload: {
                    addr: nextProps.node.HTTPAddr,
                    path: nextState.path,
                    allocID: nextProps.allocation.ID
                }
            })
        }
    }

    handleClick(file) {
        if (file.IsDir) {
            let path = this.state.path
            if (file.Name === "back") {
                path = path.substr(0, path.lastIndexOf('/', path.length-2)+1)
            } else {
                path =`${this.state.path}${file.Name}/`
            }
            this.setState({ ...this.state, path: path })
        } else {
            const filePath = this.state.path + file.Name
            if (filePath !== this.state.file) {
                this.props.dispatch({
                    type: UNWATCH_FILE,
                    payload: this.state.file
                })
                this.props.dispatch({
                    type: WATCH_FILE,
                    payload: {
                        addr: this.props.node.HTTPAddr,
                        path: filePath,
                        allocID: this.props.allocation.ID
                    }
                })
                this.setState({ ...this.state, contents: '', file: filePath })
            }
        }
    }

    render() {
        let files = this.props.directory.map((file) => {
            return (
                <tr onClick={() => this.handleClick(file)} key={file.Name}>
                    <td>{file.Name}{file.IsDir ? "/": ""}</td>
                    <td>{file.IsDir ? "" : file.Size}</td>
                </tr>
            )
        })

        if (this.state.path !== '/') {
            files.unshift(
                <tr onClick={() => this.handleClick({ Name: "back", IsDir: true })} key='back'>
                    <td id="back">..</td>
                    <td id="back"></td>
                </tr>
            )
        }

        return (
            <div className="tab-pane active">
                <div className="row">
                    <div className="col-md-3">
                        <div className="card">
                            <div className="header">Path: {this.state.path}</div>
                            <div className="content">
                                <Table classes="table table-hover" headers={["Name", "Size"]} body={files} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="card">
                            <div className="header">File: {this.props.file.File}</div>
                            <hr />
                            <div className="content content-file">
                                {this.state.contents}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps({ allocation, nodes, node, directory, file }) {
    return { allocation, nodes, node, directory, file }
}

export default connect(mapStateToProps)(AllocFiles)
