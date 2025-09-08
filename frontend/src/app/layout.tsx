import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcoChain Guardians - Gamified Environmental Impact',
  description: 'Transform your environmental impact into blockchain rewards. Mint evolving Guardian NFTs, earn $ECO tokens, and help save the planet.',
  keywords: ['web3', 'blockchain', 'environment', 'nft', 'defi', 'sustainability'],
  authors: [{ name: 'EcoChain Guardians Team' }],
  openGraph: {
    title: 'EcoChain Guardians',
    description: 'Gamified environmental impact tracking on blockchain',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}