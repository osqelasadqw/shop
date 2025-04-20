// სკრიპტი, რომელიც ამზადებს პროექტს სტატიკური ბილდისთვის
const fs = require('fs');
const path = require('path');

// ფაილები, რომლებიც უნდა შეიცვალოს
const filesToModify = [
  {
    path: path.join(__dirname, 'app/admin/products/[id]/page.tsx'),
    content: `
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
`
  },
  {
    path: path.join(__dirname, 'app/shop/product/[id]/page.tsx'),
    content: `
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

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">პროდუქტი: {params.id}</h1>
      <p>ეს გვერდი გამოიყენება სტატიკური ექსპორტისთვის.</p>
    </div>
  );
}
`
  }
];

// მთავარი ფუნქცია, რომელიც ცვლის ფაილებს
function modifyFiles() {
  console.log('დაიწყო ფაილების მოდიფიცირება ბილდისთვის...');
  
  for (const file of filesToModify) {
    try {
      // შემოწმება, არსებობს თუ არა დირექტორია და საჭიროების შემთხვევაში შექმნა
      const dir = path.dirname(file.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`შეიქმნა დირექტორია: ${dir}`);
      }
      
      // დაწერა ფაილის
      fs.writeFileSync(file.path, file.content.trim());
      console.log(`ფაილი წარმატებით მოდიფიცირდა: ${file.path}`);
    } catch (error) {
      console.error(`შეცდომა ფაილის მოდიფიცირებისას ${file.path}:`, error);
    }
  }
  
  console.log('ფაილების მოდიფიცირება დასრულდა!');
}

// გაუშვით ფუნქცია თუ პირდაპირ ამ სკრიპტს ვასრულებთ
if (require.main === module) {
  modifyFiles();
}

module.exports = { modifyFiles }; 