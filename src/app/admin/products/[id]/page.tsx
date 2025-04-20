// სტატიკური გვერდი ადმინის პროდუქტის დეტალებისთვის
export function generateStaticParams() {
  const ids = [
    'CyPeQlm4lKBCy4p3IyPI',
    'Kz6AhKS52Cj3G4zCxINi',
    'rkVZ1tYjku6SSjRXLIpw',
    'sample1', 'sample2', 'sample3',
  ];
  
  return ids.map(id => ({ id }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">პროდუქტი: {params.id}</h1>
      <p>ეს გვერდი გამოიყენება სტატიკური ექსპორტისთვის.</p>
    </div>
  );
}