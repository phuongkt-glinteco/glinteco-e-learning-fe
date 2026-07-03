import LandingPageContainer from '@/components/features/landing/containers/landing-page-container';
import { ScrollArea } from '@/components/ui/default/scroll-area';

export default function HomePage() {
  return (
    <ScrollArea 
      className="h-svh w-full"
      viewportClassName="[&>div]:!block [&>div]:!min-h-full [&>div]:!w-full [&>div]:!flex [&>div]:!flex-col"
    >
      <LandingPageContainer />
    </ScrollArea>
  );
}
