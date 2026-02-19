import { useState } from "react";
import carHero from "@/assets/car-hero.jpg";
import carTesla from "@/assets/car-tesla.jpg";
import carAudi from "@/assets/car-audi.jpg";
import carBmw from "@/assets/car-bmw.jpg";
import carVw from "@/assets/car-vw.jpg";
import carMini from "@/assets/car-mini.jpg";
import carMercedes from "@/assets/car-mercedes.jpg";

const vehicles = [
  { type: "Electric", name: "Tesla Model 3", price: 499, mileage: "10k / yr", img: carTesla, category: "Electric" },
  { type: "SUV", name: "Audi Q5", price: 540, mileage: "12k / yr", img: carAudi, category: "SUV" },
  { type: "Hybrid", name: "BMW 3 Series", price: 580, mileage: "15k / yr", img: carBmw, category: "Sedan" },
  { type: "Sedan", name: "VW Passat", price: 320, mileage: "10k / yr", img: carVw, category: "Sedan" },
  { type: "Compact", name: "Mini Cooper", price: 390, mileage: "10k / yr", img: carMini, category: "Sedan" },
  { type: "Luxury", name: "Mercedes C", price: 620, mileage: "12k / yr", img: carMercedes, category: "Sedan" },
];

const testimonials = [
  {
    role: "Sales Director",
    quote: '"Seamless process."',
    body: '"I ordered my fleet vehicle directly through the portal. The financing simulation was spot on."',
    name: "Mark S.",
    initials: "MS",
  },
  {
    role: "HR Manager",
    quote: '"Great for the team."',
    body: '"Implementing JH Leasing for our employees was the best benefit decision we made this year."',
    name: "Sarah J.",
    initials: "SJ",
  },
  {
    role: "Developer",
    quote: '"Love my new EV."',
    body: '"The selection of electric vehicles is impressive. Delivery was faster than expected."',
    name: "David L.",
    initials: "DL",
  },
];

export default function Index() {
  const [activeNav, setActiveNav] = useState("Vehicles");
  const [activeType, setActiveType] = useState("All");
  const [activeBrand, setActiveBrand] = useState<string[]>([]);
  const [term, setTerm] = useState("36");
  const [vehicleValue, setVehicleValue] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [interestRate, setInterestRate] = useState("4.5");

  const typeFilters = ["All", "Sedan", "SUV", "Electric"];
  const brandFilters = ["Tesla", "Audi", "BMW", "VW"];
  const navItems = ["Vehicles", "Offers", "Financing", "Stories", "Contact"];

  const toggleBrand = (brand: string) => {
    setActiveBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const monthly = (() => {
    const P = parseFloat(vehicleValue) - parseFloat(downPayment);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseInt(term);
    if (!P || !r || !n) return "—";
    const m = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isNaN(m) ? "—" : `$${Math.round(m)}`;
  })();

  return (
    <div className="min-h-screen bg-background p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-screen-2xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-16 px-3">
          <span className="text-2xl font-bold uppercase tracking-tight">JH Leasing</span>
          <div className="neu-nav hidden md:flex gap-2 p-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-200 ${
                  activeNav === item ? "neu-inset-sm" : "hover:opacity-70"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="w-12 h-12 rounded-full flex items-center justify-center shadow-raised" style={{ background: "linear-gradient(145deg, #e6e6e6, #dedede)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </nav>

        {/* HERO */}
        <section className="grid grid-cols-12 gap-6 mb-20">
          {/* Hero Image */}
          <div
            className="col-span-12 lg:col-span-8 neu-card min-h-[500px]"
            style={{ backgroundImage: `url(${carHero})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="relative z-10 p-10 h-full flex flex-col justify-end" style={{ minHeight: 500 }}>
              <span className="label-micro mb-2">Featured Fleet</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="neu-card flex-1">
              <div className="p-10 h-full flex flex-col justify-between" style={{ minHeight: 280 }}>
                <div>
                  <span className="label-micro mb-3 block">New Arrival</span>
                  <h1 className="heading-xl mb-6">Your next car at a preferred price</h1>
                </div>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", maxWidth: "48ch" }}>
                  Corporate leasing made simple. Premium fleet access for employees with full maintenance included.
                </p>
              </div>
            </div>

            <div
              className="neu-accent cursor-pointer transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3" style={{ minHeight: 200 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs uppercase tracking-widest font-bold">Start Now</span>
                <span className="heading-md">Get a Quote</span>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER + VEHICLES */}
        <section className="grid grid-cols-12 gap-6 mb-24">
          {/* Filter Sidebar */}
          <div className="col-span-12 lg:col-span-3 neu-card h-fit">
            <div className="p-10">
              {/* Type */}
              <div className="mb-8">
                <span className="label-micro mb-3 block">Vehicle Type</span>
                <div className="flex flex-wrap gap-3 mt-3">
                  {typeFilters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveType(f)}
                      className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                        activeType === f ? "neu-inset-sm" : "neu-tag"
                      }`}
                      style={activeType === f ? { color: "hsl(var(--primary))" } : {}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <span className="label-micro mb-3 block">Price Range</span>
                <div className="relative mt-4 h-3 rounded-full" style={{ background: "hsl(var(--background))", boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff" }}>
                  <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer" style={{ left: "60%", transform: "translate(-50%, -50%)", background: "hsl(var(--primary))", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }} />
                </div>
                <div className="flex justify-between text-xs mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span>$300</span>
                  <span>$1200</span>
                </div>
              </div>

              {/* Brand */}
              <div>
                <span className="label-micro mb-3 block">Brand</span>
                <div className="flex flex-wrap gap-3 mt-3">
                  {brandFilters.map((b) => (
                    <button
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                        activeBrand.includes(b) ? "neu-inset-sm" : "neu-tag"
                      }`}
                      style={activeBrand.includes(b) ? { color: "hsl(var(--primary))" } : {}}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div key={v.name} className="neu-card transition-transform duration-300 hover:-translate-y-2 cursor-pointer">
                <div className="p-8 h-full flex flex-col" style={{ minHeight: 400 }}>
                  <span className="label-micro mb-2">{v.type}</span>
                  <h3 className="heading-md mb-4">{v.name}</h3>

                  <div
                    className="rounded-3xl mb-6 overflow-hidden"
                    style={{ height: 160, boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}
                  >
                    <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t mt-auto pt-5" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                    <div>
                      <span className="label-micro">Monthly</span>
                      <p className="text-2xl font-light">${v.price}</p>
                    </div>
                    <div>
                      <span className="label-micro">Mileage</span>
                      <p className="text-sm font-semibold">{v.mileage}</p>
                    </div>
                  </div>

                  <button
                    className="mt-5 w-full py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  >
                    Simulate
                  </button>
                  <button
                    className="mt-3 w-full py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200"
                    style={{ boxShadow: "6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff", background: "transparent" }}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMO BANNER */}
        <section className="mb-20">
          <div className="neu-accent">
            <div className="p-16 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <span className="label-micro mb-3 block" style={{ color: "rgba(0,0,0,0.6)" }}>Limited Time</span>
                <h2 className="heading-lg">Summer Fleet<br />Special</h2>
              </div>
              <div className="text-center md:text-right">
                <span className="label-micro mb-3 block" style={{ color: "rgba(0,0,0,0.6)" }}>Ends</span>
                <p className="text-5xl font-light uppercase">Aug 31</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINANCING SIMULATOR */}
        <section className="mb-20">
          <div className="neu-card">
            <div className="p-16">
              <span className="label-micro mb-3 block">Tools</span>
              <h2 className="heading-lg mb-12">Financing Simulator</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Column 1 */}
                <div>
                  <div className="mb-6">
                    <label className="label-micro mb-2 block">Vehicle Value</label>
                    <input
                      type="number"
                      value={vehicleValue}
                      onChange={(e) => setVehicleValue(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-none outline-none text-sm"
                      style={{ background: "hsl(var(--background))", boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label className="label-micro mb-2 block">Down Payment</label>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-none outline-none text-sm"
                      style={{ background: "hsl(var(--background))", boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <div className="mb-6">
                    <label className="label-micro mb-2 block">Term (Months)</label>
                    <div className="flex gap-3 mt-2">
                      {["24", "36", "48"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTerm(t)}
                          className={`flex-1 py-4 rounded-xl text-sm font-semibold transition-all ${
                            term === t ? "neu-inset-sm" : "neu-tag"
                          }`}
                          style={term === t ? { color: "hsl(var(--primary))" } : {}}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-micro mb-2 block">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-none outline-none text-sm"
                      style={{ background: "hsl(var(--background))", boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff", fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                {/* Column 3 — Result */}
                <div className="flex flex-col items-center justify-center neu-accent rounded-3xl p-10 text-center">
                  <span className="label-micro mb-4 block" style={{ color: "rgba(0,0,0,0.6)" }}>Estimated Monthly</span>
                  <p className="text-6xl font-light mb-2">{monthly}</p>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "rgba(0,0,0,0.5)" }}>Excl. Tax</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mb-20">
          <div className="flex gap-6 overflow-x-auto pb-10 pt-4 -mt-4 px-4 -mx-4" style={{ scrollbarWidth: "none" }}>
            {testimonials.map((t) => (
              <div key={t.name} className="neu-card flex-shrink-0" style={{ minWidth: 340 }}>
                <div className="p-10">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-lg font-bold"
                    style={{
                      boxShadow: "-12px -12px 24px #FFFFFF, 12px 12px 24px #CFCFCF",
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                    }}
                  >
                    {t.initials}
                  </div>
                  <span className="label-micro mb-2 block">{t.role}</span>
                  <p className="heading-md mb-4">{t.quote}</p>
                  <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>{t.body}</p>
                  <p className="text-xs font-bold uppercase tracking-widest">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t pt-16 mb-8" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-xl font-bold uppercase tracking-tight mb-3">JH Leasing</p>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Corporate fleet solutions for the modern workforce.</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Fleet</h4>
              {["Vehicles", "Offers", "Electric"].map((l) => (
                <a key={l} href="#" className="block text-sm mb-3 hover:opacity-70 transition-opacity">{l}</a>
              ))}
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Support</h4>
              {["Help Center", "Contact", "Privacy Policy"].map((l) => (
                <a key={l} href="#" className="block text-sm mb-3 hover:opacity-70 transition-opacity">{l}</a>
              ))}
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Contact</h4>
              <a href="tel:18005453273" className="block text-sm mb-3 hover:opacity-70 transition-opacity">1-800-JH-LEASE</a>
              <a href="mailto:support@jhleasing.com" className="block text-sm mb-3 hover:opacity-70 transition-opacity">support@jhleasing.com</a>
              <button
                className="mt-2 px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                Live Chat
              </button>
            </div>
          </div>
          <div className="mt-12 text-xs text-center pb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
            © 2026 JH Leasing. All rights reserved.
          </div>
        </footer>

      </div>
    </div>
  );
}
