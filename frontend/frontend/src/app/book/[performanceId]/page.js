"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BookingPage() {
  const { performanceId } = useParams();
  const router = useRouter();

  // Performance details
  const [performance, setPerformance] = useState(null);

  // Ticket selection (categories)
  const [categories, setCategories] = useState({
    adults: { band: "", qty: 0 },
    children: { band: "", qty: 0 },
    oap: { band: "", qty: 0 },
    social: { band: "", qty: 0 },
  });

  // Payment details state
  const [payment, setPayment] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolderName: "",
  });

  // Shipping details state
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    zip: "",
  });

  // We'll track baseCost, discount, and finalTotal
  const [baseCost, setBaseCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // 1) Fetch performance details on mount
  useEffect(() => {
    fetch(`http://localhost:3000/api/performance/${performanceId}`)
      .then((res) => res.json())
      .then((data) => {
        // If your endpoint returns an array, take the first element
        setPerformance(Array.isArray(data) ? data[0] : data);
      })
      .catch((err) => console.error("Error fetching performance:", err));
  }, [performanceId]);

  // 2) Recalculate costs whenever categories or performance changes
  useEffect(() => {
    if (!performance) return;

    // discountRates: base discount percentages for each user type
    const discountRates = {
      adults: 0,      // no discount
      children: 25,   // 25%
      oap: 25,        // 25%
      social: 5,      // 5%
    };

    let sum = 0;          // base cost of all tickets
    let discountSum = 0;  // total discount across categories
    let totalTickets = 0; // total quantity across all categories

    Object.entries(categories).forEach(([cat, { band, qty }]) => {
      if (!band || qty <= 0) return;
      const ticketPrice = performance[band] || 0; // e.g. performance.Band1
      sum += ticketPrice * qty;
      totalTickets += qty;

      // apply discount for children, oap, social
      const baseRate = discountRates[cat] || 0;
      const discountForThisCat = (ticketPrice * baseRate / 100) * qty;
      discountSum += discountForThisCat;
    });

    // Extra 5% discount if totalTickets > 20
    if (totalTickets > 20) {
      const leftover = sum - discountSum;
      const extra = leftover * 0.05; // 5% of the remainder
      discountSum += extra;
    }

    // final total = base cost - total discount
    const final = sum - discountSum;

    setBaseCost(sum);
    setDiscount(discountSum < 0 ? 0 : discountSum);
    setFinalTotal(final < 0 ? 0 : final);
  }, [categories, performance]);

  // Handlers for category changes
  const handleCategoryChange = (category, field, value) => {
    setCategories((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: field === "qty" ? parseInt(value, 10) || 0 : value,
      },
    }));
  };

  // Payment details
  const handlePaymentChange = (field, value) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  // Shipping details
  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  // Dummy VISA check
  const visaCheck = () => {
    if (!payment.cardNumber.startsWith("4")) {
      alert("Invalid VISA card number");
      return false;
    }
    if (!payment.expiry || !payment.cvv || !payment.cardHolderName) {
      alert("Please fill in all credit card fields");
      return false;
    }
    return true;
  };

  // Conditions
  const hasTickets = Object.values(categories).some((c) => c.qty > 0);
  const isPaymentFilled = () =>
    payment.cardNumber && payment.expiry && payment.cvv && payment.cardHolderName;
  const isShippingFilled = () =>
    shipping.address && shipping.city && shipping.zip;

  // 3) Confirm booking
  const handleConfirm = async () => {
    if (!hasTickets) {
      alert("Please select at least one ticket.");
      return;
    }
    if (!isPaymentFilled()) {
      alert("Please complete your payment details.");
      return;
    }
    if (shippingEnabled && !isShippingFilled()) {
      alert("Please complete your shipping details.");
      return;
    }
    if (!visaCheck()) return;

    // Retrieve logged-in user info
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please log in to complete booking.");
      router.push("/login");
      return;
    }
    const { userId } = JSON.parse(storedUser);

    // Build booking data
    const bookingData = {
      userId,
      performanceId: Number(performanceId),
      eventId: performance.EventID,
      totalAmount: finalTotal, // pass finalTotal to the backend
      payment,
      shipping: shippingEnabled ? shipping : null,
      categories,
      performanceDetails: performance,
    };

    try {
      const res = await fetch("http://localhost:3000/api/completeBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Booking failed");
        return;
      }
      alert("Booking confirmed!");
      router.push(`/confirmation/${data.bookingId}`);
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("An error occurred while processing your booking.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">
        Book Tickets for Performance {performanceId}
      </h1>
      <div className="flex gap-6">
        {/* Left side: Ticket Selection */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold">Select Tickets</h2>
          {["adults", "children", "oap", "social"].map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <label className="w-24 capitalize">{cat}:</label>
              <select
                className="border p-1"
                value={categories[cat].band}
                onChange={(e) => handleCategoryChange(cat, "band", e.target.value)}
              >
                <option value="">Select Band</option>
                <option value="Band1">Band1</option>
                <option value="Band2">Band2</option>
                <option value="Band3">Band3</option>
              </select>
              <input
                type="number"
                className="border p-1 w-16"
                min="0"
                value={categories[cat].qty}
                onChange={(e) => handleCategoryChange(cat, "qty", e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Right side: Pricing Summary */}
        <div className="w-64 bg-white p-4 rounded shadow space-y-2">
          <h3 className="font-bold text-lg">Pricing</h3>
          <p>Band1: £{performance?.Band1?.toFixed(2)}</p>
          <p>Band2: £{performance?.Band2?.toFixed(2)}</p>
          <p>Band3: £{performance?.Band3?.toFixed(2)}</p>
          <div className="border-t mt-2 pt-2">
            <p><strong>Base Cost:</strong> £{baseCost.toFixed(2)}</p>
            <p><strong>Discount:</strong> £{discount.toFixed(2)}</p>
            <h3 className="font-bold">
              Total: £{finalTotal.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* Payment & Shipping Section */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Payment Details</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Card Number (VISA)"
            className="border p-2"
            value={payment.cardNumber}
            onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
          />
          <input
            type="text"
            placeholder="Expiry Date (MM/YY)"
            className="border p-2"
            value={payment.expiry}
            onChange={(e) => handlePaymentChange("expiry", e.target.value)}
          />
          <input
            type="text"
            placeholder="CVV"
            className="border p-2"
            value={payment.cvv}
            onChange={(e) => handlePaymentChange("cvv", e.target.value)}
          />
          <input
            type="text"
            placeholder="Cardholder Name"
            className="border p-2"
            value={payment.cardHolderName}
            onChange={(e) => handlePaymentChange("cardHolderName", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shippingEnabled}
            onChange={(e) => setShippingEnabled(e.target.checked)}
          />
          <label>Ship tickets to me</label>
        </div>
        {shippingEnabled && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Shipping Address"
              className="border p-2"
              value={shipping.address}
              onChange={(e) => handleShippingChange("address", e.target.value)}
            />
            <input
              type="text"
              placeholder="City"
              className="border p-2"
              value={shipping.city}
              onChange={(e) => handleShippingChange("city", e.target.value)}
            />
            <input
              type="text"
              placeholder="ZIP Code"
              className="border p-2"
              value={shipping.zip}
              onChange={(e) => handleShippingChange("zip", e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Confirm Booking Button */}
      <button
        onClick={handleConfirm}
        disabled={
          !hasTickets ||
          !isPaymentFilled() ||
          (shippingEnabled && !isShippingFilled())
        }
        className={`px-4 py-2 rounded ${
          hasTickets && isPaymentFilled() && (!shippingEnabled || isShippingFilled())
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        Confirm Booking
      </button>
    </div>
  );
}
