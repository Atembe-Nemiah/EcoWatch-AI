(function () {
  const API_BASE = '';

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const payload = await response.json();
        errorMessage = payload.error || payload.message || errorMessage;
      } catch (err) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  window.EcoSmartAPI = {
    async getDashboardSummary() {
      return request('/api/dashboard/summary');
    },
    async getReports(query = {}) {
      const params = new URLSearchParams(query);
      return request(`/api/reports?${params.toString()}`);
    }
  };
})();
