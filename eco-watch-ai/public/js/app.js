(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-item'));

  function activateNav(hash) {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === hash || (hash === '#' && link.getAttribute('href') === '#/');
      link.classList.toggle('active', isActive);
    });
  }

  function route() {
    const hash = window.location.hash || '#/';
    activateNav(hash);

    const content = document.getElementById('pageContent');
    if (!content) return;

    if (hash === '#/' || hash === '') {
      if (window.EcoSmartDashboard) {
        window.EcoSmartDashboard.renderOverview();
      }
      return;
    }

    if (hash === '#/analysis') {
      content.innerHTML = `
        <div class="analysis-page-shell">
          <div class="analysis-page-header">
            <div class="analysis-sheet-title">
              <span class="section-mark">🤖</span>
              <div>
                <h1>AI Waste Analysis</h1>
                <h2>& Diagnostics</h2>
              </div>
            </div>

            <div class="analysis-page-actions">
              <div class="ai-status-pill">
                <span class="status-dot online"></span>
                <span>Live</span>
              </div>
              <div class="analysis-badge small">Inference</div>
              <div class="analysis-badge">Latency: 42ms</div>
              <div class="analysis-badge">Throughput: 12.8 t/h</div>
              <div class="header-search-compact">
                <span>🔍</span>
                <input type="text" value="Search batch, material, ..." aria-label="Search analysis" />
              </div>
              <button class="icon-button" aria-label="Notifications">🔔</button>
              <div class="header-user minimal">
                <div class="user-avatar-sm">A</div>
                <div class="user-info-sm">
                  <span class="user-name-sm">Admin</span>
                  <span class="user-role-sm">Lead</span>
                </div>
              </div>
            </div>
          </div>

          <div class="analysis-main-panel">
            <div class="analysis-topbar">
              <div class="report-breadcrumb">Waste Analysis & Diagnostics</div>
            </div>

            <div class="analysis-timeline">
              <div class="timeline-step complete">
                <div class="step-bullet">1</div>
                <div class="step-copy">
                  <strong>Waste Upload & Capture</strong>
                  <span>Completed • 14:04</span>
                </div>
              </div>
              <div class="timeline-step complete">
                <div class="step-bullet">2</div>
                <div class="step-copy">
                  <strong>Deep Vision Inference</strong>
                  <span>Completed • 14:04</span>
                </div>
              </div>
              <div class="timeline-step active">
                <div class="step-bullet">3</div>
                <div class="step-copy">
                  <strong>Recovery Pathway</strong>
                  <span>Direct Match</span>
                </div>
              </div>
              <div class="timeline-step">
                <div class="step-bullet">4</div>
                <div class="step-copy">
                  <strong>Human Dispatch</strong>
                  <span>Awaiting Sign-Off</span>
                </div>
              </div>
            </div>

            <div class="analysis-layout">
              <div class="analysis-left-panel">
                <div class="subheader-row">
                  <div class="label-block">
                    <span class="tiny-tag success">Live</span>
                    <span class="subheader-text">Submitted Specimen & Computer Vision</span>
                  </div>
                  <div class="status-text muted">Processing specimen from Hopper B</div>
                </div>

                <div class="inspection-card">
                  <div class="inspection-image-wrap">
                    <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80" alt="Waste specimen" />
                    <div class="overlay-pill orange">Uncoated Kraft Pulp Container (88.6%)</div>
                    <div class="overlay-pill green">Organic Plant Scraps (4.2%)</div>
                    <div class="overlay-pill blue">PET Plastic Cap • Container</div>
                    <div class="inspection-box blue-box"></div>
                    <div class="inspection-box orange-box"></div>
                  </div>

                  <div class="spec-row">
                    <span>Specimen Origin</span>
                    <span>Campus Hop...</span>
                    <span>Capture</span>
                    <span>Source File</span>
                    <span>Optical Exposure</span>
                  </div>

                  <div class="spec-row values">
                    <span>Compost H...</span>
                    <span>Today</span>
                    <span>IMG_08942.jpg</span>
                    <span>Balanced (EV</span>
                    <span>0.2)</span>
                  </div>
                </div>

                <div class="analysis-meta-row">
                  <div class="meta-pill">
                    <span class="dot-plain"></span>
                    <span>Inference</span>
                  </div>
                  <div class="meta-pill">
                    <span>EcoVision MobileNet-v2 + Custom</span>
                  </div>
                  <div class="meta-pill muted-pill">
                    <span>Validated</span>
                  </div>
                </div>
              </div>

              <div class="analysis-right-panel">
                <div class="classification-card">
                  <div class="class-header">
                    <div class="tiny-badge dark">Primary Waste Classification</div>
                    <div class="tiny-badge light">Grade 1 Feedstock</div>
                  </div>
                  <div class="class-name">Predominantly Organic<br>Post-Consumer Biomass</div>
                  <div class="confidence-row">
                    <span>Uncertainty Score</span>
                    <strong>93.7%</strong>
                  </div>
                  <div class="risk-text">
                    <span class="risk-label">Visible Evidence Identified</span>
                    <p>Fibrous plant material with indistinguishable structures (leaf/stalk debris).</p>
                    <p>High moisture content visual sheen across 68% of food scrap surface zone.</p>
                    <p>Biodegradable unbleached fiber tray base (uncooked fruit matrix).</p>
                    <p class="warning-line"><strong>1x Minor non-organic contaminant detected:</strong> PET bottle cap ring.</p>
                  </div>
                  <div class="disclaimer-box">
                    Disclaimer: Visual image analysis identifies surface visual features and patterns. It cannot verify exact chemical composition, microbiological pathways, storage conditions, or specific safety protocols.
                  </div>
                </div>

                <div class="recommendation-card">
                  <div class="recommend-header">
                    <h3>Recommended Pathways</h3>
                    <span>Sorted by Yield</span>
                  </div>

                  <div class="pathway-row">
                    <div class="pathway-name">
                      <span class="pathway-tag green">Organic</span>
                      <div>
                        <strong>Community Aerobic</strong>
                        <small>Composting</small>
                      </div>
                    </div>
                    <span class="score">92%</span>
                  </div>

                  <div class="pathway-row secondary">
                    <div class="pathway-name">
                      <span class="pathway-tag muted">Biogas</span>
                      <div>
                        <strong>Biogas / Anaerobic</strong>
                        <small>Co-Digestion</small>
                      </div>
                    </div>
                    <span class="score">84%</span>
                  </div>
                </div>

                <div class="review-panel-card">
                  <div class="review-header">
                    <div class="review-title">
                      <span class="dot-status"></span>
                      <span>Human Review & Verification</span>
                    </div>
                    <span class="toggle-status">Sign-off</span>
                  </div>

                  <div class="review-body">
                    <div class="review-note">Operator review notes: cap flagged for removal prior to shredder.</div>
                    <button class="review-button">Confirm Classification & Route</button>
                    <div class="review-buttons-row">
                      <button class="outline-btn">Correct Classification</button>
                      <button class="outline-btn">Request Senior Review</button>
                    </div>
                    <div class="reviewer-name">Expert Telemetry JSON</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="log-panel">
              <div class="log-header">
                <div class="log-title-row">
                  <span class="log-icon">🛰️</span>
                  <h3>Recent Facility Inferences & Sorting Logs</h3>
                </div>
                <span class="log-meta">Real-time conveyor logging</span>
              </div>

              <div class="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Material Classification</th>
                      <th>Sensor Origin</th>
                      <th>Confidence</th>
                      <th>Prescribed Pathway</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#INF-3091</td>
                      <td>Cardboard Bailer Scrap & Corrugated Pulp</td>
                      <td>Soring Belt 1</td>
                      <td>96%</td>
                      <td>Closed-Loop Secondary Fibre Recycling</td>
                      <td><span class="status-badge green">Dispatched</span></td>
                      <td>Inspect</td>
                    </tr>
                    <tr>
                      <td>#INF-3090</td>
                      <td>Aluminium Beverage Cans (Non-ferrous)</td>
                      <td>Eddy Current Line</td>
                      <td>99%</td>
                      <td>Direct Smelting / Recovery</td>
                      <td><span class="status-badge green">Dispatched</span></td>
                      <td>Inspect</td>
                    </tr>
                    <tr>
                      <td>#INF-3089</td>
                      <td>E-waste PCB Multi-layer Fragment (FR4)</td>
                      <td>Demolition Chute</td>
                      <td>89%</td>
                      <td>Precious Metal Chemical Leaching Tank</td>
                      <td><span class="status-badge orange">Manual Diver</span></td>
                      <td>Inspect</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (hash === '#/recovery') {
      content.innerHTML = `
        <div class="recovery-page">
          <div class="recovery-header-bar">
            <div class="recovery-header-left">
              <div class="recovery-header-copy">
                <div class="recovery-kicker">EcoSmart Platform</div>
                <h1>Resource Recovery &amp; Valorization Management</h1>
              </div>
            </div>
            <div class="recovery-header-right">
              <button class="recovery-btn ghost">Calibrate</button>
              <button class="recovery-btn primary">Optimize</button>
            </div>
          </div>

          <div class="recovery-summary-panel">
            <div class="recovery-summary-card large">
              <div class="summary-label">Stage</div>
              <div class="summary-value">01</div>
              <div class="summary-copy">
                <strong>Waste Identification</strong>
                <span>Multi-spectral optical scan</span>
              </div>
            </div>
            <div class="recovery-summary-card">
              <div class="summary-label">Stage</div>
              <div class="summary-value">02</div>
              <div class="summary-copy">
                <strong>AI Classification</strong>
                <span>Source segregation</span>
              </div>
            </div>
            <div class="recovery-summary-card">
              <div class="summary-label">Stage</div>
              <div class="summary-value">03</div>
              <div class="summary-copy">
                <strong>Recovery Pathway</strong>
                <span>Dynamic batch routing</span>
              </div>
            </div>
            <div class="recovery-summary-card">
              <div class="summary-label">Stage</div>
              <div class="summary-value">04</div>
              <div class="summary-copy">
                <strong>Output Verification</strong>
                <span>Certified material recovery</span>
              </div>
            </div>
            <div class="recovery-summary-card">
              <div class="summary-label">Stage</div>
              <div class="summary-value">05</div>
              <div class="summary-copy">
                <strong>Closed Loop</strong>
                <span>Commercial valorization</span>
              </div>
            </div>
          </div>

          <div class="recovery-section">
            <div class="recovery-section-head">
              <div>
                <div class="mini-badge">EcoSmart 5-stage Chain Flow</div>
              </div>
              <div class="section-actions">
                <span class="chip">Yield</span>
                <span class="chip soft">Parameters</span>
              </div>
            </div>

            <div class="recovery-grid">
              <div class="route-card">
                <div class="route-card-head">
                  <span class="route-metric">Waste Identification</span>
                  <span class="route-score">99.4%</span>
                </div>
                <div class="route-body">
                  <div class="route-icon green">✦</div>
                  <div class="route-copy">
                    <h3>Organic Waste</h3>
                    <p>Food scraps, agricultural residues, and compostable biomass streams.</p>
                  </div>
                </div>
                <ul>
                  <li>High moisture &amp; nutrient density</li>
                  <li>Potential biogas and compost conversion</li>
                </ul>
              </div>

              <div class="route-card">
                <div class="route-card-head">
                  <span class="route-metric">AI Classification</span>
                  <span class="route-score">96.8%</span>
                </div>
                <div class="route-body">
                  <div class="route-icon blue">◌</div>
                  <div class="route-copy">
                    <h3>Material Segregation</h3>
                    <p>Automated sorting for plastics, organics, and metals by optical and sensor data.</p>
                  </div>
                </div>
                <ul>
                  <li>Mechanical separation and contamination detection</li>
                  <li>Real-time cascade stream routing</li>
                </ul>
              </div>

              <div class="route-card">
                <div class="route-card-head">
                  <span class="route-metric">Recovery Pathway</span>
                  <span class="route-score">92.1%</span>
                </div>
                <div class="route-body">
                  <div class="route-icon amber">◍</div>
                  <div class="route-copy">
                    <h3>Dynamic Batch Treatment</h3>
                    <p>Route to anaerobic digestion, mechanical recycling, or smelters based on material profile.</p>
                  </div>
                </div>
                <ul>
                  <li>Optimized for quality yield and carbon reduction</li>
                  <li>Adjusts by feedstock and facility constraint</li>
                </ul>
              </div>

              <div class="route-card">
                <div class="route-card-head">
                  <span class="route-metric">Output Verification</span>
                  <span class="route-score">98.2%</span>
                </div>
                <div class="route-body">
                  <div class="route-icon dark">◈</div>
                  <div class="route-copy">
                    <h3>Closed-Loop Products</h3>
                    <p>Recovered secondary feedstock, compost, pellets, metals, and energy co-products.</p>
                  </div>
                </div>
                <ul>
                  <li>Certified material output assurance</li>
                  <li>Traceable downstream circular value chain</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="recovery-main-grid">
            <div class="recovery-card large-card">
              <div class="recovery-card-head">
                <div class="route-title-wrap">
                  <span class="card-tag green">Biomass Valorization</span>
                  <h3>Organic Waste → Composting &amp; Anaerobic Digestion</h3>
                </div>
                <span class="small-label">Assigned: Campus Composting Facility</span>
              </div>

              <div class="recovery-card-body">
                <div class="recovery-steps">
                  <div class="step-block">
                    <span class="step-label">Input Material</span>
                    <p>Food scraps, agricultural residues, mixed green waste.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Recovery Process</span>
                    <p>Controlled thermophilic digestion and aerobic stabilization.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Potential Output</span>
                    <p>High-nutrient compost, stabilized digestate, biogas.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Environmental Benefit</span>
                    <p>Significant methane avoidance and soil restoration value.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="recovery-card large-card">
              <div class="recovery-card-head">
                <div class="route-title-wrap">
                  <span class="card-tag blue">Polymeric Recovery</span>
                  <h3>Thermoplastics → Mechanical Recycling</h3>
                </div>
                <span class="small-label">Assigned: North Metro Materials</span>
              </div>

              <div class="recovery-card-body">
                <div class="recovery-steps">
                  <div class="step-block">
                    <span class="step-label">Input Material</span>
                    <p>Post-consumer beverage bottles, rigid packaging, films.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Recovery Process</span>
                    <p>Optical sorting, cleaning, granulation, extruded pellet production.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Potential Output</span>
                    <p>Recycled polymer pellets for packaging and industrial feedstock.</p>
                  </div>
                  <div class="step-block">
                    <span class="step-label">Environmental Benefit</span>
                    <p>Reduced landfill pressure and lower virgin resin demand.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="recovery-lower-grid">
            <div class="recovery-card">
              <div class="recovery-card-head compact">
                <div class="route-title-wrap">
                  <span class="card-tag dark">Paper &amp; Cellulose</span>
                  <h3>Paper → Fiber &amp; Cardboard Recovery</h3>
                </div>
              </div>

              <div class="recovery-card-body compact-body">
                <div class="route-body small-body">
                  <div class="route-icon green">▣</div>
                  <div class="route-copy">
                    <p>Recovered and deinked pulp cycle for carton and packaging grade fibers.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="recovery-card">
              <div class="recovery-card-head compact">
                <div class="route-title-wrap">
                  <span class="card-tag orange">Metals</span>
                  <h3>Aluminium &amp; Ferrous → Secondary Smelting</h3>
                </div>
              </div>

              <div class="recovery-card-body compact-body">
                <div class="route-body small-body">
                  <div class="route-icon amber">◬</div>
                  <div class="route-copy">
                    <p>Closed loop melter feed for structural and packaging grade metals.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="recovery-card">
              <div class="recovery-card-head compact">
                <div class="route-title-wrap">
                  <span class="card-tag teal">Energy Recovery</span>
                  <h3>Controlled Energy Recovery</h3>
                </div>
              </div>

              <div class="recovery-card-body compact-body">
                <div class="route-body small-body">
                  <div class="route-icon blue">◍</div>
                  <div class="route-copy">
                    <p>High-efficiency thermal recovery for non-recyclable fractions and industrial residues.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (hash === '#/devices') {
      content.innerHTML = `
        <div class="iot-monitor-page">
          <div class="iot-topbar">
            <div class="iot-breadcrumbs">
              <span>Hardware</span>
              <span class="crumb-sep">›</span>
              <span>Sensor Nodes</span>
              <span class="crumb-sep">›</span>
              <strong id="deviceNameText">EcoSmart ESP32-001</strong>
            </div>
            <div class="iot-actions">
              <div class="pill-status" id="deviceStatusText"><span class="status-dot online"></span> MQTT Sync: Active (5000ms)</div>
              <button class="mini-icon">◌</button>
              <button class="mini-icon">⎇</button>
              <div class="mini-user">
                <div class="user-avatar-sm">A</div>
                <div class="user-info-sm">
                  <span class="user-name-sm">Admin</span>
                  <span class="user-role-sm">Lead Instrumentation</span>
                </div>
              </div>
            </div>
          </div>

          <div class="iot-page-shell">
            <div class="iot-header-row">
              <div class="iot-header-left">
                <div class="iot-hero-title">
                  <span class="iot-hero-icon">◌</span>
                  <h1>IoT Hardware Telemetry & Sensor Nodes</h1>
                </div>
              </div>
              <div class="iot-header-right">
                <div class="iot-node-pills">
                  <span class="iot-pill small muted">Node Online</span>
                  <span class="iot-pill small">Alpha Node #1</span>
                  <span class="iot-pill small muted">Sync Buffer</span>
                </div>
              </div>
            </div>

            <div class="iot-feature-card">
              <div class="spec-block">
                <div class="spec-label">TECHNICAL SPECIFICATION & SENSOR SCOPE</div>
                <p>The MQ-6 semiconductor sensor is calibrated for gaseous hydrocarbon response (principally LPG, propane, and butane). The experimental analog response curves show below reflect resistance changes (R/RO) under ambient conditions. They do not constitute methane gas concentration, quantitative biogas purity, energy yield estimation, or life-safety certified alarm monitoring.</p>
              </div>
            </div>

            <div class="gas-detection-banner" id="gasDetectionBanner">
              <div class="gas-warning-icon">⚠️</div>
              <div class="gas-warning-copy">
                <strong>Gas detected</strong>
                <span>Demo alert: MQ-6 sensor spike above baseline indicates combustible gas near the intake point.</span>
              </div>
              <span class="gas-warning-badge">ACTIVE DEMO</span>
            </div>

            <div class="iot-identity-card">
              <div class="iot-card-title-wrap">
                <div class="device-mark">◔</div>
                <div>
                  <h2 id="deviceNameTextLarge">EcoSmart ESP32-001</h2>
                  <small>Field Test Unit Alpha</small>
                </div>
              </div>
              <div class="device-meta-right">
                <span>Uptime</span>
                <strong id="deviceUptimeText">14 days, 6 hours, 23 minutes</strong>
                <span>Last Telemetry</span>
                <strong id="deviceTelemetryText">12 seconds ago</strong>
              </div>
            </div>

            <div class="iot-sensor-summary">
              <div class="sensor-card">
                <div class="sensor-avatar">◬</div>
                <div class="sensor-info">
                  <h3>Microcontroller</h3>
                  <p>Espressif ESP32-WROOM-32</p>
                  <small>Dual Core 240MHz + FreeRTOS</small>
                </div>
              </div>
              <div class="sensor-card">
                <div class="sensor-avatar">◬</div>
                <div class="sensor-info">
                  <h3>Primary Sensor</h3>
                  <p>Hanwei MQ-6 Gas Sensor</p>
                  <small>5.0V VCC / 3.3V ADC</small>
                </div>
              </div>
              <div class="sensor-card">
                <div class="sensor-avatar">◬</div>
                <div class="sensor-info">
                  <h3>Operation Voltage</h3>
                  <p id="sensorVoltage">5.0V VCC / 3.3V ADC</p>
                  <small id="sensorRssi">RSSI -58 dBm (Strong)</small>
                </div>
              </div>
              <div class="sensor-card">
                <div class="sensor-avatar">◬</div>
                <div class="sensor-info">
                  <h3>Connectivity</h3>
                  <p>WiFi 802.11 b/g/n</p>
                  <small id="sensorWifi">RSSI -58 dBm (Strong)</small>
                </div>
              </div>
            </div>

            <div class="iot-metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Experimental MQ-6 Response</div>
                <div class="metric-value" id="sensorAdc">342 <span>/ 1023 ADC</span></div>
                <div class="metric-sub" id="sensorVoltageSub">Voltage: 1.67V (ADC ref 3.3V)</div>
                <div class="metric-bar"><span style="width: 66%"></span></div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Sensor Resistance Ratio</div>
                <div class="metric-value" id="sensorResistance">2.41 <span>kΩ</span></div>
                <div class="metric-sub">Air baseline resistance = 10.0 kΩ</div>
                <div class="metric-sparkline"></div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Ambient Temperature</div>
                <div class="metric-value" id="sensorTemp">24.2 <span>°C</span></div>
                <div class="metric-sub">Tolerance: ±0.5 °C</div>
                <div class="metric-sparkline subtle"></div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Relative Humidity</div>
                <div class="metric-value" id="sensorHumidity">58.4 <span>% RH</span></div>
                <div class="metric-sub">Tolerance: ±2% RH</div>
                <div class="metric-check-row"><span class="check">✓</span> Active dynamic compensation</div>
              </div>
            </div>

            <div class="chart-panel">
              <div class="chart-toolbar">
                <div class="chart-title">Multi-Channel Telemetry Stream</div>
                <div class="chart-toggle-group">
                  <span class="chart-toggle active">Live Transmission</span>
                  <span class="chart-toggle">5h</span>
                  <span class="chart-toggle">1 Hour</span>
                  <span class="chart-toggle">24 Hours</span>
                  <span class="chart-toggle">7 Days</span>
                </div>
              </div>

              <div class="chart-legend">
                <span><i class="legend-line green"></i> Raw ADC Output (MQ-6)</span>
                <span><i class="legend-line gray"></i> R/R0 Normalized (x100)</span>
                <span><i class="legend-line blue"></i> Expected Ambient Tolerance Band</span>
                <span class="legend-note">Active Sampling: 12-bit SAR ADC</span>
              </div>

              <svg class="telemetry-svg" viewBox="0 0 980 260" preserveAspectRatio="none" aria-label="Telemetry chart">
                <defs>
                  <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#8cc7ae" stop-opacity="0.28"/>
                    <stop offset="100%" stop-color="#8cc7ae" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <g stroke="#d8e4dd" stroke-width="1">
                  <line x1="20" y1="30" x2="960" y2="30"/>
                  <line x1="20" y1="80" x2="960" y2="80"/>
                  <line x1="20" y1="130" x2="960" y2="130"/>
                  <line x1="20" y1="180" x2="960" y2="180"/>
                  <line x1="20" y1="230" x2="960" y2="230"/>
                </g>
                <g fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 170 C80 150, 120 120, 160 110 S240 100, 280 150 S360 190, 410 140 S500 90, 560 150 S660 110, 720 150 S820 120, 960 110" stroke="#6ea88f" stroke-width="2.5"/>
                  <path d="M20 150 C60 160, 130 185, 200 200 S300 120, 360 130 S430 180, 510 160 S620 120, 710 150 S865 195, 960 155" stroke="#9f9f9f" stroke-width="2" opacity="0.8"/>
                  <path d="M20 160 C150 120, 260 150, 340 140 S470 120, 540 140 S690 164, 790 150 S890 120, 960 142" stroke="#8bafd2" stroke-width="2" opacity="0.85" fill="none"/>
                </g>
                <g font-size="11" fill="#7d8c85" font-family="Inter, sans-serif">
                  <text x="20" y="245">14:28:00</text>
                  <text x="170" y="245">14:29:00</text>
                  <text x="320" y="245">14:30:00</text>
                  <text x="480" y="245">14:31:00</text>
                  <text x="640" y="245">14:32:00</text>
                </g>
              </svg>
            </div>

            <div class="iot-diagnostics-header">
              <div>
                <h3>Hardware Status & Device Diagnostics</h3>
                <small>Internal sub-system operational integrity & sensor loop parameters</small>
              </div>
              <span class="all-subsystems">All Subsystems Nominal</span>
            </div>

            <div class="iot-diagnostics-grid">
              <div class="diag-card">
                <div class="diag-icon">◃</div>
                <div class="diag-copy">
                  <h4>Heating Element Status</h4>
                  <p>Pre-heat Cycle Complete</p>
                  <small>48h burn-in validated • 5.0Ω</small>
                </div>
              </div>
              <div class="diag-card">
                <div class="diag-icon">◌</div>
                <div class="diag-copy">
                  <h4>Internal Heater Voltage (VHI)</h4>
                  <p>5.0V ± 0.04</p>
                  <small>Regulated via onboard LDO rail</small>
                </div>
              </div>
              <div class="diag-card">
                <div class="diag-icon">◍</div>
                <div class="diag-copy">
                  <h4>Power Supply Buffer</h4>
                  <p>Solar Battery Buffer</p>
                  <small>12.4V LifePo4 + 3.8% charge</small>
                </div>
              </div>
              <div class="diag-card">
                <div class="diag-icon">◊</div>
                <div class="diag-copy">
                  <h4>ADC Non-linearity Calibration</h4>
                  <p>Two-Point Factory Calibrated</p>
                  <small>Attenuation: 1:1.5 (0–3.6V range)</small>
                </div>
              </div>
            </div>

            <div class="iot-terminal">
              <div class="terminal-header">
                <div class="terminal-tabs">
                  <span class="terminal-tab active">●</span>
                  <span class="terminal-tab">●</span>
                  <span class="terminal-tab">●</span>
                </div>
                <div class="terminal-title">eco_telemetry_stream_ituY50</div>
                <div class="terminal-actions">
                  <span>Browse Stream</span>
                  <span>Download CSV</span>
                  <span>Reset Node</span>
                  <span class="run-btn">Run Sensor Diagnostic</span>
                </div>
              </div>
              <div class="terminal-body">
                <div class="terminal-log">
                  <span>[SYSTEM] Node connected via MQTT topic /sensors/echo/esp32_001/telemetry</span>
                  <span>[14:31:45] &lt;node_id: 'ESP32-001'&gt; sensor: 'MQ6', raw_adc: '342', ...</span>
                  <span>[14:31:50] &lt;node_id: 'ESP32-001'&gt; sensor: 'MQ6', raw_adc: '342', ...</span>
                  <span>[14:31:55] &lt;node_id: 'ESP32-001'&gt; sensor: 'MQ6', raw_adc: '342', ...</span>
                  <span>[14:32:00] &lt;node_id: 'ESP32-001'&gt; sensor: 'MQ6', raw_adc: '342', ...</span>
                  <span>Listening for incoming 500ms loop transmission...</span>
                </div>
                <div class="terminal-indicator">LATEST PACKET</div>
              </div>
            </div>

            <div class="iot-footer">
              <span>© EcoSmart IoT Core Engine • Telemetry Protocol MQTT v3.1</span>
              <span>Continuous Hardware Watchdog: Active (Timeout: 15,000ms)</span>
            </div>
          </div>
        </div>
      `;
      if (window.EcoSmartDevices) {
        window.EcoSmartDevices.init();
      }
      return;
    }

    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧭</div>
        <h3>Page in progress</h3>
        <p>The ${hash} view is being implemented.</p>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', function () {
    navLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        const href = this.getAttribute('href');
        window.location.hash = href;
      });
    });

    window.addEventListener('hashchange', route);
    route();

    const timeEl = document.getElementById('headerTime');
    if (timeEl) {
      const tick = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      };
      tick();
      setInterval(tick, 1000);
    }
  });
})();
