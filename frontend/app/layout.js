import "../styles/globals.css";

export const metadata = {
  title: "Task Management",
  description: "Simple task manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
