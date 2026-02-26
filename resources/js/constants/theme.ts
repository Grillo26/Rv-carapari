// ===== CONFIGURACIÓN DE COLORES DEL TEMA =====
// Sistema centralizado de colores para toda la aplicación
// Actualiza estos valores aquí para cambiar los colores en todo el proyecto

export const THEME_COLORS = {
       // Colores primarios
       primary: 'green-600',
       primaryLight: 'green-500',
       primaryBg: 'bg-green-600',
       primaryHover: 'hover:bg-green-500',
       primaryText: 'text-green-500',
       primaryTextLight: 'text-green-400',
       buttonPrimary: 'bg-green-600',
       buttonPrimaryHover: 'hover:bg-green-500',

       // Colores de acentos
       accentBg: 'bg-green-600/90',
       accentBgLight: 'bg-green-600/10',

       // Colores de bordes y focuses
       focusBorder: 'focus:border-green-500',
       border: 'border-green-600',
       borderLight: 'border-green-600/20',

       // Colores secundarios
       secondary: 'bg-red-600',
       secondaryHover: 'hover:bg-red-500',
       buttonSecondary: 'bg-red-600',
       buttonSecondaryHover: 'hover:bg-red-500',

       // Fondos
       bgDark: 'bg-neutral-900',
       bgCard: 'bg-neutral-800',
       bgCardLight: 'bg-neutral-800/60',

       // Colores de texto
       textPrimary: 'text-gray-900',
       textSecondary: 'text-neutral-300',
       textTertiary: 'text-neutral-400',
       textMuted: 'text-neutral-400',
       textLight: 'text-gray-700',
};

// Ejemplos de uso en componentes:
// import { THEME_COLORS } from '@/constants/theme';
// <button className={`${THEME_COLORS.primaryBg} ${THEME_COLORS.primaryHover}`}>Click</button>

export default THEME_COLORS;
