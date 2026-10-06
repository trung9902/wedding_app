import './globals.css';

export const metadata = {
  title: 'Thiệp Mời Cưới Hoàng Gia - Wedding Invitation',
  description: 'Trân trọng kính mời quý khách và gia đình đến chung vui trong ngày trọng đại của chúng tôi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#FAF7F2] text-[#2C2018] antialiased selection:bg-[#ECC880]/30 selection:text-[#5E121E] min-h-screen">
        {children}
      </body>
    </html>
  );
}
