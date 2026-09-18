import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { describeWeather } from '../js/wmo.js';

// ==========================================================
// UNIDAD: describeWeather() — traduce el código WMO a español
// ==========================================================

// Formato de cada fila: [código WMO, descripción esperada]
const casosConocidos = [
  [0, 'Despejado'],
  [2, 'Parcialmente nublado'],
  [61, 'Lluvia ligera'],
  [75, 'Nieve intensa'],
  [95, 'Tormenta'],
];

describe('unidad — describeWeather()', () => {
  it('caso válido: traduce los códigos WMO conocidos', () => {
    for (const [codigo, esperado] of casosConocidos) {
      assert.equal(describeWeather(codigo), esperado, `código WMO ${codigo}`);
    }
  });

  it('caso límite: código desconocido devuelve un mensaje genérico', () => {
    assert.equal(describeWeather(999), 'Condiciones desconocidas');
    assert.equal(describeWeather(undefined), 'Condiciones desconocidas');
  });
});