import React from 'react';

interface Props {
    data: { country: string; clicks: number }[];
}

const GeoTable: React.FC<Props> = ({ data }) => {
    if (!data.length) return <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No data yet</p>;

    return (
        <div className="table-container">
            <table>
                <tbody>
                    {data.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px' }}>{row.country === 'Unknown' ? '🌐' : '📍'}</span>
                                <span style={{ fontSize: '13px' }}>{row.country}</span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                <span className="badge badge-primary">{row.clicks}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GeoTable;
