(function () {
  const dashboard = {
    async renderOverview() {
      const pageContent = document.getElementById('pageContent');
      if (!pageContent) return;

      pageContent.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading dashboard data…</p></div>';

      try {
        const summary = await window.EcoSmartAPI.getDashboardSummary();
        pageContent.innerHTML = this.getOverviewMarkup(summary);
        this.renderCharts(summary);
      } catch (error) {
        pageContent.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Dashboard unavailable</h3>
            <p>${error.message || 'Unable to load dashboard data right now.'}</p>
          </div>
        `;
      }
    },

    getOverviewMarkup(summary) {
      const categoryMap = {
        organic: { name: 'Organic', color: '#1f7b62' },
        plastic: { name: 'Plastic', color: '#2d7fe0' },
        paper: { name: 'Paper', color: '#f0ad4e' },
        metal: { name: 'Metal', color: '#6b7280' },
        glass: { name: 'Glass', color: '#0f9d8a' },
        mixed: { name: 'Mixed', color: '#8b5cf6' },
        hazardous: { name: 'Hazardous', color: '#ef4444' },
        unknown: { name: 'Unknown', color: '#9ca3af' }
      };

      const totalReports = Number(summary.totalReports || 0);
      const recoveryRate = Number(summary.recoveryRate || 0);
      const totalDevices = Number(summary.totalDevices || 0);
      const onlineDevices = Number(summary.devicesOnline || 0);
      const organicKg = Number(summary.organicWasteKg || 0);
      const recyclableKg = Number(summary.recyclableRecoveryKg || 0);
      const pendingAnalyses = Number(summary.pendingAnalyses || 0);
      const recentReports = Array.isArray(summary.recentReports) ? summary.recentReports.slice(0, 5) : [];
      const byCategory = Array.isArray(summary.reportsByCategory) ? summary.reportsByCategory : [];
      const latestTelemetry = summary.latestTelemetry || null;

      const categoryTotals = byCategory.reduce((acc, item) => {
        acc.push({
          label: categoryMap[item.category]?.name || item.category || 'Unknown',
          value: Number(item.count || 0),
          color: categoryMap[item.category]?.color || '#9ca3af'
        });
        return acc;
      }, []);

      const donutData = categoryTotals.length ? categoryTotals : [
        { label: 'Organic', value: 1, color: '#1f7b62' },
        { label: 'Plastic', value: 1, color: '#2d7fe0' },
        { label: 'Metal', value: 1, color: '#6b7280' }
      ];

      const recentRows = recentRowsMarkup(recentReports);
      const topCategories = categoryTotals.slice(0, 4);

      return `
        <div class="overview-shell">
          <div class="overview-main">
            <div class="page-header-block">
              <div>
                <h1 class="dashboard-title">Environmental Intelligence<br />Dashboard</h1>
                <p class="dashboard-subtitle">Monitor waste streams, discovered verified recovery opportunities, and track IoT environmental telemetry in real time.</p>
              </div>
              <div class="page-header-actions">
                <span class="soft-pill">Campus Engineering Department • Demo Data</span>
                <div class="cta-stack">
                  <span class="cta-label">Quick action</span>
                  <button class="primary-btn small">+ Submit Waste Report</button>
                </div>
              </div>
            </div>

            <div class="stat-grid">
              <div class="mini-stat-card">
                <div class="mini-stat-head">
                  <span class="mini-stat-label">Total Waste Reports</span>
                  <span class="mini-stat-icon mini-green">◌</span>
                </div>
                <div class="mini-stat-value">${this.formatNumber(totalReports)}</div>
                <div class="mini-stat-meta"><span class="positive">+12.4%</span> vs last month</div>
              </div>

              <div class="mini-stat-card">
                <div class="mini-stat-head">
                  <span class="mini-stat-label">Organic Waste Identified</span>
                  <span class="mini-stat-icon mini-amber">◌</span>
                </div>
                <div class="mini-stat-value">${organicKg.toFixed(0)} kg</div>
                <div class="mini-stat-meta"><span class="positive">40.8%</span> of total volume</div>
              </div>

              <div class="mini-stat-card">
                <div class="mini-stat-head">
                  <span class="mini-stat-label">Recyclable Materials</span>
                  <span class="mini-stat-icon mini-blue">◌</span>
                </div>
                <div class="mini-stat-value">${recyclableKg.toFixed(0)} kg</div>
                <div class="mini-stat-meta"><span class="positive">Sorted</span> batch recycling</div>
              </div>

              <div class="mini-stat-card">
                <div class="mini-stat-head">
                  <span class="mini-stat-label">Recovery Pathway</span>
                  <span class="mini-stat-icon mini-gray">◌</span>
                </div>
                <div class="mini-stat-value">${recoveryRate.toFixed(1)}%</div>
                <div class="mini-stat-meta"><span class="positive">Direct valorization</span> rate</div>
              </div>
            </div>

            <div class="insight-panel">
              <div class="panel-title-row">
                <div>
                  <h2>Waste Composition Analytics & Trends</h2>
                  <p>Real-time breakdown of campus-collected solid and organic fractions</p>
                </div>
                <div class="time-range-chip">7D 30D 90D</div>
              </div>
              <div class="analytics-layout">
                <div class="donut-side">
                  <div class="donut-wrapper">
                    <canvas id="wasteDonutChart" height="250"></canvas>
                  </div>
                  <div class="donut-legend">
                    ${donutData.map((item) => `
                      <div class="legend-item">
                        <span class="legend-swatch" style="background:${item.color};"></span>
                        <span>${item.label}</span>
                        <strong>${item.value}</strong>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div class="bar-side">
                  <div class="bar-header">
                    <span>Weekly Inspection</span>
                    <span class="muted">Cycle: Apr 2024</span>
                  </div>
                  <canvas id="wasteBarChart" height="250"></canvas>
                </div>
              </div>
            </div>

            <div class="panel-block opportunities-panel">
              <div class="panel-title-row">
                <div>
                  <h2>Waste-to-Value Opportunities</h2>
                  <p>Potential material valorization and processing routes mapped via AI classification</p>
                </div>
                <button class="secondary-btn tiny">AI Routes</button>
              </div>
              <div class="opportunity-grid">
                <div class="opportunity-card organic">
                  <span class="tag tag-organic">Organic Stream</span>
                  <h3>Composting & High-Quality Digestate</h3>
                  <p>Anaerobic digestion pathway for soil conditioning and renewable biogas yield.</p>
                  <div class="opportunity-meta">
                    <span>Estimated: 142 m²</span>
                    <span>Yield: 94%</span>
                  </div>
                </div>
                <div class="opportunity-card plastic">
                  <span class="tag tag-blue">Rigid & Film</span>
                  <h3>Mechanical Recycling</h3>
                  <p>Extrusion-granulation for circular packaging input and polymer pellet recovery.</p>
                  <div class="opportunity-meta">
                    <span>Material: PET, PP</span>
                    <span>Yield: 89%</span>
                  </div>
                </div>
                <div class="opportunity-card paper">
                  <span class="tag tag-amber">Paper & Fiber</span>
                  <h3>Clean Pulping & Recycling</h3>
                  <p>Recycled secondary moulded packaging with direct material recovery.</p>
                  <div class="opportunity-meta">
                    <span>Fibre retention</span>
                    <span>88.7%</span>
                  </div>
                </div>
                <div class="opportunity-card metal">
                  <span class="tag tag-gray">Ferrous & Non-Ferrous</span>
                  <h3>Secondary Smelting</h3>
                  <p>Recovered metal diverted to low-emission foundry feedstock operations.</p>
                  <div class="opportunity-meta">
                    <span>Energy savings</span>
                    <span>Up to 95%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel-block">
              <div class="panel-title-row">
                <div>
                  <h2>Recent Waste Reports</h2>
                  <p>Real-time updates and automated computer vision assessments</p>
                </div>
                <div class="chip-row">
                  <span class="filter-chip active">All</span>
                  <span class="filter-chip">Organic</span>
                  <span class="filter-chip">Plastic</span>
                  <span class="filter-chip">Metal</span>
                </div>
              </div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Category</th>
                      <th>Sample Location</th>
                      <th>Timestamp</th>
                      <th>AI Confidence</th>
                      <th>Recovery Route</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentRows}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside class="overview-side">
            <div class="side-card telemetry-card">
              <div class="panel-title-row compact">
                <h3>IoT Telemetry</h3>
                <span class="live-badge">Live</span>
              </div>
              <div class="telemetry-score">99.8%</div>
              <div class="telemetry-device">
                <div class="device-label">Device</div>
                <div class="device-name">EcoSmart ESP32-001</div>
              </div>
              <div class="device-subgrid">
                <div>
                  <span class="muted-label">Hardware</span>
                  <strong>ESP32-WROOM-32</strong>
                </div>
                <div>
                  <span class="muted-label">Sensor</span>
                  <strong>MQ-6</strong>
                </div>
              </div>
              <div class="reading-box">
                <div class="muted-label">Experimental MQ-6 response</div>
                <div class="reading-value">342 <span>ADC</span></div>
                <div class="reading-meta">Normal range: 1023 • 1.67V</div>
              </div>
            </div>

            <div class="side-card">
              <div class="panel-title-row compact">
                <h3>Activity Sample Map</h3>
              </div>
              <div class="mini-map">
                <div class="map-point p1"></div>
                <div class="map-point p2"></div>
                <div class="map-point p3"></div>
                <div class="map-point p4"></div>
              </div>
              <div class="map-list">
                <div>4 Active Campus Geotags</div>
                <div>10 sample demonstration incidents</div>
              </div>
            </div>
          </aside>
        </div>
      `;
    },

    renderCharts(summary) {
      const categoryTotals = Array.isArray(summary.reportsByCategory) ? summary.reportsByCategory : [];
      const categoryColors = ['#1f7b62', '#2d7fe0', '#f0ad4e', '#6b7280', '#0f9d8a', '#8b5cf6'];

      if (document.getElementById('wasteDonutChart')) {
        const donutCtx = document.getElementById('wasteDonutChart');
        new Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: categoryTotals.map(item => item.category || 'Unknown'),
            datasets: [{
              data: categoryTotals.map(item => Number(item.count || 0)),
              backgroundColor: categoryTotals.map((_, index) => categoryColors[index % categoryColors.length]),
              borderWidth: 0
            }]
          },
          options: {
            cutout: '62%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }
        });
      }

      if (document.getElementById('wasteBarChart')) {
        const barCtx = document.getElementById('wasteBarChart');
        new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              data: [180, 195, 210, 190, 150, 170, 120],
              backgroundColor: ['#1f7b62', '#1f7b62', '#1f7b62', '#2d7fe0', '#1f7b62', '#1f7b62', '#1f7b62'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { grid: { display: false } },
              y: { display: false }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    },

    formatNumber(value) {
      return new Intl.NumberFormat('en-US').format(Number(value || 0));
    }
  };

  function recentRowsMarkup(recentReports) {
    if (!recentReports.length) {
      return '<tr><td colspan="6"><div class="empty-state small">No recent reports found.</div></td></tr>';
    }

    return recentReports.map((report) => {
      const category = report.category || 'unknown';
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const status = report.status || 'submitted';
      const confidence = report.status === 'confirmed' ? '96%' : report.status === 'analysed' ? '94%' : '90%';
      const route = report.category === 'organic' ? 'Compost' : report.category === 'plastic' ? 'Recycling' : report.category === 'metal' ? 'Recovery' : 'Manual Sorting';

      return `
        <tr>
          <td>#${String(report.report_code || report.id || '').toUpperCase()}</td>
          <td><span class="label-pill ${category}">${categoryName}</span></td>
          <td>${report.location_label || 'Campus'}</td>
          <td>${new Date(report.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
          <td><span class="status-chip ${status}">${confidence}</span></td>
          <td>${route}</td>
        </tr>
      `;
    }).join('');
  }

  window.EcoSmartDashboard = dashboard;
})();
