import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: 'Chart.js Bar Chart',
        },
    },
};



export function Bars(items:any) {

    console.log(items)
    const labels = items.x;

    const data = {
        labels,
        datasets: [
            {
                label: 'Dataset 1',
                data: items.y.map((item:any) =>item),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
            
        ],
    };
    
    return <Bar options={options} data={data} />;
}
