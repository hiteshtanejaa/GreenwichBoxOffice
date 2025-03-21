"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username, Password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }
      // Save user info to localStorage or context
      localStorage.setItem("user", JSON.stringify({ name: data.name, userId: data.userId, isAdmin: data.isAdmin }));
      alert("Login successful!");
      // Force the layout to refresh (re-run) and see the new user
        router.refresh();
      // Redirect to booking page
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          placeholder="Username"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button className="bg-green-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
