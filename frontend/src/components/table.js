import React from 'react';

const Table = ({ classes, headers, body }) => {
    return (
        <table className={classes}>
            <thead>
                <tr>
                {headers.map((header) => {
                    return (
                        <th key={header}>{header}</th>
                    )
                })}
                </tr>
            </thead>
            <tbody>
                {body}
            </tbody>
        </table>
    )
}

export default Table
