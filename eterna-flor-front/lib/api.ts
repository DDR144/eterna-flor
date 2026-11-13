/**
 * Base de la API. Se exporta para que ninguna pantalla repita la variable de
 * entorno sin respaldo: `process.env.NEXT_PUBLIC_API_URL` sin fallback produce
 * la URL literal "undefined/..." cuando no hay archivo de entorno, y el fallo
 * se vuelve invisible porque el `catch` lo convierte en estado vacío.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
}

/**
 * Cuerpo que el panel envía al crear o editar un ramo. El formulario arma este
 * objeto y la API lo recibe como multipart, así que el tipo describe lo que se
 * escribe, no lo que responde el servidor: por eso las respuestas que nadie
 * consume quedan como `unknown` en lugar de `any`.
 */
interface RamoPayload {
  nombre: string;
  tamano: string;
  precioVenta: number;
  stock?: number;
  recetas?: Array<{ materiaPrimaId: number; cantidad: number }>;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', ...fetchOptions } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error en la solicitud');
  }

  return response.json();
}

async function loginApi<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error en la solicitud');
  }

  const data = await response.json();
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      loginApi<{ user: { id: number; email: string }; token: string }>('/auth/login', { email, password }),
    logout: () => {
      setToken(null);
      return fetchApi<{ message: string }>('/auth/logout', { method: 'POST' });
    },
    register: (email: string, password: string) =>
      fetchApi<{ id: number; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    profile: () =>
      fetchApi<{ id: number; email: string; createdAt: string }>('/auth/profile'),
  },

  materiasPrimas: {
    getAll: () =>
      fetchApi<
        Array<{
          id: number;
          nombre: string;
          unidad: string;
          stockActual: number;
          costoUnitario: number;
          stockMinimoAlerta: number;
          createdAt: string;
          alertaStock: boolean;
        }>
      >('/materias-primas'),
    getById: (id: number) =>
      fetchApi<{
        id: number;
        nombre: string;
        unidad: string;
        stockActual: number;
        costoUnitario: number;
        stockMinimoAlerta: number;
        alertaStock: boolean;
      }>(`/materias-primas/${id}`),
    create: (data: {
      nombre: string;
      unidad: string;
      stockActual: number;
      costoUnitario: number;
      stockMinimoAlerta?: number;
    }) => fetchApi<unknown>('/materias-primas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{
      nombre: string;
      unidad: string;
      stockActual: number;
      costoUnitario: number;
      stockMinimoAlerta: number;
    }>) => fetchApi<unknown>(`/materias-primas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi<unknown>(`/materias-primas/${id}`, { method: 'DELETE' }),
    getAlertas: () => fetchApi<unknown[]>('/materias-primas/alertas'),
  },

  ramos: {
    getAll: () =>
      fetchApi<
        Array<{
          id: number;
          nombre: string;
          tamano: string;
          fotoUrl: string | null;
          precioVenta: number;
          costoCalculado: number;
          stock: number;
          activo: boolean;
          margen: number;
          alertaStock: boolean;
          createdAt: string;
          recetas: Array<{
            id: number;
            cantidad: number;
            materiaPrima: {
              id: number;
              nombre: string;
              stockActual: number;
            };
          }>;
        }>
      >('/ramos'),
    getById: (id: number) => fetchApi<unknown>(`/ramos/${id}`),
    create: async (data: RamoPayload, foto?: File) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('nombre', data.nombre);
      formData.append('tamano', data.tamano);
      formData.append('precioVenta', String(data.precioVenta));
      if (data.stock) formData.append('stock', String(data.stock));
      if (data.recetas) formData.append('recetas', JSON.stringify(data.recetas));
      if (foto) formData.append('foto', foto);

      const response = await fetch(`${API_URL}/ramos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Error creando ramo');
      return response.json();
    },
    update: async (id: number, data: RamoPayload, foto?: File) => {
      const token = getToken();
      const formData = new FormData();
      if (data.nombre) formData.append('nombre', data.nombre);
      if (data.tamano) formData.append('tamano', data.tamano);
      if (data.precioVenta) formData.append('precioVenta', String(data.precioVenta));
      if (data.stock !== undefined) formData.append('stock', String(data.stock));
      if (data.recetas) formData.append('recetas', JSON.stringify(data.recetas));
      if (foto) formData.append('foto', foto);

      const response = await fetch(`${API_URL}/ramos/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Error actualizando ramo');
      return response.json();
    },
    delete: (id: number) => fetchApi<unknown>(`/ramos/${id}`, { method: 'DELETE' }),
    getAlertas: () => fetchApi<unknown[]>('/ramos/alertas'),
  },

  pedidos: {
    getAll: () =>
      fetchApi<
        Array<{
          id: number;
          clienteNombre: string;
          clienteWhatsapp: string;
          estado: string;
          metodoPago: string | null;
          montoTotal: number;
          fechaEntrega: string | null;
          createdAt: string;
          pedidoItems: Array<{
            id: number;
            cantidad: number;
            precioUnitario: number;
            ramo: { id: number; nombre: string; tamano: string };
          }>;
        }>
      >('/pedidos'),
    getById: (id: number) => fetchApi<unknown>(`/pedidos/${id}`),
    create: (data: {
      clienteNombre: string;
      clienteWhatsapp: string;
      metodoPago?: string | null;
      fechaEntrega?: string | null;
      items: Array<{ ramoId: number; cantidad: number }>;
    }) => fetchApi<unknown>('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { estado?: string }) =>
      fetchApi<unknown>(`/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi<unknown>(`/pedidos/${id}`, { method: 'DELETE' }),
  },
};