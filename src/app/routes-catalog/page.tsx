"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/services/api";

// Tipos
type Segment = {
  id?: number;
  origin: string;
  destination: string;
  distanceKm: number;
};

type Route = {
  id: number;
  name: string;
  segments: Segment[];
};

type JwtPayload = {
  role: string;
  exp: number;
  iat: number;
};

export default function RoutesCatalogPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const [form, setForm] = useState({
    name: "",
    segments: [{ origin: "", destination: "", distanceKm: 0 }],
  });

  // Validar token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token, inicie sesión.");
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

  // Obtener rutas
  const fetchRoutes = async () => {
    try {
      const res = await api.getRoutesCatalog();
      if (res.data.errors) {
        setError("Error al obtener rutas.");
      } else {
        setRoutes(res.data.data.getRoutes);
      }
    } catch {
      setError("Error al conectar con el backend.");
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Actualizar formulario
  const addSegment = () => {
    setForm((prev) => ({
      ...prev,
      segments: [...prev.segments, { origin: "", destination: "", distanceKm: 0 }],
    }));
  };

  const removeSegment = (index: number) => {
    const updated = [...form.segments];
    updated.splice(index, 1);
    setForm({ ...form, segments: updated });
  };

  const updateSegment = (
    index: number,
    field: keyof Segment,
    value: string | number
  ) => {
    const updated = [...form.segments];
    updated[index] = {
      ...updated[index],
      [field]: field === "distanceKm" ? parseInt(value as string) : value,
    };
    setForm({ ...form, segments: updated });
  };

  const createRouteWithSegments = async () => {
    try {
      const res = await api.createRouteWithSegments(form.name, form.segments);
      if (res.data.errors) {
        setError("Error al crear ruta.");
      } else {
        setForm({
          name: "",
          segments: [{ origin: "", destination: "", distanceKm: 0 }],
        });
        fetchRoutes();
      }
    } catch {
      setError("Error al crear la ruta.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Rutas</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {role === "admin" && (
        <div className="mb-6 border p-4 rounded shadow bg-gray-100">
          <h2 className="text-lg font-semibold mb-2">Crear nueva ruta con segmentos</h2>

          <input
            className="border p-2 mb-2 w-full"
            placeholder="Nombre de la ruta"
            value={form.name}
            onChange={({ target: { value } }) => setForm({ ...form, name: value })}
          />

          {form.segments.map((segment, index) => (
            <div key={index} className="mb-2 border p-2 bg-white rounded">
              <input
                className="border p-2 mr-2"
                placeholder="Origen"
                value={segment.origin}
                onChange={({ target: { value } }) => updateSegment(index, "origin", value)}
              />
              <input
                className="border p-2 mr-2"
                placeholder="Destino"
                value={segment.destination}
                onChange={({ target: { value } }) => updateSegment(index, "destination", value)}
              />
              <input
                type="number"
                className="border p-2"
                placeholder="Distancia"
                value={segment.distanceKm}
                onChange={({ target: { value } }) => updateSegment(index, "distanceKm", value)}
              />
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => removeSegment(index)}
              >
                ✖
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addSegment}
            className="text-blue-600 underline mb-4"
          >
            + Agregar segmento
          </button>

          <button
            onClick={createRouteWithSegments}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Crear Ruta
          </button>
        </div>
      )}

      <ul className="space-y-4">
        {routes.map((route) => (
          <li key={route.id} className="border p-4 rounded shadow">
            <div className="font-semibold mb-2">Ruta: {route.name}</div>
            {route.segments.map((segment) => (
              <div key={`${segment.origin}-${segment.destination}`} className="pl-2">
                ➤ {segment.origin} ➡ {segment.destination} ({segment.distanceKm} km)
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
