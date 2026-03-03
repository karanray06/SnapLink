import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface Props {
    data: { date: string; clicks: number }[];
}

const ClicksLineChart: React.FC<Props> = ({ data }) => {
    return (
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(10, 10, 10, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#000' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClicksLineChart;
