import axios from 'axios';

// Tipos personalizados
type UserProfile = {
  name?: string;
  bio?: string;
  phone?: string;
};

type Preferences = {
  language: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  timezone: string;
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar JWT
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para errores
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Error en la petición API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const api = Object.assign(instance, {
  // 🔐 Autenticación y registro
  register: (name: string, email: string, password: string) =>
    instance.post('/api/users/register', { name, email, password }),

  login: (email: string, password: string) =>
    instance.post('/api/auth/login', { email, password }),

  getProfile: () => instance.get('/api/auth/profile'),

  // 👤 Perfil de usuario
  getUserProfile: () => instance.get('api/profiles/pro'),
  updateUserProfile: (data: UserProfile) => instance.put('api/profiles/pro', data),
  createUserProfile: (data?: UserProfile) =>
    instance.post('api/profiles/pro', data ?? {}),

  // 🔄 Recuperación de contraseña
  requestPasswordRecovery: (email: string) =>
    instance.post('/api/recovery/request', { email }),
  resetPassword: (token: string, newPassword: string) =>
    instance.post('/api/recovery/reset', { token, newPassword }),

  // ⚙️ Preferencias
  getPreferences: () => instance.get('/api/preferences/me'),
  updatePreferences: (data: Preferences) => instance.put('/api/preferences/me', data),
  resetPreferences: () => instance.post('/api/preferences/reset'),

  // 🔐 RBAC
  getAllRoles: () => instance.get('/api/rbac/roles'),
  assignRoleToUser: (userId: string, role: string) =>
    instance.post('/api/rbac/assign-role', { userId, role }),
  getUserRole: (userId: string) =>
    instance.get(`/api/rbac/user/${userId}/roles`),
  checkUserPermission: (permission: string) =>
    instance.get(`/api/rbac/check?permission=${permission}`),

  // 🛫 Catálogo de Rutas (GraphQL)
  getRoutesCatalog: () =>
    instance.post('/routes', {
      query: `query {
        getRoutes {
          id
          name
          segments {
            id
            origin
            destination
            distanceKm
          }
        }
      }`,
    }),

  createRoute: (origin: string, destination: string, distance_km: number) =>
    instance.post('/routes', {
      query: `
        mutation CreateRoute($name: String!, $segmentsData: [SegmentInput!]!) {
          createRoute(name: $name, segmentsData: $segmentsData) {
            id
          }
        }
      `,
      variables: {
        name: `${origin}-${destination}`,
        segmentsData: [
          {
            origin,
            destination,
            distanceKm: distance_km,
          },
        ],
      },
    }),

  createRouteWithSegments: (
    name: string,
    segments: { origin: string; destination: string; distanceKm: number }[]
  ) =>
    instance.post('/routes', {
      query: `
        mutation CreateRoute($name: String!, $segmentsData: [SegmentInput!]!) {
          createRoute(name: $name, segmentsData: $segmentsData) {
            id
          }
        }
      `,
      variables: {
        name,
        segmentsData: segments,
      },
    }),

  // ✈️ Catálogo de Vuelos (GraphQL)
  getFlightsCatalog: () =>
    instance.post('/flight-catalog', {
      query: `query {
        getFlights {
          id
          code
          origin
          destination
          departureTime
        }
      }`,
    }),

  createFlight: (
    code: string,
    origin: string,
    destination: string,
    departureTime: string
  ) =>
    instance.post('/flight-catalog', {
      query: `mutation {
        createFlight(
          code: "${code}",
          origin: "${origin}",
          destination: "${destination}",
          departureTime: "${departureTime}"
        ) {
          id
        }
      }`,
    }),

  // 🎫 Disponibilidad de Asientos (GraphQL)
  getAvailableSeats: (flightId: number) =>
    instance.post('/seat', {
      query: `
        query GetAvailableSeats($id: Int!) {
          availableSeats(flightId: $id) {
            id
            seatNumber
            isAvailable
          }
        }
      `,
      variables: { id: flightId },
    }),

  createSeat: (flightId: number, seatNumber: string) =>
    instance.post('/seat', {
      query: `
        mutation CreateSeat($flightId: Int!, $seatNumber: String!) {
          createSeat(flightId: $flightId, seatNumber: $seatNumber) {
            id
          }
        }
      `,
      variables: { flightId, seatNumber },
    }),

  deleteSeat: (seatId: number) =>
    instance.post('/seat', {
      query: `
        mutation DeleteSeat($seatId: Int!) {
          deleteSeat(seatId: $seatId)
        }
      `,
      variables: { seatId },
    }),

  updateSeat: (
    seatId: number,
    data: { seatNumber: string; isAvailable: boolean }
  ) =>
    instance.post('/seat', {
      query: `
        mutation UpdateSeat($seatId: Int!, $seatNumber: String!, $isAvailable: Boolean!) {
          updateSeat(seatId: $seatId, seatNumber: $seatNumber, isAvailable: $isAvailable) {
            id
          }
        }
      `,
      variables: {
        seatId,
        seatNumber: data.seatNumber,
        isAvailable: data.isAvailable,
      },
    }),

  // 🛬 Catálogo de Aeropuertos (GraphQL)
  getAirportsCatalog: () =>
    instance.post('/airport', {
      query: `query {
        airports {
          id
          name
          city
          country
          iataCode
        }
      }`,
    }),

  createAirport: (name: string, city: string, country: string, iataCode: string) =>
    instance.post('/airport', {
      query: `
        mutation CreateAirport($name: String!, $city: String!, $country: String!, $iataCode: String!) {
          createAirport(name: $name, city: $city, country: $country, iataCode: $iataCode) {
            id
            name
            city
            country
            iataCode
          }
        }
      `,
      variables: { name, city, country, iataCode },
    }),

  updateAirport: (id: number, name: string, city: string, country: string, iataCode: string) =>
    instance.post('/airport', {
      query: `
        mutation UpdateAirport($id: Int!, $name: String!, $city: String!, $country: String!, $iataCode: String!) {
          updateAirport(id: $id, name: $name, city: $city, country: $country, iataCode: $iataCode) {
            id
            name
            city
            country
            iataCode
          }
        }
      `,
      variables: { id, name, city, country, iataCode },
    }),

  deleteAirport: (id: number) =>
    instance.post('/airport', {
      query: `
        mutation DeleteAirport($id: Int!) {
          deleteAirport(id: $id)
        }
      `,
      variables: { id },
    }),

  // 💲 Reglas de Precios (GraphQL)
  getPricingRules: () =>
    instance.post('/pricing', {
      query: `
        query {
          pricingRules {
            id
            ruleName
            basePrice
            multiplier
          }
        }
      `,
    }),

  createPricingRule: (ruleName: string, basePrice: number, multiplier: number) =>
    instance.post('/pricing', {
      query: `
        mutation CreateRule($ruleName: String!, $basePrice: Float!, $multiplier: Float!) {
          createPricingRule(ruleName: $ruleName, basePrice: $basePrice, multiplier: $multiplier) {
            id
            ruleName
            basePrice
            multiplier
          }
        }
      `,
      variables: { ruleName, basePrice, multiplier },
    }),
});

export { api };
