/**
 * Root layout component for the application.
 * Configures global fonts, metadata, and wraps all pages.
 * @module app/layout
 */

import { Inter } from "next/font/google";
import "../styles/globals.css";

/**
 * Inter font configuration from Google Fonts.
 * @constant
 */
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

/**
 * Application metadata for SEO and browser display.
 * @constant
 */
export const metadata = {
  title: "Task Management",
  description: "Simple task manager",
};

/**
 * Root layout component that wraps all pages.
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} HTML document structure with children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
