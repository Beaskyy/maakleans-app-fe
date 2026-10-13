const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error?: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('maakleans_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    // If token invalid, redirect to login unless already on login page
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('maakleans_token');
      localStorage.removeItem('maakleans_user');
      window.location.href = '/login';
    }
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error || `Request failed with status ${response.status}`);
  }

  return json;
}

// Download PDF helper
export async function downloadInvoicePdf(orderId: string, orderNumber: string) {
  const token = localStorage.getItem('maakleans_token');
  const res = await fetch(`${API_BASE}/orders/${orderId}/invoice-pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to generate PDF');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// CSV export helper
export async function downloadCsvReport() {
  const token = localStorage.getItem('maakleans_token');
  const res = await fetch(`${API_BASE}/reports/export-csv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to export CSV');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maakleans-orders-report-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
