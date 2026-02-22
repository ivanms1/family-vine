type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(
      body.error || body.message || `Request failed with status ${response.status}`
    );
    (error as Error & { status: number }).status = response.status;
    throw error;
  }
  return response.json();
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

export const apiClient = {
  async get<T>(
    path: string,
    params?: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'same-origin',
      signal: options?.signal,
    });
    return handleResponse<T>(response);
  },

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'same-origin',
      signal: options?.signal,
    });
    return handleResponse<T>(response);
  },
};
