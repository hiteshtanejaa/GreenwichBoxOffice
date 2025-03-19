"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    Name: "",
    EmailID: "",
    PhoneNumber: "",
    PostCode: "",
    Address: "",
    CustomerType: "",
    Username: "",
    Password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }
      // Save user info to localStorage or context
      localStorage.setItem("user", JSON.stringify({ name: data.name, userId: data.userId }));
      alert("Registration successful!");
      // Force the layout to refresh (re-run) and see the new user
        router.refresh();
      // Redirect to booking page
      router.push("/book");
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          placeholder="Name"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <input
          placeholder="Email"
          name="EmailID"
          value={formData.EmailID}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <input
          placeholder="Phone Number"
          name="PhoneNumber"
          value={formData.PhoneNumber}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          placeholder="Post Code"
          name="PostCode"
          value={formData.PostCode}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          placeholder="Address"
          name="Address"
          value={formData.Address}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <select
            name="CustomerType"
            value={formData.CustomerType}
            onChange={handleChange}
            className="border p-2 w-full"
            required
            >
            <option value="">Select Customer Type</option>
            <option value="Adult">Adult</option>
            <option value="Children">Children</option>
            <option value="Old Age Pensioners">Old Age Pensioners</option>
            <option value="Social Group">Social Group</option>
            </select>
        <input
          placeholder="Username"
          name="Username"
          value={formData.Username}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          name="Password"
          value={formData.Password}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <button className="bg-blue-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
