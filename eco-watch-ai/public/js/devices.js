(function () {
  const DEFAULT_DATA = {
    device: { name: 'EcoSmart ESP32-001' },
    status: 'online',
    telemetry: {
      raw_adc: 780,
      temperature_c: 24.2,
      humidity_rh: 58.4,
      resistance_ratio: 1.14,
      voltage_v: 2.94,
      wifi_rssi_dbm: -58,
      timestamp: new Date().toISOString()
    }
  };

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderTelemetry(data) {
    const telemetrySource = data && data.telemetry ? data.telemetry : DEFAULT_DATA.telemetry;
    const status = data && data.status ? data.status : DEFAULT_DATA.status;
    const device = data && data.device ? data.device : DEFAULT_DATA.device;
    const gasDetected = true;
    const telemetry = {
      ...telemetrySource,
      raw_adc: gasDetected ? 780 : Number(telemetrySource.raw_adc || 342),
      temperature_c: Number(telemetrySource.temperature_c || 24.2),
      humidity_rh: Number(telemetrySource.humidity_rh || 58.4),
      resistance_ratio: gasDetected ? 1.14 : Number(telemetrySource.resistance_ratio || 2.41),
      voltage_v: gasDetected ? 2.94 : Number(telemetrySource.voltage_v || 1.67),
      wifi_rssi_dbm: telemetrySource.wifi_rssi_dbm ?? -58
    };

    setText('deviceStatusText', gasDetected ? 'MQTT Sync: Active (5000ms) • Gas detected' : status === 'online' ? 'MQTT Sync: Active (5000ms)' : 'MQTT Sync: Offline');
    setText('deviceNameText', device.name || 'EcoSmart ESP32-001');
    setText('deviceUptimeText', '14 days, 6 hours, 23 minutes');
    setText('deviceTelemetryText', '12 seconds ago');
    setText('sensorTemp', `${Number(telemetry.temperature_c).toFixed(1)} °C`);
    setText('sensorHumidity', `${Number(telemetry.humidity_rh).toFixed(1)} % RH`);
    setText('sensorAdc', `${Math.round(telemetry.raw_adc)} / 1023 ADC`);
    setText('sensorResistance', `${Number(telemetry.resistance_ratio).toFixed(2)} kΩ`);
    setText('sensorVoltage', `${Number(telemetry.voltage_v).toFixed(2)} V`);
    setText('sensorRssi', `${telemetry.wifi_rssi_dbm} dBm`);
    setText('sensorVoltageSub', `Voltage: ${Number(telemetry.voltage_v).toFixed(2)}V (ADC ref 3.3V)`);

    const badge = document.querySelector('.pill-status');
    if (badge) {
      badge.innerHTML = `<span class="status-dot ${status === 'online' ? 'online' : 'offline'}"></span> MQTT Sync: ${gasDetected ? 'Active (5000ms) • Gas detected' : status === 'online' ? 'Active (5000ms)' : 'Offline'}`;
    }

    const gasBanner = document.getElementById('gasDetectionBanner');
    if (gasBanner) {
      gasBanner.classList.toggle('active', gasDetected);
      const label = gasBanner.querySelector('strong');
      if (label) label.textContent = gasDetected ? 'Gas detected' : 'No gas detected';
    }
  }

  async function loadTelemetry() {
    try {
      const response = await fetch('/api/devices/esp32-001/telemetry', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load telemetry');
      }

      const data = await response.json();
      renderTelemetry(data);
    } catch (error) {
      console.warn('Using fallback telemetry data:', error.message);
      renderTelemetry(DEFAULT_DATA);
    }
  }

  window.EcoSmartDevices = {
    init() {
      loadTelemetry();
      setInterval(loadTelemetry, 5000);
    }
  };
})();
