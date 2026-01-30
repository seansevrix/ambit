// backend/jobs/sources/publicPortals.js

module.exports.PUBLIC_PORTALS = [
  {
    key: "LACO_RSS",
    name: "Los Angeles County Solicitations",
    kind: "rss",
    url: "https://camisvr.co.la.ca.us/LACoBids/RssFeed",
    segment: "COMMERCIAL",
  },
  {
    key: "PLANETBIDS_47688",
    name: "PlanetBids Public Portal 47688",
    kind: "planetbids_html",
    url: "https://vendors.planetbids.com/portal/47688/bo/bo-search",
    segment: "COMMERCIAL",
  },
];
