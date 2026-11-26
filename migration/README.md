# Migración de ITD históricos a Firestore

Script independiente de Ionic/Angular. No modifica la aplicación ni sus dependencias.

## Alcance

- Proyecto Firebase: `insumo-82a38`
- Colección de destino: `itds`
- Folios incluidos: **070 a 169**
- Un documento por folio; los productos del mismo folio se agrupan en `productos`.
- Los folios 001–069 y 170 en adelante quedan fuera.
- No crea registros en `gestiones_itd`: el CSV no aporta fechas ni responsables de gestión verificables.
- Conserva observaciones y porcentajes de compensación en `detalleEstado`, identificados como datos históricos del CSV.

## Requisitos

Node.js 18 o superior y una cuenta de servicio de Firebase con permiso de lectura/escritura en Firestore.

## Preparación local en macOS

Desde la raíz del repositorio:

```bash
cd migration
npm install
mkdir -p input reports
```

Copia el CSV original a `migration/input/devoluciones.csv`. Esa carpeta está excluida de Git.

En Firebase Console, genera una clave privada para una cuenta de servicio autorizada para Firestore. Guarda el JSON **fuera del repositorio**, por ejemplo:

```text
/Users/tu_usuario/.config/firebase/insumo-82a38-service-account.json
```

En la terminal:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/firebase/insumo-82a38-service-account.json"
```

No compartas ni subas ese JSON a GitHub.

## 1. Simulación (no escribe en Firebase)

```bash
node import-itds.js
```

También puedes indicar otra ruta al CSV:

```bash
node import-itds.js "/ruta/al/archivo.csv"
```

El script consulta los ITD y Sellers actuales, valida folios, fechas, estados, cantidades, vendedores y colisiones. Genera un JSON en `migration/reports/`.

**La simulación no crea, modifica ni elimina documentos.** Si ya existe cualquier folio entre 070 y 169, o el ID determinista está ocupado, se detiene sin sobrescribir.

## 2. Importación (solo después de revisar el informe)

Cuando el preview esté revisado y aprobado:

```bash
node import-itds.js --apply
```

Si el informe muestra Sellers sin correspondencia, el modo de importación se detiene. Solo si aceptas expresamente conservar esos Sellers sin vinculación, puedes ejecutar:

```bash
node import-itds.js --apply --allow-unmapped-sellers
```

Los documentos sin Seller asociado conservan `sellerNombre`, pero `sellerId` queda vacío y `sellerCodigo` en `null`; después deberán corregirse desde la aplicación.

## Mapeo y criterios

| CSV | Firestore |
|---|---|
| Folio | `folio` |
| Dia Declarado | `fechaDeclarada` |
| Seller | `sellerNombre`, y asociación con `sellers` por nombre normalizado |
| N Documento | `documento` |
| OC-Pedido | `ocPedido` |
| Sku, Descripcion, Cantidad, Estado | Elementos de `productos` |
| Obs y Compesanción | Texto histórico dentro de `detalleEstado` |

- Los estados se normalizan a `BUEN_ESTADO`, `RECUPERABLE` o `MAL_ESTADO`.
- Fechas con guiones se interpretan como DD-MM-YYYY; fechas con barras como MM/DD/YYYY, consistente con valores como 9/25/2026 del CSV.
- El CSV no contiene número de seguimiento, responsable, cargo ni fecha original de creación; esos campos no se inventan.
- Para completar el campo obligatorio `fechaCreacion` del modelo actual, se usa la fecha declarada y se marca `fechaCreacionDerivadaDeFechaDeclarada: true`. El documento también incluye `origenRegistro: HISTORICO_IMPORTADO` y `fechaImportacion`.
- No se suben fotografías ni se generan gestiones artificiales.
- IDs deterministas: `ITD-0070` … `ITD-0169`.

## Seguridad y reversibilidad

- Modo por defecto: simulación.
- La escritura requiere el argumento explícito `--apply`.
- Se usa `create()` de Firestore: nunca reemplaza un documento existente.
- Antes de escribir, se comprueban folios e IDs existentes en el rango.
- No se toca la interfaz, las reglas de Firebase, Hosting ni la colección `gestiones_itd`.
- Conserva el JSON del informe como respaldo de lo que se revisó antes de importar.
