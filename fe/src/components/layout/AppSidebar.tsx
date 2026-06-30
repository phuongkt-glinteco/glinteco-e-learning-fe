'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import AppLogo from './AppLogo';
import { getMainNav, footerNav } from './nav-config';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/default/sidebar';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const t = useTranslations('AppShell');
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = React.useState(pathname);
  const { state, isMobile, setOpenMobile } = useSidebar();

  React.useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const navItems = getMainNav(user?.role);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center h-[72px] px-4 justify-center border-b border-outline-variant">
        <AppLogo showText={state === 'expanded' || isMobile} />
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const active = optimisticPath.startsWith(item.href);
            const translatedLabel = t(item.translationKey) || item.label;

            return (
              <SidebarMenuItem key={item.href} className="px-2 mb-1">
                <SidebarMenuButton 
                  asChild 
                  isActive={active} 
                  tooltip={translatedLabel}
                  className={`flex items-center gap-3 rounded-lg font-semibold h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center ${
                    active
                      ? `bg-primary/10 text-primary border-primary hover:bg-primary/20 hover:text-primary ${
                          state === 'expanded' || isMobile ? 'border-r-4' : 'border-1'
                        }`
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Link href={item.href} onClick={() => {
                    setOptimisticPath(item.href);
                    if (isMobile) setOpenMobile(false);
                  }}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden">{translatedLabel}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-outline-variant p-2">
        <SidebarMenu>
          {footerNav.map((item) => {
            const active = optimisticPath.startsWith(item.href);
            const translatedLabel = t(item.translationKey) || item.label;

            return (
              <SidebarMenuItem key={item.href} className="px-2 mb-1">
                <SidebarMenuButton 
                  asChild 
                  isActive={active} 
                  tooltip={translatedLabel}
                  className={`flex items-center gap-3 rounded-lg font-semibold h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center ${
                    active
                      ? `bg-primary/10 text-primary border-primary hover:bg-primary/20 hover:text-primary ${
                          state === 'expanded' || isMobile ? 'border-r-4' : 'border-1'
                        }`
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Link href={item.href} onClick={() => {
                    setOptimisticPath(item.href);
                    if (isMobile) setOpenMobile(false);
                  }}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span className="group-data-[collapsible=icon]:hidden">{translatedLabel}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
