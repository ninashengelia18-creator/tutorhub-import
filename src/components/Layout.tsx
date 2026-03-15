import { Header } from "./Header";
import { Footer } from "./Footer";
import { TidioLanguageSync } from "./TidioLanguageSync";

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <TidioLanguageSync />
    </div>
  );
}
