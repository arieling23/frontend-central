"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type Vuelo = {
  id: string;
  code: string;
  origin: string;
  destination: string;
  departureTime: string;
};

type JwtPayload = {
  role: string;
  exp: number;
  iat: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export default function FlightCatalogPage() {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    code: "",
    origin: "",
    destination: "",
    departureTime: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token, inicie sesión.");
      window.location.href = "/login";
      return;
    }

    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        setError("Token expirado.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setRole(decoded.role);
    } catch {
      setError("Token inválido.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  const fetchFlights = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/flight-catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query {
              getFlights {
                id
                code
                origin
                destination
                departureTime
              }
            }
          `,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error HTTP:", res.status, data);
        setError(`Error del servidor: ${res.status}`);
      } else if (data.errors) {
        console.error("❌ GraphQL Errors:", data.errors);
        setError("Error GraphQL: " + data.errors[0].message);
      } else {
        setVuelos(data.data.getFlights);
      }
    } catch (e) {
      console.error("❌ Error en fetch:", e);
      setError("Error de conexión con el backend.");
    }
  };

  const createFlight = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/flight-catalog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateFlight($code: String!, $origin: String!, $destination: String!, $departureTime: String!) {
              createFlight(code: $code, origin: $origin, destination: $destination, departureTime: $departureTime) {
                id
              }
            }
          `,
          variables: form,
        }),
      });

      const data = await res.json();
      if (data.errors) {
        setError("Error al crear vuelo.");
      } else {
        setForm({ code: "", origin: "", destination: "", departureTime: "" });
        fetchFlights();
      }
    } catch {
      setError("Error al enviar datos al backend.");
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Vuelos</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {role === "admin" && (
        <div className="mb-6 border p-4 rounded shadow bg-gray-100">
          <h2 className="text-lg font-semibold mb-2">Crear nuevo vuelo</h2>
          <input
            className="border p-2 mb-2 w-full"
            placeholder="Código"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            className="border p-2 mb-2 w-full"
            placeholder="Origen"
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
          />
          <input
            className="border p-2 mb-2 w-full"
            placeholder="Destino"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 mb-2 w-full"
            value={form.departureTime}
            onChange={(e) =>
              setForm({ ...form, departureTime: e.target.value })
            }
          />
          <button
            onClick={createFlight}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Crear Vuelo
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {vuelos.map((vuelo) => (
          <li key={vuelo.id} className="border p-4 rounded shadow">
            <div><strong>{vuelo.code}</strong></div>
            <div>{vuelo.origin} ➡ {vuelo.destination}</div>
            <div className="text-sm text-gray-600">
              {new Date(vuelo.departureTime).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
