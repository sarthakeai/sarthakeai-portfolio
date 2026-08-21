import { BookingProvider } from "./BookingExperience";
import { MotionController } from "./MotionController";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PageFrame({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <BookingProvider>
      <main>
        <a className="skip-link" href="#content">Skip to content</a>
        <MotionController />
        <SiteHeader />
        <div id="content">{children}</div>
        <SiteFooter />
      </main>
    </BookingProvider>
  );
}
