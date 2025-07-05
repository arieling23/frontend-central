'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/services/api';

export default function PerfilPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    bio: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.getUserProfile();
        setProfile(res.data);
        setProfileExists(true);
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof (err as any).response === 'object' &&
          (err as any).response?.status === 404
        ) {
          setProfileExists(false);
        } else {
          console.error('❌ Error al obtener el perfil:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (profileExists) {
        await api.updateUserProfile(profile);
        alert('✅ Perfil actualizado correctamente');
      } else {
        await api.createUserProfile(profile);
        alert('✅ Perfil creado correctamente');
        setProfileExists(true);
      }
      setEditMode(false);
    } catch (err) {
      console.error('❌ Error al guardar el perfil:', err);
      alert('❌ No se pudo guardar el perfil');
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Cargando perfil...</p>;
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tu Perfil</h2>

      {user && (
        <div className="mb-4 text-gray-700">
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Correo:</strong> {user.email}</p>
        </div>
      )}

      {!editMode && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setEditMode(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            {profileExists ? 'Editar perfil' : 'Crear perfil'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bio" className="block font-medium">Biografía</label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium">Teléfono</label>
          <input
            id="phone"
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {editMode && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {profileExists ? 'Guardar cambios' : 'Crear perfil'}
          </button>
        )}
      </form>
    </main>
  );
}
