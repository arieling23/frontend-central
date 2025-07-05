'use client';

import React, { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

type Airport = {
  id: number;
  name: string;
  city: string;
  country: string;
  iataCode: string;
};

type JwtPayload = {
  role: string;
  exp: number;
  iat: number;
};

export default function AirportInfoPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Estados para creación y edición
  const [newAirport, setNewAirport] = useState({
    name: '',
    city: '',
    country: '',
    iataCode: '',
  });
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);

  useEffect(() => {
    setIsClient(true);

    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (storedToken) {
      try {
        const decoded: JwtPayload = jwtDecode(storedToken);
        setRole(decoded.role);
      } catch {
        setRole(null);
      }
    }
  }, []);

  const fetchAirports = async () => {
    setLoading(true);
    setError(null);

    const query = `
      query {
        airports {
          id
          name
          city
          country
          iataCode
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:8081/api/airport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ query }),
      });

      const json = await response.json();

      if (json.errors) {
        setError(json.errors[0].message || 'Error desconocido');
        setAirports([]);
      } else {
        setAirports(json.data.airports);
      }
    } catch (e) {
      setError('Error de conexión con el servidor');
      setAirports([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchAirports();
    }
  }, [token]);

  // Crear aeropuerto
  const handleCreate = async () => {
    if (!newAirport.name || !newAirport.city || !newAirport.country || !newAirport.iataCode) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const mutation = `
      mutation CreateAirport($name: String!, $city: String!, $country: String!, $iataCode: String!) {
        createAirport(name: $name, city: $city, country: $country, iataCode: $iataCode) {
          id
          name
          city
          country
          iataCode
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:8081/api/airport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: newAirport,
        }),
      });

      const json = await response.json();

      if (json.errors) {
        alert('Error: ' + json.errors[0].message);
      } else {
        fetchAirports();
        setNewAirport({ name: '', city: '', country: '', iataCode: '' });
      }
    } catch (e) {
      alert('Error al crear aeropuerto');
    }
  };

  // Editar aeropuerto (solo estado local)
  const startEditing = (airport: Airport) => {
    setEditingAirport(airport);
  };

  const handleEditChange = (field: keyof Airport, value: string) => {
    if (!editingAirport) return;
    setEditingAirport({ ...editingAirport, [field]: value });
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!editingAirport) return;

    const mutation = `
      mutation UpdateAirport($id: Int!, $name: String!, $city: String!, $country: String!, $iataCode: String!) {
        updateAirport(id: $id, name: $name, city: $city, country: $country, iataCode: $iataCode) {
          id
          name
          city
          country
          iataCode
        }
      }
    `;

    try {
      const response = await fetch('http://localhost:8081/api/airport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: editingAirport,
        }),
      });

      const json = await response.json();

      if (json.errors) {
        alert('Error: ' + json.errors[0].message);
      } else {
        fetchAirports();
        setEditingAirport(null);
      }
    } catch (e) {
      alert('Error al actualizar aeropuerto');
    }
  };

  // Cancelar edición
  const cancelEdit = () => setEditingAirport(null);

  // Eliminar aeropuerto
  const deleteAirport = async (id: number) => {
    const mutation = `
      mutation DeleteAirport($id: Int!) {
        deleteAirport(id: $id)
      }
    `;

    try {
      const response = await fetch('http://localhost:8081/api/airport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { id },
        }),
      });

      const json = await response.json();

      if (json.errors) {
        alert('Error: ' + json.errors[0].message);
      } else {
        fetchAirports();
      }
    } catch (e) {
      alert('Error al eliminar aeropuerto');
    }
  };

  if (!isClient) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Listado de Aeropuertos</h1>

      {!token && <p className="text-red-500 mb-4">Debe iniciar sesión para ver los aeropuertos.</p>}

      {role === 'admin' && (
        <div className="mb-6 border p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Crear nuevo aeropuerto</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={newAirport.name}
            onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
            className="border p-1 mr-2 mb-2"
          />
          <input
            type="text"
            placeholder="Ciudad"
            value={newAirport.city}
            onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
            className="border p-1 mr-2 mb-2"
          />
          <input
            type="text"
            placeholder="País"
            value={newAirport.country}
            onChange={(e) => setNewAirport({ ...newAirport, country: e.target.value })}
            className="border p-1 mr-2 mb-2"
          />
          <input
            type="text"
            placeholder="Código IATA"
            value={newAirport.iataCode}
            onChange={(e) => setNewAirport({ ...newAirport, iataCode: e.target.value.toUpperCase() })}
            maxLength={3}
            className="border p-1 mr-2 mb-2 uppercase"
          />
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Crear Aeropuerto
          </button>
        </div>
      )}

      {loading && <p>Cargando aeropuertos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && airports.length === 0 && <p>No hay aeropuertos disponibles.</p>}

      <ul>
        {airports.map((airport) => (
          <li key={airport.id} className="border p-3 rounded mb-2 flex flex-col md:flex-row md:justify-between md:items-center">
            {editingAirport?.id === airport.id ? (
              <>
                <input
                  type="text"
                  value={editingAirport.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="border p-1 mb-1 md:mb-0 md:mr-2"
                />
                <input
                  type="text"
                  value={editingAirport.city}
                  onChange={(e) => handleEditChange('city', e.target.value)}
                  className="border p-1 mb-1 md:mb-0 md:mr-2"
                />
                <input
                  type="text"
                  value={editingAirport.country}
                  onChange={(e) => handleEditChange('country', e.target.value)}
                  className="border p-1 mb-1 md:mb-0 md:mr-2"
                />
                <input
                  type="text"
                  value={editingAirport.iataCode}
                  onChange={(e) => handleEditChange('iataCode', e.target.value.toUpperCase())}
                  maxLength={3}
                  className="border p-1 mb-1 md:mb-0 md:mr-2 uppercase"
                />
                <div className="flex space-x-2 mt-1 md:mt-0">
                  <button
                    onClick={saveEdit}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <strong>{airport.name}</strong> — {airport.city}, {airport.country} ({airport.iataCode})
                </div>
                {role === 'admin' && (
                  <div className="space-x-2 mt-2 md:mt-0">
                    <button
                      onClick={() => startEditing(airport)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteAirport(airport.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
