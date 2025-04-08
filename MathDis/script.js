// 图表配置和全局变量
let poissonChart, binomialChart, comparisonChart;
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

// 页面加载完成时执行
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    setupEventListeners();
    updateAll();
    
    // 添加页面载入动画
    document.querySelectorAll('.distribution-card').forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 300);
    });
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

    // 初始化对比图表
    comparisonChart = new Chart(
        document.getElementById('comparison-chart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '泊松分布',
                        data: [],
                        borderColor: 'rgba(26, 83, 92, 1)',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: 'rgba(26, 83, 92, 1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: '二项分布',
                        data: [],
                        borderColor: 'rgba(106, 5, 114, 1)',
                        backgroundColor: 'rgba(171, 131, 161, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: 'rgba(106, 5, 114, 1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: Object.assign({}, chartOptions, {
                plugins: {
                    ...chartOptions.plugins,
                    legend: {
                        ...chartOptions.plugins.legend,
                        position: 'top'
                    }
                }
            })
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

    // 对比图参数控制
    document.getElementById('comparison-lambda').addEventListener('input', function() {
        document.getElementById('comparison-lambda-value').textContent = parseFloat(this.value).toFixed(1);
        updateComparisonChart();
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

// 更新对比图表
function updateComparisonChart() {
    const lambda = parseFloat(document.getElementById('comparison-lambda').value);
    
    // 为了对比，我们选择 n 足够大且 p 足够小，使得 n*p ≈ lambda
    const n = Math.max(100, Math.ceil(lambda * 5));
    const p = lambda / n;
    
    // 生成 x 坐标范围，可能的取值范围为 [0, ..., 最大可能值]
    // 假设使用 lambda + 3*sqrt(lambda) 作为上限，这通常涵盖了大部分的概率质量
    const maxK = Math.min(n, Math.ceil(lambda + 3 * Math.sqrt(lambda)));
    const labels = Array.from({length: maxK + 1}, (_, i) => i.toString());
    
    // 计算泊松分布和二项分布的概率质量
    const poissonData = labels.map(k => poissonPMF(lambda, parseInt(k)));
    const binomialData = labels.map(k => binomialPMF(n, p, parseInt(k)));
    
    comparisonChart.data.labels = labels;
    comparisonChart.data.datasets[0].data = poissonData;
    comparisonChart.data.datasets[1].data = binomialData;
    comparisonChart.update();
}

// 更新所有图表
function updateAll() {
    updatePoissonChart();
    updateBinomialChart();
    updateComparisonChart();
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