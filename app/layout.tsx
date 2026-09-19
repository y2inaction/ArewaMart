import "./globals.css";
import { Header } from "@/components/Header";

export const metadata = {
  title: "ArewaMart — Saye da Sayarwa",
  description: "Hausa-first trusted marketplace for Northern Nigeria."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ha">
      <body>
        <Header />
        {children}
        <footer className="mt-20 border-t bg-white">
          <div className="container py-10 grid gap-6 md:grid-cols-3 text-sm text-gray-600">
            <div>
              <div className="text-xl font-black text-emerald-800">ArewaMart</div>
              <p className="mt-2">Saye da Sayarwa — amintaccen kasuwar yanar gizo ta Arewa.</p>
            </div>
            <div><b className="text-gray-900">Ga masu saye</b><p className="mt-2">Kayayyaki · Masu sayarwa · Oda · Taimako</p></div>
            <div><b className="text-gray-900">Ga masu sayarwa</b><p className="mt-2">Bude shago · Saka kaya · Gudanar da oda</p></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
