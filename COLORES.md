# 📋 Guía de Colores - Sistema de Temas

## Localización del Sistema de Colores

Todos los colores de la aplicación están centralizados en:
```
resources/js/constants/theme.ts
```

## ¿Cómo Cambiar los Colores?

### 1. Edita el archivo `theme.ts`

Simplemente cambia los valores de color en este archivo y se aplicarán en toda la aplicación:

```typescript
export const THEME_COLORS = {
    // Cambiar el verde primario a azul:
    primary: 'blue-600',  // Era 'green-600'
    primaryLight: 'blue-500',  // Era 'green-500'
    primaryBg: 'bg-blue-600',  // Era 'bg-green-600'
    primaryHover: 'hover:bg-blue-500',  // Era 'hover:bg-green-500'
    // ... etc
};
```

### 2. Ubicaciones de Uso

Los componentes que usan estos colores:
- ✅ `resources/js/components/Navbar.tsx` - Barra de navegación
- ✅ `resources/js/pages/Landing.tsx` - Página de inicio
- ✅ `resources/js/pages/Places/Index.tsx` - Listado de lugares
- ✅ `resources/js/pages/Places/[slug].tsx` - Detalle de lugar

## Colores Disponibles

### Primarios
- `primary`: Clase base (ej: 'green-600')
- `primaryBg`: Clase bg (ej: 'bg-green-600')
- `primaryHover`: Clase hover (ej: 'hover:bg-green-500')
- `buttonPrimary`: Botón principal (ej: 'bg-green-600')
- `buttonPrimaryHover`: Hover botón (ej: 'hover:bg-green-500')

### Secundarios
- `buttonSecondary`: Botón secundario (ej: 'bg-red-600')
- `buttonSecondaryHover`: Hover botón secundario (ej: 'hover:bg-red-500')

### Textos
- `textSecondary`: Texto secundario (ej: 'text-neutral-300')
- `textTertiary`: Texto terciario (ej: 'text-neutral-400')
- `textLight`: Texto claro

### Fondos
- `bgCardLight`: Fondo tarjeta claro (ej: 'bg-neutral-800/60')
- `bgCard`: Fondo tarjeta (ej: 'bg-neutral-800')
- `bgDark`: Fondo oscuro (ej: 'bg-neutral-900')

### Acentos y Bordes
- `accentBg`: Fondo acentuado
- `accentBgLight`: Fondo acentuado claro
- `focusBorder`: Borde en focus
- `border`: Borde normal
- `borderLight`: Borde claro

## Ejemplo: Cambiar de Verde a Azul

```typescript
// ANTES:
export const THEME_COLORS = {
    buttonPrimary: 'bg-green-600',
    buttonPrimaryHover: 'hover:bg-green-500',
    // ...
};

// DESPUÉS:
export const THEME_COLORS = {
    buttonPrimary: 'bg-blue-600',
    buttonPrimaryHover: 'hover:bg-blue-500',
    // ...
};
```

## Uso en Componentes

### Cómo importar:
```tsx
import { THEME_COLORS } from '@/constants/theme';

export default function MyComponent() {
    return (
        <button className={`${THEME_COLORS.buttonPrimary} ${THEME_COLORS.buttonPrimaryHover}`}>
            Click aquí
        </button>
    );
}
```

## Notas Importantes

- Los colores están basados en las clases de Tailwind CSS
- No es necesario reiniciar la aplicación después de cambiar los colores
- Todos los componentes principales ya están configurados para usar este sistema
- Cuando agregues nuevos componentes, importa y usa `THEME_COLORS` en lugar de hardcodear colores

---

**¿Necesitas agregar nuevos colores?** Édita `resources/js/constants/theme.ts` y agrega nuevas propiedades, luego úsalas en tus componentes.
