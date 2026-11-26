#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');
const admin = require('firebase-admin');

const ROOT = __dirname;
const INPUT = path.resolve(process.argv.find((arg, i) => i > 1 && !arg.startsWith('--')) || path.join(ROOT, 'input', 'devoluciones.csv'));
const APPLY = process.argv.includes('--apply');
const ALLOW_UNMAPPED = process.argv.includes('--allow-unmapped-sellers');
const START = 70;
const END = 169;
const COLLECTION = 'itds';
const PROJECT_ID = 'insumo-82a38';

function fail(message) {
  console.error('\nERROR: ' + message);
  process.exit(1);
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().replace(/\s+/g, ' ').toLocaleUpperCase('es-CL');
}

function required(row, key, line) {
  const value = String(row[key] ?? '').trim();
  if (!value) throw new Error('Línea ' + line + ': falta el campo "' + key + '".');
  return value;
}

function parseDate(value, line) {
  const raw = String(value ?? '').trim();
  let match;
  let year, month, day;

  // El archivo usa DD-MM-YYYY en sus filas iniciales y MM/DD/YYYY
  // en las filas posteriores (estas últimas se confirman con fechas como 9/25/2026).
  if ((match = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/))) {
    day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
  } else if ((match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) {
    month = Number(match[1]); day = Number(match[2]); year = Number(match[3]);
  } else {
    throw new Error('Línea ' + line + ': fecha no reconocida "' + raw + '".');
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('Línea ' + line + ': fecha inválida "' + raw + '".');
  }
  return date.toISOString().slice(0, 10);
}

function parseStatus(value, line) {
  const status = normalize(value);
  if (status === 'BUEN ESTADO') return 'BUEN_ESTADO';
  if (status === 'RECUPERABLE') return 'RECUPERABLE';
  if (status === 'MAL ESTADO') return 'MAL_ESTADO';
  throw new Error('Línea ' + line + ': estado de producto desconocido "' + value + '".');
}

function parseQuantity(value, line) {
  const quantity = Number(String(value ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Línea ' + line + ': cantidad inválida "' + value + '".');
  }
  return quantity;
}

function buildRecords(csvText) {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_quotes: true,
    skip_records_with_empty_values: false
  });

  const grouped = new Map();
  const errors = [];
  let selectedRows = 0;

  rows.forEach((row, index) => {
    const line = index + 2;
    const rawFolio = String(row.Folio ?? '').trim();
    if (!rawFolio) return;
    const folio = Number(rawFolio);
    if (!Number.isInteger(folio) || folio < START || folio > END) return;
    selectedRows++;

    try {
      const fechaDeclarada = parseDate(required(row, 'Dia Declarado', line), line);
      const sellerNombre = required(row, 'Seller', line);
      const documento = required(row, 'N Documento', line);
      const ocPedido = required(row, 'OC-Pedido', line);
      const sku = required(row, 'Sku', line);
      const descripcion = required(row, 'Descripcion', line);
      const cantidad = parseQuantity(row.Cantidad, line);
      const estadoProducto = parseStatus(row.Estado, line);
      const observacion = String(row.Obs ?? '').trim();
      const compensacion = String(row['Compesanción'] ?? '').trim();

      const product = { sku, descripcion, cantidad, estadoProducto };
      const detailParts = [];
      if (observacion && observacion !== '-') detailParts.push('Observación histórica: ' + observacion);
      if (compensacion && compensacion !== '-') detailParts.push('Compensación indicada en CSV: ' + compensacion);

      if (!grouped.has(folio)) {
        grouped.set(folio, {
          id: 'ITD-' + String(folio).padStart(4, '0'),
          folio,
          fechaDeclarada,
          sellerNombre,
          documento,
          ocPedido,
          numeroSeguimiento: '',
          productos: [],
          detalleEstado: '',
          responsableCreacion: '',
          cargoCreacion: '',
          fotos: [],
          _observaciones: [],
          _sourceLines: []
        });
      }

      const record = grouped.get(folio);
      if (record.fechaDeclarada !== fechaDeclarada) throw new Error('Folio ' + folio + ': las filas tienen fechas declaradas distintas.');
      if (normalize(record.sellerNombre) !== normalize(sellerNombre)) throw new Error('Folio ' + folio + ': las filas tienen Sellers distintos.');
      if (record.documento !== documento || record.ocPedido !== ocPedido) throw new Error('Folio ' + folio + ': documento u OC-Pedido inconsistente entre productos.');

      record.productos.push(product);
      record._observaciones.push(...detailParts);
      record._sourceLines.push(line);
    } catch (error) {
      errors.push(error.message);
    }
  });

  const records = [...grouped.values()].sort((a, b) => a.folio - b.folio);
  for (const record of records) {
    record.detalleEstado = [...new Set(record._observaciones)].join('\n');
    delete record._observaciones;
    delete record._sourceLines;
  }

  const expected = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const missing = expected.filter(folio => !grouped.has(folio));
  return { records, errors, selectedRows, missing };
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    fail('No encuentro el CSV: ' + INPUT + '\nCopia el archivo a migration/input/devoluciones.csv o indica su ruta al ejecutar.');
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    fail('Define GOOGLE_APPLICATION_CREDENTIALS con la ruta local al JSON de cuenta de servicio. No guardes ese archivo en Git.');
  }
  if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    fail('No existe el archivo indicado en GOOGLE_APPLICATION_CREDENTIALS.');
  }

  const csvText = fs.readFileSync(INPUT, 'utf8');
  const { records, errors, selectedRows, missing } = buildRecords(csvText);
  if (errors.length) {
    console.error('\nErrores de lectura:');
    errors.forEach(error => console.error(' - ' + error));
    fail('Corrige los datos del CSV antes de continuar. No se escribió en Firestore.');
  }
  if (missing.length) fail('Faltan folios dentro del rango: ' + missing.join(', '));
  if (records.length !== 100) fail('Se esperaban 100 folios únicos y se encontraron ' + records.length + '.');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: PROJECT_ID
    });
  }
  const db = admin.firestore();
  const [itdSnapshot, sellerSnapshot] = await Promise.all([
    db.collection(COLLECTION).get(),
    db.collection('sellers').get()
  ]);

  const existingByFolio = new Map();
  const existingIds = new Set();
  itdSnapshot.forEach(doc => {
    existingIds.add(doc.id);
    const folio = Number(doc.get('folio'));
    if (Number.isInteger(folio)) existingByFolio.set(folio, doc.id);
  });

  const sellerMap = new Map();
  const ambiguousSellers = new Set();
  sellerSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.estado !== 'ACTIVO' || !data.nombre) return;
    const key = normalize(data.nombre);
    if (sellerMap.has(key) && sellerMap.get(key).id !== doc.id) ambiguousSellers.add(key);
    else sellerMap.set(key, { id: doc.id, codigo: data.codigo ?? null, nombre: data.nombre });
  });

  const collisions = [];
  const unmapped = [];
  const ambiguous = [];
  for (const record of records) {
    if (existingByFolio.has(record.folio)) collisions.push('Folio ' + record.folio + ' ya existe como documento ' + existingByFolio.get(record.folio));
    if (existingIds.has(record.id)) collisions.push('El ID ' + record.id + ' ya existe en ' + COLLECTION);
    const key = normalize(record.sellerNombre);
    if (ambiguousSellers.has(key)) ambiguous.push(record.sellerNombre);
    else if (!sellerMap.has(key)) unmapped.push(record.sellerNombre);
    const seller = sellerMap.get(key);
    record.sellerId = seller?.id || '';
    record.sellerCodigo = seller?.codigo ?? null;
    if (seller) record.sellerNombre = seller.nombre;
    // El CSV no contiene fecha de creación original. Se usa la fecha declarada
    // para completar el campo requerido por el modelo y se marca explícitamente.
    record.fechaCreacion = admin.firestore.Timestamp.fromDate(new Date(record.fechaDeclarada + 'T12:00:00-03:00'));
    record.fechaCreacionDerivadaDeFechaDeclarada = true;
    record.origenRegistro = 'HISTORICO_IMPORTADO';
    record.fechaImportacion = admin.firestore.FieldValue.serverTimestamp();
    record.compensacionGestion = null;
  }

  const report = {
    projectId: PROJECT_ID,
    collection: COLLECTION,
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    source: path.basename(INPUT),
    folioRange: [START, END],
    csvRowsForRange: selectedRows,
    uniqueFolios: records.length,
    products: records.reduce((sum, record) => sum + record.productos.length, 0),
    multiProductFolios: records.filter(record => record.productos.length > 1).map(record => ({ folio: record.folio, products: record.productos.length })),
    missingFolios: missing,
    existingCollisions: collisions,
    unmappedSellers: [...new Set(unmapped)].sort(),
    ambiguousSellers: [...new Set(ambiguous)].sort(),
    documents: records.map(({ id, folio, fechaDeclarada, sellerNombre, sellerId, productos }) => ({
      id, folio, fechaDeclarada, sellerNombre, sellerId, productCount: productos.length
    }))
  };

  const reportDir = path.join(ROOT, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'itd-migration-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\nRESUMEN DE MIGRACIÓN');
  console.log('Proyecto: ' + PROJECT_ID);
  console.log('Modo: ' + report.mode);
  console.log('Filas CSV seleccionadas: ' + selectedRows);
  console.log('ITD únicos: ' + records.length);
  console.log('Productos: ' + report.products);
  console.log('Folios con varios productos: ' + JSON.stringify(report.multiProductFolios));
  console.log('Sellers sin correspondencia: ' + (report.unmappedSellers.join(', ') || 'ninguno'));
  console.log('Sellers ambiguos: ' + (report.ambiguousSellers.join(', ') || 'ninguno'));
  console.log('Colisiones: ' + (collisions.join('; ') || 'ninguna'));
  console.log('Informe: ' + reportPath);

  if (collisions.length) fail('Hay documentos o folios existentes. No se sobrescribirá nada.');
  if (ambiguous.length) fail('Hay Sellers duplicados/ambiguos. Deben resolverse antes de importar.');
  if (unmapped.length && APPLY && !ALLOW_UNMAPPED) {
    fail('Hay Sellers sin correspondencia. Revisa el informe o usa --allow-unmapped-sellers solo si aceptas importar esos registros sin sellerId.');
  }

  if (!APPLY) {
    console.log('\nSIMULACIÓN: no se escribió ningún documento en Firestore.');
    console.log('Revisa el JSON. Para importar, ejecuta explícitamente con --apply.');
    return;
  }

  const batch = db.batch();
  for (const record of records) {
    const ref = db.collection(COLLECTION).doc(record.id);
    batch.create(ref, record);
  }
  await batch.commit();
  console.log('\nIMPORTACIÓN COMPLETADA: ' + records.length + ' documentos creados en ' + COLLECTION + '.');
}

main().catch(error => fail(error.stack || error.message || String(error)));
