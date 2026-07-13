'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import Skeleton from '@/components/ui/loading/Skeleton';
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

function isNavItemActive(href: string, pathname: string, fromQuery: string | null) {
  if (href === '/tracks') {
    return pathname.startsWith('/tracks') || (pathname.startsWith('/courses') && fromQuery !== 'my-courses');
  }

  if (href === '/my-courses') {
    return pathname.startsWith('/my-courses') || (pathname.startsWith('/courses') && fromQuery === 'my-courses');
  }

  return pathname.startsWith(href);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();
  const t = useTranslations('AppShell');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [optimisticPath, setOptimisticPath] = React.useState(pathname);
  const { state, isMobile, setOpenMobile } = useSidebar();
  const fromQuery = searchParams.get('from');

  React.useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const isAuthLoading = loading || !user;
  const navItems = getMainNav(user?.role);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center h-[72px] px-4 justify-center border-b border-outline-variant">
        <AppLogo showText={state === 'expanded' || isMobile} />
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarMenu>
          {isAuthLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <SidebarMenuItem key={idx} className="px-2 mb-1">
                <div className="flex items-center gap-3 rounded-lg h-10 px-3 py-2">
                  <Skeleton height={20} width={20} rounded="rounded-md" className="shrink-0" />
                  <Skeleton height={16} width="70%" rounded="rounded-md" className="group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuItem>
            ))
          ) : (
            navItems.map((item) => {
              const active = isNavItemActive(item.href, optimisticPath, fromQuery);
              const translatedLabel = t(item.translationKey) || item.label;

              return (
                <SidebarMenuItem key={item.href} className="px-2 mb-1">
                  <SidebarMenuButton 
                    asChild 
                    isActive={active} 
                    tooltip={translatedLabel}
                    className={`flex items-center gap-3 rounded-lg font-semibold h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center transition-all ${
                      active
                        ? '!bg-primary !text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground shadow-sm border-0 font-bold'
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
            })
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-outline-variant p-2">
        <SidebarMenu>
          {isAuthLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <SidebarMenuItem key={idx} className="px-2 mb-1">
                <div className="flex items-center gap-3 rounded-lg h-10 px-3 py-2">
                  <Skeleton height={20} width={20} rounded="rounded-md" className="shrink-0" />
                  <Skeleton height={16} width="60%" rounded="rounded-md" className="group-data-[collapsible=icon]:hidden" />
                </div>
              </SidebarMenuItem>
            ))
          ) : (
            footerNav.map((item) => {
              const active = optimisticPath.startsWith(item.href);
              const translatedLabel = t(item.translationKey) || item.label;

              return (
                <SidebarMenuItem key={item.href} className="px-2 mb-1">
                  <SidebarMenuButton 
                    asChild 
                    isActive={active} 
                    tooltip={translatedLabel}
                    className={`flex items-center gap-3 rounded-lg font-semibold h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center transition-all ${
                      active
                        ? '!bg-primary !text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground shadow-sm border-0 font-bold'
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
            })
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
