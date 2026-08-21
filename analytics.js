/**
 * BitAware - Analytics & Data Visualizations Subsystem
 * Uses Chart.js to render department metrics, categories breakdown, and resolution velocity.
 */

const analyticsModule = {
  categoryChart: null,
  statusChart: null,
  velocityChart: null,

  renderCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet');
      return;
    }
    this.renderCategoryChart();
    this.renderStatusChart();
    this.renderVelocityChart();
  },

  renderCategoryChart() {
    const canvas = document.getElementById('chart-categories');
    if (!canvas || typeof Chart === 'undefined') return;

    const complaints = window.dataStore.getAllComplaints();
    const counts = {};
    window.CIVIC_CATEGORIES.forEach(c => counts[c.name] = 0);

    complaints.forEach(item => {
      counts[item.categoryName] = (counts[item.categoryName] || 0) + 1;
    });

    const labels = Object.keys(counts).filter(k => counts[k] > 0);
    const data = labels.map(k => counts[k]);

    if (this.categoryChart) this.categoryChart.destroy();

    this.categoryChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, font: { size: 10 } }
          }
        },
        cutout: '70%'
      }
    });
  },

  renderStatusChart() {
    const canvas = document.getElementById('chart-statuses');
    if (!canvas || typeof Chart === 'undefined') return;

    const complaints = window.dataStore.getAllComplaints();
    const statusCounts = {
      'Submitted': 0,
      'Under Review': 0,
      'In Progress': 0,
      'Resolved': 0
    };

    complaints.forEach(c => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });

    if (this.statusChart) this.statusChart.destroy();

    this.statusChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: 'Complaints',
          data: Object.values(statusCounts),
          backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#10b981'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { ticks: { font: { size: 10 } }, grid: { display: false } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  renderVelocityChart() {
    const canvas = document.getElementById('chart-velocity');
    if (!canvas || typeof Chart === 'undefined') return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const resolvedData = [4, 6, 8, 5, 9, 12, 14];
    const reportedData = [7, 8, 6, 9, 11, 8, 10];

    if (this.velocityChart) this.velocityChart.destroy();

    this.velocityChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Resolved',
            data: resolvedData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2
          },
          {
            label: 'Reported',
            data: reportedData,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.35,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: '#f1f5f9' } },
          x: { ticks: { font: { size: 10 } }, grid: { display: false } }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 10, font: { size: 10 } }
          }
        }
      }
    });
  }
};

// Expose explicitly to window
window.analyticsModule = analyticsModule;