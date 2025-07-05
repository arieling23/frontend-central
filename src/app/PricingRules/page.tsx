'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/app/context/AuthContext';

type PricingRule = {
  id: number;
  ruleName: string;
  basePrice: number;
  multiplier: number;
};

const PricingRulesPage: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [form, setForm] = useState({ name: '', base: '', multi: '' });
  const { user } = useAuth();

  const loadRules = async () => {
    try {
      const res = await api.post('/pricing', {
        query: `query {
          pricingRules {
            id
            ruleName
            basePrice
            multiplier
          }
        }`,
      });
      setRules(res.data.data.pricingRules);
    } catch (error) {
      console.error('❌ Error cargando reglas:', error);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/pricing', {
        query: `
          mutation {
            createPricingRule(
              ruleName: "${form.name}",
              basePrice: ${form.base},
              multiplier: ${form.multi}
            ) {
              id
              ruleName
              basePrice
              multiplier
            }
          }
        `,
      });
      setForm({ name: '', base: '', multi: '' });
      loadRules();
    } catch (error) {
      console.error('❌ Error creando regla:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Tarifas</h1>

      {/* Solo el admin puede ver el formulario */}
      {user?.role === 'admin' && (
        <form onSubmit={handleSubmit} className="space-y-2 mb-6">
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="base"
            placeholder="Precio base"
            type="number"
            value={form.base}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            name="multi"
            placeholder="Multiplicador"
            type="number"
            step="0.01"
            value={form.multi}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2">
            Crear
          </button>
        </form>
      )}

      {/* Visualización de reglas con precio final */}
      <h2 className="text-xl font-semibold mb-2">Reglas actuales</h2>
      <ul className="space-y-1">
        {rules.map((rule) => {
          const finalPrice = (rule.basePrice * rule.multiplier).toFixed(2);
          return (
            <li key={rule.id} className="border p-2 rounded">
              <strong>{rule.ruleName}</strong>: ${finalPrice}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PricingRulesPage;
