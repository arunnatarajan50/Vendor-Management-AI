export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Vendorum</h1>
      <p className="mb-8 text-sm text-gray-500">Are you a vendor or a customer?</p>
      <div className="grid gap-6 sm:grid-cols-2">
        <a href="/vendor" className="border rounded-lg p-6 hover:shadow-sm transition">
          <h2 className="font-medium mb-1">I’m a Vendor</h2>
          <p className="text-sm text-gray-500">Create your profile: categories, price index, quality, lead time.</p>
        </a>
        <a href="/customer" className="border rounded-lg p-6 hover:shadow-sm transition">
          <h2 className="font-medium mb-1">I’m a Customer</h2>
          <p className="text-sm text-gray-500">Describe your needs and browse matched vendors, marketplace-style.</p>
        </a>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <a href="/import" className="border rounded-lg p-4 hover:shadow-sm transition">
          <h3 className="font-medium mb-1">Import Products</h3>
        </a>
        <a href="/matches" className="border rounded-lg p-4 hover:shadow-sm transition">
          <h3 className="font-medium mb-1">Vendor Matches</h3>
        </a>
        <a href="/health" className="border rounded-lg p-4 hover:shadow-sm transition">
          <h3 className="font-medium mb-1">Vendor Health</h3>
        </a>
      </div>
    </div>
  );
}
