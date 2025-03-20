"use client"; // Convert layout to a client component
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage for user info
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <nav className="bg-gray-900 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl font-bold cursor-pointer">
                Ticket Booking
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {/* If user is not logged in, show Register/Login links */}
              {!user && (
                <>
                  <Link
                    href="/"
                    className="px-3 py-2 hover:bg-gray-800 rounded"
                  >
                    Home
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 hover:bg-gray-800 rounded"
                  >
                    Register
                  </Link>
                  <Link
                    href="/login"
                    className="px-3 py-2 hover:bg-gray-800 rounded"
                  >
                    Login
                  </Link>
                </>
              )}
              {/* If user is logged in, show user name + dropdown */}
              {user && (
                <div className="relative group inline-block">
                  <button className="px-3 py-2 hover:bg-gray-800 rounded">
                    {user.name}
                  </button>
                  <div className="absolute left-0 top-full hidden group-hover:block bg-gray-800 rounded shadow z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/tickets"
                      className="block px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Tickets
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-left w-full px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto mt-6 px-4">{children}</main>
      </body>
    </html>
  );
}
