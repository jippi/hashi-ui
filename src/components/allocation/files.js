import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FETCH_DIR, FETCH_FILE } from '../../sagas/filesystem'
import { FETCH_NODE } from '../../sagas/node'

import Table from '../table'

class AllocFiles extends Component {

    constructor(props) {
        super(props)

        const path = this.findAllocNode(this.props) ? '/' : ''

        this.state = { path };
    }

    findAllocNode(props) {
        // Find the node that this alloc belongs to
        const node = props.nodes.find((node) => {
            return node.ID === props.allocation.NodeID
        })

        // No node for this alloc, so bail out
        if (node === undefined) return false

        // Fetch the correct node information if the alloc node changed
        if (node.ID !== props.node.ID) {
            this.props.dispatch({
                type: FETCH_NODE,
                id: node.ID,
                watch: false
            })
            return false
        }

        // We've located the alloc node so go ahead and query the filesystem
        return true
    }

    componentWillReceiveProps(nextProps) {
        if (!this.findAllocNode(nextProps)) return

        // The node information was fetched, so transition to the root path
        // if we are initialising.
        if (this.state.path === '') {
            this.setState({ 'path': '/' })
        }
    }

    componentWillUpdate(nextProps, nextState) {
        // Only update if we changed paths
        if (this.state.path !== nextState.path) {
            this.props.dispatch({
                type: FETCH_DIR,
                client: nextProps.node.HTTPAddr,
                path: nextState.path,
                alloc: nextProps.allocation.ID
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
            this.setState({ path })
        } else {
            this.props.dispatch({
                type: FETCH_FILE,
                client: this.props.node.HTTPAddr,
                path: this.state.path + file.Name,
                alloc: this.props.allocation.ID
            })
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
                            <div className="header">File: {this.props.file.path}</div>
                            <hr />
                            <div className="content content-file">
                                {this.props.file.text}
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
