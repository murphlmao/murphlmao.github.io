import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://murph.rip'),
  title: {
    default: "Murphy Malcolm",
    template: "%s | Murphy Malcolm"
  },
  description: "Full Stack Developer",
  keywords: ["Full Stack Developer", "Software Engineering", "Python", "Software", "Rust", "Web Development", "JavaScript", "TypeScript", "Next.JS", "React", "Node.js", "Go", "C#"],
  authors: [{ name: "Murphy Malcolm", url: "https://murph.rip" }],
  creator: "Murphy Malcolm",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://murph.rip',
    siteName: 'Murphy Malcolm',
    title: 'Murphy Malcolm',
    description: 'Full Stack Developer.',
    images: [
      {
        url: '/images/profile.jpg',
        width: 1200,
        height: 630,
        alt: 'Murphy Malcolm',
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.theme === 'light') {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans"
      >
        <Navbar />
        <div className="pt-32">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
