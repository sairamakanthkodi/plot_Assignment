import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PlotApp = () => {
    const [beta1, setBeta1] = useState(3);
    const [beta2, setBeta2] = useState(2);
    const [data, setData] = useState({ x1: [], x2: [], y: [] });
    const [currentCamera, setCurrentCamera] = useState({
        eye: { x: 1.25, y: 1.25, z: 1.25 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
    });

    useEffect(() => {
        generateData();
    }, []);

    const generateData = () => {
        const x1 = [];
        const x2 = [];
        const y = [];
        for (let i = 0; i < 100; i++) {
            x1.push(Math.random() * 20 - 10);
            x2.push(Math.random() * 20 - 10);
            y.push(3 * x1[i] + 2 * x2[i] + (Math.random() * 10 - 5));
        }
        setData({ x1, x2, y });
    };

    const computeRMSE = (beta1, beta2) => {
        let sumSqError = 0;
        for (let i = 0; i < data.x1.length; i++) {
            const yPred = beta1 * data.x1[i] + beta2 * data.x2[i];
            sumSqError += (data.y[i] - yPred) ** 2;
        }
        return Math.sqrt(sumSqError / data.x1.length);
    };

    const updateScatterPlot = () => {
        const y_pred = data.x1.map((x1, i) => beta1 * x1 + beta2 * data.x2[i]);
        return [
            {
                x: y_pred,
                y: data.y,
                mode: 'markers',
                type: 'scatter',
                marker: { size: 8, color: 'navy' }
            },
            {
                x: [-50, 50],
                y: [-50, 50],
                mode: 'lines',
                line: { dash: 'dash', color: 'red' }
            }
        ];
    };

    const updateSurfacePlot = () => {
        if (data.x1.length === 0 || data.x2.length === 0 || data.y.length === 0) return [];

        const beta1Range = Array.from({ length: 41 }, (_, i) => -10 + i * 0.5);
        const beta2Range = Array.from({ length: 41 }, (_, i) => -10 + i * 0.5);

        const z = beta1Range.map(beta1Val =>
            beta2Range.map(beta2Val => computeRMSE(beta1Val, beta2Val))
        );

        return [
            {
                z: z,
                x: beta1Range,
                y: beta2Range,
                type: 'surface',
                colorscale: 'RdBu',
                opacity: 0.5
            },
            {
                x: [beta1],
                y: [beta2],
                z: [computeRMSE(beta1, beta2)],
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: 10, color: 'red' }
            }
        ];
    };

    return (
        <div className="container">
            <div className="plot-section text-center">
                <h3>Interactive Scatter and 3D Surface Plot</h3>
                <p>Adjust the sliders to see how different beta values affect the plots</p>
                <div className="row">
                    <div className="col-6">
                        <div className="plot-box">
                            <Plot
                                data={updateScatterPlot()}
                                layout={{
                                    title: `Scatter Plot (Beta1: ${beta1}, Beta2: ${beta2})`,
                                    xaxis: { title: 'Predicted Values' },
                                    yaxis: { title: 'Actual Values' },
                                    margin: { t: 40, r: 40, b: 40, l: 50 },
                                    autosize: true
                                }}
                                className="w-100 h-100"
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="plot-box">
                            <Plot
                                data={updateSurfacePlot()}
                                layout={{
                                    title: 'RMSE Surface Plot',
                                    scene: {
                                        xaxis: { title: 'Beta1' },
                                        yaxis: { title: 'Beta2' },
                                        zaxis: { title: 'RMSE' },
                                        camera: currentCamera
                                    },
                                    margin: { t: 40, r: 40, b: 40, l: 50 },
                                    autosize: true
                                }}
                                onRelayout={(e) => {
                                    if (e['scene.camera']) {
                                        setCurrentCamera(e['scene.camera']);
                                    }
                                }}
                                className="w-100 h-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="plot-section text-center">
                <h5 className="slider-label">Adjust Beta1 & Beta2:</h5>
                <div className="slider-section">
                    <div>
                        <label htmlFor="beta1Slider" className="form-label slider-label">Beta 1</label>
                        <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={beta1}
                            onChange={(e) => setBeta1(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label htmlFor="beta2Slider" className="form-label slider-label">Beta 2</label>
                        <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.1"
                            value={beta2}
                            onChange={(e) => setBeta2(parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlotApp;
