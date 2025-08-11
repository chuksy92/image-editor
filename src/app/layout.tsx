import './global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <title>Gemini Image Editor</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>{children}</body>
        </html>
    );
}