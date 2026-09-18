import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTemp, capitalize } from '../js/format.js';

// ==========================================================
// UNIDAD: formatTemp() — número a "XX°C" redondeado
// ==========================================================

// Formato de cada fila: [entrada, salida esperada]
const casosTemperatura = [
  [27.3, '27°C'],
  [0, '0°C'],
  [-1.6, '-2°C'],
  [50, '50°C'],
];

describe('unidad — formatTemp()', () => {
  it('caso válido: redondea y agrega la unidad', () => {
    for (const [entrada, esperado] of casosTemperatura) {
      assert.equal(formatTemp(entrada), esperado, `formatTemp(${entrada})`);
    }
  });
});

// ==========================================================
// UNIDAD: capitalize() — primera letra en mayúscula
// ==========================================================

// Formato de cada fila: [entrada, salida esperada]
const casosCapitalize = [
  ['madrid', 'Madrid'],
  ['despejado', 'Despejado'],
  ['', ''],
  ['tormenta con granizo', 'Tormenta con granizo'],
];

describe('unidad — capitalize()', () => {
  it('caso válido: pone en mayúscula la primera letra', () => {
    for (const [entrada, esperado] of casosCapitalize) {
      assert.equal(capitalize(entrada), esperado, `capitalize("${entrada}")`);
    }
  });
});