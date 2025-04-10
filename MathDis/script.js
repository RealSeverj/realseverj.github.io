// 图表配置和全局变量
let poissonChart, binomialChart, geometricChart, hypergeometricChart, 
    normalChart, exponentialChart, uniformChart;
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 800,
        easing: 'easeOutQuart'
    },
    plugins: {
        tooltip: {
            callbacks: {
                title: function(context) {
                    return `x = ${context[0].label}`;
                },
                label: function(context) {
                    return `P(X = ${context.label}) = ${context.formattedValue}`;
                }
            }
        },
        legend: {
            labels: {
                font: {
                    family: 'Roboto',
                    size: 14
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: '概率 P(X = x)',
                font: {
                    family: 'Roboto',
                    size: 14,
                    weight: 'bold'
                }
            },
            ticks: {
                font: {
                    family: 'Roboto',
                    size: 12
                }
            }
        },
        x: {
            title: {
                display: true,
                text: '随机变量值 (x)',
                font: {
                    family: 'Roboto',
                    size: 14,
                    weight: 'bold'
                }
            },
            ticks: {
                font: {
                    family: 'Roboto',
                    size: 12
                }
            }
        }
    }
};

// 连续分布的图表选项
const continuousChartOptions = {
    ...chartOptions,
    plugins: {
        ...chartOptions.plugins,
        tooltip: {
            callbacks: {
                title: function(context) {
                    return `x = ${context[0].label}`;
                },
                label: function(context) {
                    return `f(${context.label}) = ${context.formattedValue}`;
                }
            }
        }
    },
    scales: {
        ...chartOptions.scales,
        y: {
            ...chartOptions.scales.y,
            title: {
                display: true,
                text: '概率密度 f(x)',
                font: {
                    family: 'Roboto',
                    size: 14,
                    weight: 'bold'
                }
            }
        }
    }
};

// 页面加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    setupEventListeners();
    updateAll();
    
    // 添加页面载入动画
    document.querySelectorAll('.distribution-card').forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 300 + index * 100);
    });
    
    // 初始化二维图表
    initBivariatePlots();
});

// 初始化所有图表
function initCharts() {
    // 初始化泊松分布图表
    poissonChart = new Chart(
        document.getElementById('poisson-chart').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '泊松分布 PMF',
                    data: [],
                    backgroundColor: 'rgba(78, 205, 196, 0.6)',
                    borderColor: 'rgba(26, 83, 92, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        }
    );

    // 初始化二项分布图表
    binomialChart = new Chart(
        document.getElementById('binomial-chart').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '二项分布 PMF',
                    data: [],
                    backgroundColor: 'rgba(171, 131, 161, 0.6)',
                    borderColor: 'rgba(106, 5, 114, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        }
    );
    
    // 初始化几何分布图表
    geometricChart = new Chart(
        document.getElementById('geometric-chart').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '几何分布 PMF',
                    data: [],
                    backgroundColor: 'rgba(255, 107, 107, 0.6)',
                    borderColor: 'rgba(171, 39, 79, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        }
    );
    
    // 初始化超几何分布图表
    hypergeometricChart = new Chart(
        document.getElementById('hypergeometric-chart').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '超几何分布 PMF',
                    data: [],
                    backgroundColor: 'rgba(100, 162, 235, 0.6)',
                    borderColor: 'rgba(34, 87, 122, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        }
    );
    
    // 初始化正态分布图表
    normalChart = new Chart(
        document.getElementById('normal-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '正态分布 PDF',
                    data: [],
                    backgroundColor: 'rgba(45, 149, 150, 0.1)',
                    borderColor: 'rgba(45, 149, 150, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: continuousChartOptions
        }
    );
    
    // 初始化指数分布图表
    exponentialChart = new Chart(
        document.getElementById('exponential-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '指数分布 PDF',
                    data: [],
                    backgroundColor: 'rgba(255, 173, 96, 0.1)',
                    borderColor: 'rgba(214, 93, 14, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                }]
            },
            options: continuousChartOptions
        }
    );
    
    // 初始化均匀分布图表
    uniformChart = new Chart(
        document.getElementById('uniform-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '均匀分布 PDF',
                    data: [],
                    backgroundColor: 'rgba(130, 110, 174, 0.1)',
                    borderColor: 'rgba(87, 75, 144, 1)',
                    borderWidth: 2,
                    tension: 0,
                    fill: true,
                    pointRadius: 0,
                    stepped: true
                }]
            },
            options: continuousChartOptions
        }
    );
}

// 设置事件监听器
function setupEventListeners() {
    // 泊松分布参数控制
    document.getElementById('poisson-lambda').addEventListener('input', function() {
        document.getElementById('poisson-lambda-value').textContent = parseFloat(this.value).toFixed(1);
        updatePoissonChart();
    });

    document.getElementById('poisson-max-k').addEventListener('input', function() {
        document.getElementById('poisson-max-k-value').textContent = this.value;
        updatePoissonChart();
    });

    // 二项分布参数控制
    document.getElementById('binomial-n').addEventListener('input', function() {
        document.getElementById('binomial-n-value').textContent = this.value;
        updateBinomialChart();
    });

    document.getElementById('binomial-p').addEventListener('input', function() {
        document.getElementById('binomial-p-value').textContent = parseFloat(this.value).toFixed(2);
        updateBinomialChart();
    });
    
    // 几何分布参数控制
    document.getElementById('geometric-p').addEventListener('input', function() {
        document.getElementById('geometric-p-value').textContent = parseFloat(this.value).toFixed(2);
        updateGeometricChart();
    });
    
    document.getElementById('geometric-max-k').addEventListener('input', function() {
        document.getElementById('geometric-max-k-value').textContent = this.value;
        updateGeometricChart();
    });
    
    // 超几何分布参数控制
    document.getElementById('hyper-N').addEventListener('input', function() {
        const N = parseInt(this.value);
        document.getElementById('hyper-N-value').textContent = N;
        
        // 更新K和n的最大值，确保K和n不超过N
        const kInput = document.getElementById('hyper-K');
        const nInput = document.getElementById('hyper-n');
        
        kInput.max = N - 1;
        nInput.max = N - 1;
        
        if(parseInt(kInput.value) > N - 1) {
            kInput.value = N - 1;
            document.getElementById('hyper-K-value').textContent = N - 1;
        }
        
        if(parseInt(nInput.value) > N - 1) {
            nInput.value = N - 1;
            document.getElementById('hyper-n-value').textContent = N - 1;
        }
        
        updateHypergeometricChart();
    });
    
    document.getElementById('hyper-K').addEventListener('input', function() {
        document.getElementById('hyper-K-value').textContent = this.value;
        updateHypergeometricChart();
    });
    
    document.getElementById('hyper-n').addEventListener('input', function() {
        document.getElementById('hyper-n-value').textContent = this.value;
        updateHypergeometricChart();
    });
    
    // 正态分布参数控制
    document.getElementById('normal-mu').addEventListener('input', function() {
        document.getElementById('normal-mu-value').textContent = this.value;
        updateNormalChart();
    });
    
    document.getElementById('normal-sigma').addEventListener('input', function() {
        document.getElementById('normal-sigma-value').textContent = parseFloat(this.value).toFixed(1);
        updateNormalChart();
    });
    
    // 指数分布参数控制
    document.getElementById('exp-lambda').addEventListener('input', function() {
        document.getElementById('exp-lambda-value').textContent = parseFloat(this.value).toFixed(1);
        updateExponentialChart();
    });
    
    // 均匀分布参数控制
    document.getElementById('uniform-a').addEventListener('input', function() {
        const a = parseFloat(this.value);
        document.getElementById('uniform-a-value').textContent = a;
        
        // 确保a < b
        const bInput = document.getElementById('uniform-b');
        const b = parseFloat(bInput.value);
        
        if(a >= b) {
            bInput.value = a + 0.5;
            document.getElementById('uniform-b-value').textContent = parseFloat(a + 0.5).toFixed(1);
        }
        
        updateUniformChart();
    });
    
    document.getElementById('uniform-b').addEventListener('input', function() {
        const b = parseFloat(this.value);
        document.getElementById('uniform-b-value').textContent = parseFloat(b).toFixed(1);
        
        // 确保b > a
        const aInput = document.getElementById('uniform-a');
        const a = parseFloat(aInput.value);
        
        if(b <= a) {
            aInput.value = b - 0.5;
            document.getElementById('uniform-a-value').textContent = parseFloat(b - 0.5);
        }
        
        updateUniformChart();
    });
    
    // 二维正态分布参数控制
    document.getElementById('bivariate-rho').addEventListener('input', function() {
        document.getElementById('bivariate-rho-value').textContent = parseFloat(this.value).toFixed(2);
        updateBivariateNormalPlot();
    });
    
    document.getElementById('bivariate-sigma-x').addEventListener('input', function() {
        document.getElementById('bivariate-sigma-x-value').textContent = parseFloat(this.value).toFixed(1);
        updateBivariateNormalPlot();
    });
    
    document.getElementById('bivariate-sigma-y').addEventListener('input', function() {
        document.getElementById('bivariate-sigma-y-value').textContent = parseFloat(this.value).toFixed(1);
        updateBivariateNormalPlot();
    });
    
    // 二维均匀分布参数控制
    document.getElementById('bivariate-uniform-x-range').addEventListener('input', function() {
        document.getElementById('bivariate-uniform-x-range-value').textContent = this.value;
        updateBivariateUniformPlot();
    });
    
    document.getElementById('bivariate-uniform-y-range').addEventListener('input', function() {
        document.getElementById('bivariate-uniform-y-range-value').textContent = this.value;
        updateBivariateUniformPlot();
    });
}

// 计算泊松分布概率质量函数
function poissonPMF(lambda, k) {
    // P(X = k) = (e^(-lambda) * lambda^k) / k!
    return math.exp(-lambda) * math.pow(lambda, k) / math.factorial(k);
}

// 计算二项分布概率质量函数
function binomialPMF(n, p, k) {
    // P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
    return math.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// 计算几何分布概率质量函数
function geometricPMF(p, k) {
    // P(X = k) = (1-p)^(k-1) * p 
    // 这里k是表示首次成功出现在第k次试验
    return Math.pow(1 - p, k - 1) * p;
}

// 计算超几何分布概率质量函数
function hypergeometricPMF(N, K, n, k) {
    // P(X = k) = C(K,k) * C(N-K,n-k) / C(N,n)
    // 其中N是总体大小，K是总体中特定类型的项目数，n是样本大小
    // k是样本中特定类型的项目数，需满足: max(0, n-(N-K)) <= k <= min(n, K)
    // 使用math.js的组合函数
    if (k < Math.max(0, n - (N - K)) || k > Math.min(n, K)) {
        return 0;
    }
    
    const numerator = math.combinations(K, k) * math.combinations(N - K, n - k);
    const denominator = math.combinations(N, n);
    
    return numerator / denominator;
}

// 计算正态分布概率密度函数
function normalPDF(x, mu, sigma) {
    // f(x) = (1 / (sigma * sqrt(2*pi))) * e^(-((x-mu)^2 / (2*sigma^2)))
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
           Math.exp(-Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2)));
}

// 计算指数分布概率密度函数
function exponentialPDF(x, lambda) {
    // f(x) = lambda * e^(-lambda*x) for x >= 0
    if (x < 0) return 0;
    return lambda * Math.exp(-lambda * x);
}

// 计算均匀分布概率密度函数
function uniformPDF(x, a, b) {
    // f(x) = 1/(b-a) for a <= x <= b
    if (x < a || x > b) return 0;
    return 1 / (b - a);
}

// 计算二维正态分布概率密度函数
function bivariateNormalPDF(x, y, rho, sigmaX, sigmaY) {
    // f(x,y) = (1/(2*pi*sigmaX*sigmaY*sqrt(1-rho^2))) * 
    // exp(-1/(2*(1-rho^2)) * ((x/sigmaX)^2 - 2*rho*(x/sigmaX)*(y/sigmaY) + (y/sigmaY)^2))
    // 这里假设均值为0,0
    
    const z = (
        Math.pow(x / sigmaX, 2) - 
        2 * rho * (x / sigmaX) * (y / sigmaY) + 
        Math.pow(y / sigmaY, 2)
    ) / (2 * (1 - Math.pow(rho, 2)));
    
    const coef = 1 / (2 * Math.PI * sigmaX * sigmaY * Math.sqrt(1 - Math.pow(rho, 2)));
    
    return coef * Math.exp(-z);
}

// 更新泊松分布图表
function updatePoissonChart() {
    const lambda = parseFloat(document.getElementById('poisson-lambda').value);
    const maxK = parseInt(document.getElementById('poisson-max-k').value);
    
    const labels = Array.from({length: maxK + 1}, (_, i) => i.toString());
    const data = labels.map(k => poissonPMF(lambda, parseInt(k)));
    
    poissonChart.data.labels = labels;
    poissonChart.data.datasets[0].data = data;
    poissonChart.update();
    
    // 更新统计数据
    document.getElementById('poisson-mean').textContent = lambda.toFixed(2);
    document.getElementById('poisson-variance').textContent = lambda.toFixed(2);
}

// 更新二项分布图表
function updateBinomialChart() {
    const n = parseInt(document.getElementById('binomial-n').value);
    const p = parseFloat(document.getElementById('binomial-p').value);
    
    const labels = Array.from({length: n + 1}, (_, i) => i.toString());
    const data = labels.map(k => binomialPMF(n, p, parseInt(k)));
    
    binomialChart.data.labels = labels;
    binomialChart.data.datasets[0].data = data;
    binomialChart.update();
    
    // 更新统计数据
    const mean = n * p;
    const variance = n * p * (1 - p);
    document.getElementById('binomial-mean').textContent = mean.toFixed(2);
    document.getElementById('binomial-variance').textContent = variance.toFixed(2);
}

// 更新几何分布图表
function updateGeometricChart() {
    const p = parseFloat(document.getElementById('geometric-p').value);
    const maxK = parseInt(document.getElementById('geometric-max-k').value);
    
    // 几何分布是从k=1开始（首次成功出现在第k次试验）
    const labels = Array.from({length: maxK}, (_, i) => (i + 1).toString());
    const data = labels.map(k => geometricPMF(p, parseInt(k)));
    
    geometricChart.data.labels = labels;
    geometricChart.data.datasets[0].data = data;
    geometricChart.update();
    
    // 更新统计数据
    const mean = 1 / p;
    const variance = (1 - p) / Math.pow(p, 2);
    document.getElementById('geometric-mean').textContent = mean.toFixed(2);
    document.getElementById('geometric-variance').textContent = variance.toFixed(2);
}

// 更新超几何分布图表
function updateHypergeometricChart() {
    const N = parseInt(document.getElementById('hyper-N').value);
    const K = parseInt(document.getElementById('hyper-K').value);
    const n = parseInt(document.getElementById('hyper-n').value);
    
    // 计算可能的k值范围
    const minK = Math.max(0, n - (N - K));
    const maxK = Math.min(n, K);
    
    const labels = Array.from({length: maxK - minK + 1}, (_, i) => (i + minK).toString());
    const data = labels.map(k => hypergeometricPMF(N, K, n, parseInt(k)));
    
    hypergeometricChart.data.labels = labels;
    hypergeometricChart.data.datasets[0].data = data;
    hypergeometricChart.update();
    
    // 更新统计数据
    const mean = n * (K / N);
    const variance = n * (K / N) * (1 - K / N) * (N - n) / (N - 1);
    document.getElementById('hyper-mean').textContent = mean.toFixed(2);
    document.getElementById('hyper-variance').textContent = variance.toFixed(2);
}

// 更新正态分布图表
function updateNormalChart() {
    const mu = parseFloat(document.getElementById('normal-mu').value);
    const sigma = parseFloat(document.getElementById('normal-sigma').value);
    
    // 生成x轴范围： mu ± 4*sigma
    const minX = mu - 4 * sigma;
    const maxX = mu + 4 * sigma;
    const step = (maxX - minX) / 100;
    
    const labels = Array.from({length: 101}, (_, i) => (minX + i * step).toFixed(2));
    const data = labels.map(x => normalPDF(parseFloat(x), mu, sigma));
    
    normalChart.data.labels = labels;
    normalChart.data.datasets[0].data = data;
    normalChart.update();
    
    // 更新统计数据
    document.getElementById('normal-mean').textContent = mu.toFixed(2);
    document.getElementById('normal-variance').textContent = (sigma * sigma).toFixed(2);
}

// 更新指数分布图表
function updateExponentialChart() {
    const lambda = parseFloat(document.getElementById('exp-lambda').value);
    
    // 计算合适的x轴范围
    // 99%的概率质量位于x < -ln(0.01)/lambda = 4.6/lambda
    const maxX = Math.min(4.6 / lambda * 1.5, 20);
    const step = maxX / 100;
    
    const labels = Array.from({length: 101}, (_, i) => (i * step).toFixed(2));
    const data = labels.map(x => exponentialPDF(parseFloat(x), lambda));
    
    exponentialChart.data.labels = labels;
    exponentialChart.data.datasets[0].data = data;
    exponentialChart.update();
    
    // 更新统计数据
    document.getElementById('exp-mean').textContent = (1 / lambda).toFixed(2);
    document.getElementById('exp-variance').textContent = (1 / (lambda * lambda)).toFixed(2);
}

// 更新均匀分布图表
function updateUniformChart() {
    const a = parseFloat(document.getElementById('uniform-a').value);
    const b = parseFloat(document.getElementById('uniform-b').value);
    
    // 计算合适的x轴范围，包括a和b周围的一些空间
    const padding = (b - a) * 0.2;
    const minX = Math.min(a - padding, a);
    const maxX = Math.max(b + padding, b);
    const step = (maxX - minX) / 100;
    
    const labels = Array.from({length: 101}, (_, i) => (minX + i * step).toFixed(2));
    const data = labels.map(x => uniformPDF(parseFloat(x), a, b));
    
    uniformChart.data.labels = labels;
    uniformChart.data.datasets[0].data = data;
    uniformChart.update();
    
    // 更新统计数据
    const mean = (a + b) / 2;
    const variance = Math.pow(b - a, 2) / 12;
    document.getElementById('uniform-mean').textContent = mean.toFixed(2);
    document.getElementById('uniform-variance').textContent = variance.toFixed(2);
}

// 初始化二维图表
function initBivariatePlots() {
    updateBivariateNormalPlot();
    updateBivariateUniformPlot();
}

// 更新二维正态分布图表
function updateBivariateNormalPlot() {
    const rho = parseFloat(document.getElementById('bivariate-rho').value);
    const sigmaX = parseFloat(document.getElementById('bivariate-sigma-x').value);
    const sigmaY = parseFloat(document.getElementById('bivariate-sigma-y').value);
    
    // 计算协方差
    const covariance = rho * sigmaX * sigmaY;
    document.getElementById('bivariate-covariance').textContent = covariance.toFixed(2);
    
    // 生成数据
    const range = 3.0;  // 以标准差的倍数来设定范围
    const resolution = 50;  // 分辨率
    
    const x = math.range(-range * sigmaX, range * sigmaX, 2 * range * sigmaX / resolution).toArray();
    const y = math.range(-range * sigmaY, range * sigmaY, 2 * range * sigmaY / resolution).toArray();
    const z = [];
    
    for (let i = 0; i < y.length; i++) {
        const row = [];
        for (let j = 0; j < x.length; j++) {
            row.push(bivariateNormalPDF(x[j], y[i], rho, sigmaX, sigmaY));
        }
        z.push(row);
    }
    
    const data = [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: 'Viridis',
        contours: {
            z: {
                show: true,
                usecolormap: true,
                highlightcolor: "#42f462",
                project: {z: true}
            }
        }
    }];
    
    const layout = {
        title: '二维正态分布',
        scene: {
            xaxis: {title: 'X'},
            yaxis: {title: 'Y'},
            zaxis: {title: '概率密度'}
        },
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 30
        }
    };
    
    Plotly.newPlot('bivariate-normal-plot', data, layout);
}

// 更新二维均匀分布图表
function updateBivariateUniformPlot() {
    const xRange = parseInt(document.getElementById('bivariate-uniform-x-range').value);
    const yRange = parseInt(document.getElementById('bivariate-uniform-y-range').value);
    
    // 计算体积（概率密度的积分为1）
    const volume = xRange * yRange;
    document.getElementById('bivariate-uniform-volume').textContent = volume;
    
    // 生成数据
    const x = math.range(-xRange/2, xRange/2, xRange/50).toArray();
    const y = math.range(-yRange/2, yRange/2, yRange/50).toArray();
    const z = [];
    
    const height = 1 / volume;  // 均匀分布的高度
    
    // 创建Z值
    for (let i = 0; i < y.length; i++) {
        const row = [];
        for (let j = 0; j < x.length; j++) {
            // 如果在矩形区域内则为常数高度，否则为0
            const value = (Math.abs(x[j]) <= xRange/2 && Math.abs(y[i]) <= yRange/2) ? height : 0;
            row.push(value);
        }
        z.push(row);
    }
    
    const data = [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: [[0, 'rgb(220, 220, 220)'], [1, 'rgb(130, 110, 174)']],
        opacity: 0.8
    }];
    
    const layout = {
        title: '二维均匀分布',
        scene: {
            xaxis: {title: 'X', range: [-xRange * 0.7, xRange * 0.7]},
            yaxis: {title: 'Y', range: [-yRange * 0.7, yRange * 0.7]},
            zaxis: {title: '概率密度', range: [0, height * 1.2]}
        },
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 30
        }
    };
    
    Plotly.newPlot('bivariate-uniform-plot', data, layout);
}

// 更新所有图表
function updateAll() {
    // 离散分布
    updatePoissonChart();
    updateBinomialChart();
    updateGeometricChart();
    updateHypergeometricChart();
    
    // 连续分布
    updateNormalChart();
    updateExponentialChart();
    updateUniformChart();
}

// 添加平滑动画效果
document.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', function() {
        const thumb = this;
        thumb.style.transform = 'scale(1.2)';
        setTimeout(() => {
            thumb.style.transform = 'scale(1)';
        }, 100);
    });
});