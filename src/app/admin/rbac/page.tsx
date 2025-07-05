'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

type DecodedJWT = {
  userId: string;
  email: string;
  role: string;
  exp: number;
};

type Role = {
  name: string;
  permissions: string[];
};

export default function RBACPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  // 🔐 Validar token y rol
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      router.push('/login');
      return;
    }

    try {
      const decoded: DecodedJWT = jwtDecode(stored);

      if (decoded.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setToken(stored);
    } catch (err) {
      console.error('Error al decodificar el token', err);
      router.push('/login');
    }
  }, [router]);

  // 📋 Obtener roles desde ms-rbac
  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:4005/api/rbac/roles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRoles(data);
        setCargando(false);
      })
      .catch(() => {
        setMensaje('❌ Error al obtener roles');
        setCargando(false);
      });
  }, [token]);

  // 📨 Enviar asignación de rol
  const handleAssign = async () => {
    if (!userId || !selectedRole) {
      setMensaje('⚠️ Debes completar todos los campos');
      return;
    }

    const res = await fetch('http://localhost:4005/api/rbac/assign-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, role: selectedRole }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensaje('✅ Rol asignado correctamente');
      setUserId('');
      setSelectedRole('');
    } else {
      setMensaje('❌ Error: ' + (data.message || 'No se pudo asignar el rol'));
    }
  };

  if (cargando) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔐 Panel de Roles y Permisos (RBAC)</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">📋 Roles Disponibles</h2>
        <ul className="list-disc list-inside">
          {roles.map((role, index) => (
            <li key={index}>
              <strong>{role.name}</strong> — Permisos: {role.permissions.join(', ')}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">👤 Asignar Rol a Usuario</h2>
        <div className="flex flex-col gap-3 w-96">
          <input
            type="text"
            className="border p-2"
            placeholder="ID del Usuario"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <select
            className="border p-2"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Selecciona un rol --</option>
            {roles.map((role, index) => (
              <option key={index} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Asignar Rol
          </button>
          {mensaje && <p className="mt-2">{mensaje}</p>}
        </div>
      </section>
    </div>
  );
}
