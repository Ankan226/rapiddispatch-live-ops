import "./globals.css";

export const metadata = {
  title: "RapidDispatch Live Ops Helpdesk",
  description: "Real-time collaborative support ticket board",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}