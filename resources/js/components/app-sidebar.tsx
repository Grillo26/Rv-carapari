import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    MapPin,
    Users,
    MessageSquare,
    Settings,
    UserCircle,
    Lock,
    Box,
} from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Lugares Turísticos',
        href: '/admin/places',
        icon: MapPin,
    },
    {
        title: 'Gestión de Usuarios',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Reseñas y Calificaciones',
        href: '/admin/reviews',
        icon: MessageSquare,
    },
    {
        title: 'Modelos 3D',
        href: '/admin/assets3d',
        icon: Box,
    },
    {
        title: 'Mi Perfil',
        href: '/settings/profile',
        icon: UserCircle,
    },
];

const userNavItems: NavItem[] = [
    {
        title: 'Mi Perfil',
        href: '/settings/profile',
        icon: UserCircle,
    },

];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = (auth.user as any)?.role === 'admin';
    const navItems = isAdmin ? adminNavItems : userNavItems;
    const homeHref = isAdmin ? dashboard() : '/';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
