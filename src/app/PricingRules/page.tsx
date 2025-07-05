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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const base = parseFloat(form.base);
    const multi = parseFloat(form.multi);

    if (!form.name || isNaN(base) || isNaN(multi)) {
      alert('❗ Todos los campos deben estar completos y válidos.');
      return;
    }

    try {
      await api.post('/pricing', {
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
        variables: {
          ruleName: form.name,
          basePrice: base,
          multiplier: multi,
        },
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
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Crear
          </button>
        </form>
      )}

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
