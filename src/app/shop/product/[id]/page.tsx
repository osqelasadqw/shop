// სტატიკური გვერდი პროდუქტის დეტალებისთვის
export function generateStaticParams() {
  const ids = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  return ids.map(id => ({ id }));
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6">
          <ol className="flex text-sm">
            <li className="mr-2">
              <a href="/shop" className="text-blue-500 hover:text-blue-700">მთავარი</a>
            </li>
            <li className="mx-2 text-gray-500">/</li>
            <li className="mr-2">
              <a href="/shop/categories" className="text-blue-500 hover:text-blue-700">კატეგორიები</a>
            </li>
            <li className="mx-2 text-gray-500">/</li>
            <li className="text-gray-700">პროდუქტი {params.id}</li>
          </ol>
        </nav>
      
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: "300px" }}>
              <p className="text-gray-500">პროდუქტის სურათი</p>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-4">პროდუქტი: {params.id}</h1>
              <div className="text-xl font-semibold mb-2 text-green-600">₾100.00</div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ეს არის სტატიკური შაბლონი პროდუქტის გვერდისთვის. რეალური პროდუქტის 
                  სანახავად გამოიყენეთ რანტაიმ ვერსია.
                </p>
                <p className="text-gray-700">
                  პროდუქტის აღწერა განთავსდება აქ. ეს არის მხოლოდ სტატიკური დემონსტრაციის გვერდი, 
                  რომელიც გენერირდება ბილდის დროს GitHub Pages-ზე გამოსაქვეყნებლად.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <a 
                  href="/shop" 
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  მაღაზიაში დაბრუნება
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}