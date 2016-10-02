import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { NomadLink } from '../components/link';
import DisplayBoolean from '../components/display/boolean';

const Members = ({ members }) => {
    const leader = this.props.members[0];

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="header">
              <h4 className="title">Members</h4>
            </div>
            <div className="content table-responsive table-full-width">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Port</th>
                    <th>Status</th>
                    <th>Leader</th>
                    <th>Protocol</th>
                    <th>Build</th>
                    <th>Datacenter</th>
                    <th>Region</th>
                  </tr>
                </thead>
                <tbody>
                  { members.map((member) => {
                      const isLeader = member.ID === leader.ID;
                      return (
                        <tr key={ member.ID }>
                          <td><NomadLink memberId={ member.ID } short="true" /></td>
                          <td>{member.Name}</td>
                          <td>{member.Addr}</td>
                          <td>{member.Port}</td>
                          <td>{member.Status}</td>
                          <td><DisplayBoolean value={ isLeader } /></td>
                          <td>{member.ProtocolCur}</td>
                          <td>{member.Tags.build}</td>
                          <td>{member.Tags.dc}</td>
                          <td>{member.Tags.region}</td>
                        </tr>
                      );
                  })
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
};

function mapStateToProps({ members }) {
    return { members };
}

Members.propTypes = {
    members: PropTypes.isRequired,
};

export default connect(mapStateToProps)(Members);
