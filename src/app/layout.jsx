import './globals.css';

export const metadata = {
  title: 'BuildFolio | 2024-28 CS-A Student Projects',
  description: 'Discover the amazing work created by CS-A students.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light scroll-smooth">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Tailwind CDN with academic config */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography" />
        <script
          id="tailwind-config"
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: "class",
                theme: {
                  extend: {
                    colors: {
                      "primary": "#000000",
                      "on-primary": "#ffffff",
                      "primary-container": "#131b2e",
                      "on-primary-container": "#7c839b",
                      "primary-fixed": "#dae2fd",
                      "primary-fixed-dim": "#bec6e0",
                      "inverse-primary": "#bec6e0",
                      "secondary": "#0058be",
                      "on-secondary": "#ffffff",
                      "secondary-container": "#2170e4",
                      "on-secondary-container": "#fefcff",
                      "secondary-fixed": "#d8e2ff",
                      "secondary-fixed-dim": "#adc6ff",
                      "tertiary": "#000000",
                      "on-tertiary": "#ffffff",
                      "tertiary-container": "#0b1c30",
                      "on-tertiary-container": "#75859d",
                      "tertiary-fixed": "#d3e4fe",
                      "tertiary-fixed-dim": "#b7c8e1",
                      "error": "#ba1a1a",
                      "on-error": "#ffffff",
                      "error-container": "#ffdad6",
                      "on-error-container": "#93000a",
                      "surface": "#f7f9fb",
                      "surface-dim": "#d8dadc",
                      "surface-bright": "#f7f9fb",
                      "surface-container-lowest": "#ffffff",
                      "surface-container-low": "#f2f4f6",
                      "surface-container": "#eceef0",
                      "surface-container-high": "#e6e8ea",
                      "surface-container-highest": "#e0e3e5",
                      "surface-variant": "#e0e3e5",
                      "on-surface": "#191c1e",
                      "on-surface-variant": "#45464d",
                      "inverse-surface": "#2d3133",
                      "inverse-on-surface": "#eff1f3",
                      "background": "#f7f9fb",
                      "on-background": "#191c1e",
                      "outline": "#76777d",
                      "outline-variant": "#c6c6cd",
                      "surface-tint": "#565e74",
                      "on-primary-fixed": "#131b2e",
                      "on-primary-fixed-variant": "#3f465c",
                      "on-secondary-fixed": "#001a42",
                      "on-secondary-fixed-variant": "#004395",
                      "on-tertiary-fixed": "#0b1c30",
                      "on-tertiary-fixed-variant": "#38485d",
                    },
                    borderRadius: {
                      DEFAULT: "0.25rem",
                      lg: "0.5rem",
                      xl: "0.75rem",
                      full: "9999px",
                    },
                    spacing: {
                      "stack-sm": "8px",
                      "stack-md": "16px",
                      "stack-lg": "32px",
                      "stack-xl": "64px",
                      "margin-x": "32px",
                      "gutter": "24px",
                      "container-max": "1280px",
                    },
                    fontFamily: {
                      "display": ["Manrope"],
                      "headline-lg": ["Manrope"],
                      "headline-lg-mobile": ["Manrope"],
                      "headline-md": ["Manrope"],
                      "body-lg": ["Inter"],
                      "body-md": ["Inter"],
                      "label-md": ["JetBrains Mono"],
                      "label-sm": ["JetBrains Mono"],
                    },
                    fontSize: {
                      "display": ["64px", { lineHeight: "72px", letterSpacing: "-0.02em", fontWeight: "800" }],
                      "display-mobile": ["clamp(2.25rem, 10vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
                      "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
                      "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
                      "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
                      "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
                      "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
                      "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" }],
                      "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
                    },
                  },
                },
              };
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block; vertical-align: middle; line-height: 1;
          }
          .glass-card {
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0,0,0,0.05);
          }
          .glass-panel {
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0,0,0,0.05);
          }
          .card-blur { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
          .hero-gradient { background: radial-gradient(circle at 50% -20%, #dae2fd 0%, transparent 70%); }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .input-academic:focus { outline: none; border-color: #000000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
          .input-focus:focus { outline: none; border-color: #000000; }
          input:focus, textarea:focus, select:focus { outline: none; }
          body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
