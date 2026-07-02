import './globals.css';

export const metadata = {
  title: 'ProjectHub | 2024-28 CS-A Student Projects',
  description: 'Discover the amazing work created by CS-A students.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
