'use client';

import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/default/dropdown-menu';
import { Button } from '@/components/ui/default/button';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useRouter } from 'next/navigation';

interface CohortActionsMenuProps {
  cohortId: string;
  title: string;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDeleteRequest?: (id: string, title: string) => void;
}

export function CohortActionsMenu({
  cohortId,
  title,
  isAdmin,
  onEdit,
  onDeleteRequest,
}: CohortActionsMenuProps) {
  const t = useTranslations('CohortsPage');
const router = useRouter();


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-on-surface-variant hover:text-on-surface shrink-0 cursor-pointer"
          title={t('moreActions')}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-surface-container-lowest border-outline-variant shadow-lg z-50">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/cohorts/${cohortId}`);
          }}
          className="cursor-pointer flex items-center gap-2.5 font-medium py-2 text-on-surface"
        >
          <Icon icon="lucide:eye" className="w-4 h-4" />
          <span>{t('viewDetail')}</span>
        </DropdownMenuItem>

        {isAdmin && (onEdit || onDeleteRequest) && <DropdownMenuSeparator />}

        {isAdmin && onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cohortId);
            }}
            className="cursor-pointer flex items-center gap-2.5 font-medium py-2 text-on-surface"
          >
            <Icon icon="lucide:pencil" className="w-4 h-4" />
            <span>{t('edit')}</span>
          </DropdownMenuItem>
        )}

        {isAdmin && onDeleteRequest && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(cohortId, title);
            }}
            className="cursor-pointer flex items-center gap-2.5 font-semibold py-2 text-error hover:text-error hover:bg-error/10 focus:text-error focus:bg-error/10"
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
            <span>{t('delete')}</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
