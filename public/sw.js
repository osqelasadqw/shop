// სერვის ვორკერი, რომელიც ეხმარება RSC ჩატვირთვის პრობლემების გადაჭრაში

// კეშის სახელი
const CACHE_NAME = 'onlyne-shop-cache-v1';

// დააინსტალირე სერვის ვორკერი
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed!');
});

// აქტივაცია
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated!');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// ვიჭერთ ქსელის მოთხოვნებს
self.addEventListener('fetch', (event) => {
  // RSC ფაილების მოთხოვნების დათრევა და ჩახშობა
  if (event.request.url.includes('index.txt?_rsc=')) {
    event.respondWith(
      new Response(JSON.stringify({ 
        message: "მოკლე პასუხი რესურსისთვის",
        type: "რესურსი ჩახშობილია" 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  }

  // ნორმალური მოთხოვნებისთვის
  event.respondWith(
    fetch(event.request)
      .catch((error) => {
        console.log('Fetch failed; returning offline page instead.', error);
        // RSC ფაილებისთვის ჩახშობა
        if (event.request.url.includes('index.txt?_rsc=')) {
          return new Response(JSON.stringify({ message: "ჩახშობილი რესურსი" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // ცარიელი პასუხის დაბრუნება
        return new Response('', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
}); 