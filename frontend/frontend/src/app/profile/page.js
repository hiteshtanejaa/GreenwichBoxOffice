"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const { userId } = JSON.parse(storedUser);

    fetch(`http://localhost:3000/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  if (!profile) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <p><strong>Name:</strong> {profile.Name}</p>
      <p><strong>Email:</strong> {profile.EmailID}</p>
      <p><strong>Phone:</strong> {profile.PhoneNumber}</p>
      <p><strong>Address:</strong> {profile.Address}</p>
      <p><strong>Post Code:</strong> {profile.PostCode}</p>
      <p><strong>Customer Type:</strong> {profile.CustomerType}</p>
    </div>
  );
}
