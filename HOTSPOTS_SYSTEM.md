# Sistema de Hotspots para Turismo 360°

## Descripción General

Sistema completo de Hotspots que permite agregar puntos de interés interactivos a imágenes 360°. Cada hotspot se conecta a un modelo 3D (.glb) y tiene coordenadas XYZ para su posicionamiento en el espacio 3D.

---

## Estructura de Base de Datos

### 1. Tabla: `assets_3d`
Almacena los modelos 3D disponibles (.glb).

```sql
CREATE TABLE assets_3d (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NULLABLE,
    model_path VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Campos:**
- `id` - Identificador único
- `name` - Nombre del asset 3D
- `description` - Descripción opcional
- `model_path` - Ruta al archivo .glb (ej: "images/3d/monumento.glb")
- `is_active` - Estado activo/inactivo
- `sort_order` - Orden de visualización

---

### 2. Tabla: `place_image_hotspots`
Conecta hotspots con imágenes 360° y especifica posición 3D.

```sql
CREATE TABLE place_image_hotspots (
    id BIGINT PRIMARY KEY,
    place_image_id BIGINT NOT NULL (FK -> place_images),
    asset_3d_id BIGINT NOT NULL (FK -> assets_3d),
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    pos_z FLOAT NOT NULL,
    label VARCHAR(255) NULLABLE,
    description LONGTEXT NULLABLE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(place_image_id, asset_3d_id)
);
```

**Campos:**
- `place_image_id` - Referencia a place_images (OnDelete Cascade)
- `asset_3d_id` - Referencia a assets_3d (OnDelete Cascade)
- `pos_x`, `pos_y`, `pos_z` - Coordenadas 3D normalizadas (pueden ser 0-1 o mayor)
- `label` - Etiqueta del hotspot
- `description` - Descripción adicional
- `is_active` - Estado activo/inactivo
- `sort_order` - Orden de visualización
- Constraint único en (place_image_id, asset_3d_id)

---

## Modelos Eloquent

### Asset3d.php

```php
class Asset3d extends Model
{
    public function hotspots(): HasMany
    {
        return $this->hasMany(PlaceImageHotspot::class);
    }

    public function scopeActive($query)
    public function scopeOrdered($query)
}
```

---

### PlaceImageHotspot.php

```php
class PlaceImageHotspot extends Model
{
    protected $casts = [
        'pos_x' => 'float',
        'pos_y' => 'float',
        'pos_z' => 'float',
        'is_active' => 'boolean',
    ];

    public function placeImage(): BelongsTo
    public function asset3d(): BelongsTo
    public function scopeActive($query)
    public function scopeOrdered($query)
}
```

---

### PlaceImage.php (Actualizado)

```php
class PlaceImage extends Model
{
    public function hotspots(): HasMany
    {
        return $this->hasMany(PlaceImageHotspot::class);
    }
}
```

---

## Controladores

### Asset3dController
Gestiona los activos 3D (.glb).

**Rutas:**
```
GET    /admin/assets3d               -> index()      // Listar assets
GET    /admin/assets3d/create        -> create()     // Formulario crear
POST   /admin/assets3d               -> store()      // Guardar
GET    /admin/assets3d/{asset}/edit  -> edit()       // Formulario editar
PUT    /admin/assets3d/{asset}       -> update()     // Actualizar
DELETE /admin/assets3d/{asset}       -> destroy()    // Eliminar
PATCH  /admin/assets3d/{asset}/toggle-active -> toggleActive()
```

---

### HotspotController
Gestiona los hotspots para imágenes 360°.

**Rutas:**
```
GET    /admin/places/{place}/images/{image}/hotspots
       -> index()      // Listar hotspots de una imagen

GET    /admin/places/{place}/images/{image}/hotspots/create
       -> create()     // Formulario crear hotspot

POST   /admin/places/{place}/images/{image}/hotspots
       -> store()      // Guardar hotspot

GET    /admin/places/{place}/images/{image}/hotspots/{hotspot}/edit
       -> edit()       // Formulario editar hotspot

PUT    /admin/places/{place}/images/{image}/hotspots/{hotspot}
       -> update()     // Actualizar hotspot

DELETE /admin/places/{place}/images/{image}/hotspots/{hotspot}
       -> destroy()    // Eliminar hotspot

PATCH  /admin/places/{place}/images/{image}/hotspots/{hotspot}/toggle-active
       -> toggleActive() // Cambiar estado activo/inactivo
```

---

## Ejemplos de Uso

### 1. Crear un Asset 3D

```bash
POST /admin/assets3d
Content-Type: application/json

{
    "name": "Monumento Principal",
    "description": "Modelo 3D del monumento histórico",
    "model_path": "images/3d/monumento.glb",
    "is_active": true,
    "sort_order": 1
}
```

**Response:**
```
Redirect a /admin/assets3d con mensaje de éxito
```

---

### 2. Crear un Hotspot

```bash
POST /admin/places/1/images/5/hotspots
Content-Type: application/json

{
    "asset_3d_id": 1,
    "pos_x": 0.5,
    "pos_y": 0.3,
    "pos_z": 0.8,
    "label": "Punto de interés 1",
    "description": "Descripción del punto interactivo",
    "is_active": true,
    "sort_order": 1
}
```

**Response:**
```
Redirect a /admin/places/1/images/5/hotspots con mensaje de éxito
```

---

### 3. Listar Hotspots de una Imagen

```bash
GET /admin/places/1/images/5/hotspots
```

**Response (Inertia):**
```json
{
    "place": { /* place data */ },
    "image": { /* image data */ },
    "hotspots": [
        {
            "id": 1,
            "place_image_id": 5,
            "asset_3d_id": 1,
            "pos_x": 0.5,
            "pos_y": 0.3,
            "pos_z": 0.8,
            "label": "Punto 1",
            "description": "...",
            "is_active": true,
            "sort_order": 1,
            "asset3d": { /* asset 3d data */ }
        }
    ]
}
```

---

### 4. Actualizar Hotspot

```bash
PUT /admin/places/1/images/5/hotspots/1
Content-Type: application/json

{
    "asset_3d_id": 2,
    "pos_x": 0.6,
    "pos_y": 0.4,
    "pos_z": 0.7,
    "label": "Punto actualizado",
    "description": "Descripción actualizada",
    "is_active": true,
    "sort_order": 1
}
```

---

### 5. Eliminar Hotspot

```bash
DELETE /admin/places/1/images/5/hotspots/1
```

**Response:**
```
Redirect con mensaje de éxito
```

---

### 6. Cambiar Estado de Hotspot

```bash
PATCH /admin/places/1/images/5/hotspots/1/toggle-active
```

**Response:**
```
Redirect con mensaje de éxito
```

---

## Validaciones

### Asset3d::store()
```
name          required|string|max:255
description   nullable|string
model_path    required|string|max:500
is_active     boolean (default: true)
sort_order    integer|min:0 (default: 0)
```

### PlaceImageHotspot::store()
```
asset_3d_id   required|exists:assets_3d,id
pos_x         required|numeric
pos_y         required|numeric
pos_z         required|numeric
label         nullable|string|max:255
description   nullable|string
is_active     boolean (default: true)
sort_order    integer|min:0 (default: 0)
```

---

## Relaciones Elegidas

### Asset3d → PlaceImageHotspot
```
Asset3d.id → PlaceImageHotspot.asset_3d_id (One-to-Many)
OnDelete: Cascade
```

### PlaceImage → PlaceImageHotspot
```
PlaceImage.id → PlaceImageHotspot.place_image_id (One-to-Many)
OnDelete: Cascade
```

### Place → PlaceImage → PlaceImageHotspot
```
Relación en cadena: Lugar → Imagen → Hotspot
```

---

## Seguridad

### Autenticación
- Todas las rutas requieren middleware `auth`, `verified`, `admin`
- Solo administradores pueden crear/editar/eliminar hotspots

### Autorización
- HotspotController verifica que el hotspot pertenece a la imagen
- Uso de route model binding implícito

### Validaciones
- Validación de relaciones (asset_3d_id debe existir)
- Restricción única en (place_image_id, asset_3d_id)
- Constraint de cascade para integridad referencial

---

## Migración a Base de Datos

### Ejecutar migraciones:
```bash
php artisan migrate
```

Las tablas se crearán en el siguiente orden:
1. `assets_3d`
2. `place_image_hotspots` (depende de `assets_3d` y `place_images`)

---

## Archivos Generados

```
✅ database/migrations/2025_03_06_000000_create_assets_3d_table.php
✅ database/migrations/2025_03_06_000001_create_place_image_hotspots_table.php
✅ app/Models/Asset3d.php
✅ app/Models/PlaceImageHotspot.php
✅ app/Models/PlaceImage.php (actualizado)
✅ app/Http/Controllers/Admin/Asset3dController.php
✅ app/Http/Controllers/Admin/HotspotController.php
✅ routes/web.php (actualizado con nuevas rutas)
```

---

## Próximos Pasos (Frontend)

### React Components Recomendados:

1. **Asset3dIndex.tsx** - Lista de assets 3D
2. **Asset3dForm.tsx** - Formulario crear/editar assets
3. **HotspotIndex.tsx** - Lista de hotspots
4. **HotspotForm.tsx** - Formulario crear/editar hotspots
5. **HotspotViewer.tsx** - Visualizador 3D interactivo con hotspots

---

## Notas Importantes

- Las coordenadas `pos_x`, `pos_y`, `pos_z` son floats y pueden ser cualquier valor numérico
- Normalizar coordenadas a rango 0-1 es recomendable pero no obligatorio
- El campo `unique(place_image_id, asset_3d_id)` previene duplicados
- Cascade delete automático mantiene integridad de datos
- Los scopes `active()` y `ordered()` facilitan queries comunes
