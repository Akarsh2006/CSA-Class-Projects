import './globals.css';

export const metadata = {
  title: 'CSA Class Projects',
  description: 'Showcase of amazing class projects',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
