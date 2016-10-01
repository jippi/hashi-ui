import React, { Component } from 'react';

class ConstraintRow extends Component {

    render() {
        const constraint = this.props.constraint;

        // unique case as it does not expose any LTarget or RTarget
        if (constraint.Operand === 'distinct_hosts') {
            return (
                <tr>
                    <td colSpan="3"><code>Distinct Hosts</code></td>
                </tr>
            )
        }

        return (
            <tr>
                <td><code>{constraint.LTarget}</code></td>
                <td>{constraint.Operand}</td>
                <td><code>{constraint.RTarget}</code></td>
            </tr>
        )
    }
}

ConstraintRow.defaultProps = {
    constraint: {},
};

export default ConstraintRow
