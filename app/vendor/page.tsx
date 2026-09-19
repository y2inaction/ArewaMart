export default function VendorPage() {
  return <main className="container py-12 max-w-4xl">
    <div className="rounded-3xl bg-emerald-900 text-white p-10"><p className="font-bold text-emerald-200">AREWAMART VENDOR</p><h1 className="text-4xl font-black mt-2">Sayar da kayanka ga kwastomomin Arewa.</h1><p className="mt-4 text-emerald-50 max-w-2xl">Wannan shafin zai zama cibiyar onboarding, vendor verification, product management, orders da settlements.</p></div>
    <div className="grid md:grid-cols-3 gap-4 mt-8">{["Bude shago", "Saka kayayyaki", "Karɓi oda"].map((x,i)=><div className="bg-white border rounded-2xl p-6" key={x}><div className="text-3xl font-black text-emerald-700">0{i+1}</div><h2 className="font-bold mt-3">{x}</h2><p className="text-sm text-gray-500 mt-2">An shirya wannan tsarin don haɓaka zuwa cikakken vendor dashboard.</p></div>)}</div>
  </main>;
}
