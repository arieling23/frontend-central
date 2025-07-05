'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  role: string;
  exp: number;
  iat: number;
};

export default function SeatAvailabilityPage() {
  const [flightId, setFlightId] = useState<number>(1);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSeatNumber, setNewSeatNumber] = useState('');
  const [editingSeat, setEditingSeat] = useState<any>(null);
  const [role, setRole] = useState('');

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const response = await api.getAvailableSeats(flightId);
      const seatData = response?.data?.data?.availableSeats;

      if (seatData && Array.isArray(seatData)) {
        setSeats(seatData);
      } else {
        console.warn('⚠️ La respuesta de asientos es nula o no es un array:', response?.data);
        setSeats([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener asientos:', error);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const createSeat = async () => {
    if (!newSeatNumber) return;
    try {
      await api.createSeat(flightId, newSeatNumber);
      setNewSeatNumber('');
      fetchSeats();
    } catch (error) {
      console.error('❌ Error al crear asiento:', error);
    }
  };

  const deleteSeat = async (seatId: number) => {
    try {
      await api.deleteSeat(seatId);
      fetchSeats();
    } catch (error) {
      console.error('❌ Error al eliminar asiento:', error);
    }
  };

  const updateSeat = async () => {
    try {
      await api.updateSeat(editingSeat.id, {
        seatNumber: editingSeat.seatNumber,
        isAvailable: editingSeat.isAvailable,
      });
      setEditingSeat(null);
      fetchSeats();
    } catch (error) {
      console.error('❌ Error al actualizar asiento:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        setRole(decoded.role);
      } catch (err) {
        console.warn('❌ Token inválido:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchSeats();
  }, [flightId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Disponibilidad de Asientos</h1>

      <label htmlFor="flightId" className="block mb-2">ID de Vuelo:</label>
      <input
        id="flightId"
        type="number"
        value={flightId}
        onChange={(e) => setFlightId(Number(e.target.value))}
        className="border px-2 py-1 mb-4"
      />

      {role === 'admin' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Nuevo asiento (ej: 3B)"
            value={newSeatNumber}
            onChange={(e) => setNewSeatNumber(e.target.value)}
            className="border px-2 py-1 mr-2"
          />
          <button onClick={createSeat} className="bg-green-500 text-white px-3 py-1 rounded">
            Crear asiento
          </button>
        </div>
      )}

      {loading ? (
        <p>Cargando asientos...</p>
      ) : (
        <ul className="space-y-2">
          {seats.length === 0 ? (
            <li>No hay asientos disponibles.</li>
          ) : (
            seats.map((seat) => (
              <li key={seat.id} className="flex justify-between items-center border p-2">
                {editingSeat?.id === seat.id ? (
                  role === "admin" && (
                    <>
                      <input
                        type="text"
                        value={editingSeat.seatNumber}
                        onChange={(e) => setEditingSeat({ ...editingSeat, seatNumber: e.target.value })}
                        className="border px-2 py-1 mr-2"
                      />
                      <select
                        value={editingSeat.isAvailable ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditingSeat({ ...editingSeat, isAvailable: e.target.value === 'true' })
                        }
                        className="mr-2"
                      >
                        <option value="true">Disponible</option>
                        <option value="false">Ocupado</option>
                      </select>
                      <button onClick={updateSeat} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Guardar</button>
                      <button onClick={() => setEditingSeat(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancelar</button>
                    </>
                  )
                ) : (
                  <>
                    <span>
                      Asiento <strong>{seat.seatNumber}</strong> —{' '}
                      {seat.isAvailable ? '✅ Disponible' : '❌ Ocupado'}
                    </span>
                    {role === 'admin' && (
                      <div className="space-x-2">
                        <button onClick={() => setEditingSeat(seat)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                        <button onClick={() => deleteSeat(seat.id)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
