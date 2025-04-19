// ფაილი რომელიც ცვლის Next.js-ის RSC ფაილების მოქმედებას
// მიზანია RSC ფაილების გამორთვა სტატიკური ექსპორტისას

// ორიგინალური მოდულის ინტერფეისი
module.exports = {
  routeModule: {
    render: async () => {
      return {
        html: '',
        headers: {}
      };
    },
    generateStaticParams: () => [],
    generateMetadata: () => ({}),
    preferredRegion: 'auto',
    dynamic: 'auto',
    revalidate: false,
    fetchCache: 'auto',
    isDynamicRouteModule: false
  }
}; 