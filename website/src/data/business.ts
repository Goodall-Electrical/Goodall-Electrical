// Single source of truth for business contact details and identity.
// Change any value here and it propagates across the entire site.

export const business = {
  name: "Goodall Electrical",
  legalName: "Goodall Electrical",
  acn: "684 711 224",

  phone: {
    display:       "03 4130 5012",     // Pretty number for humans
    tel:           "0341305012",        // For <a href="tel:...">
    international: "+61341305012",      // For schema.org telephone
  },

  email: "office@goodallelectrical.com.au", // TODO: confirm real inbox before deploy

  address: {
    street:   "Unit 5/9 Wellington Park Way",
    locality: "Sale",
    region:   "VIC",
    postcode: "3850",
    country:  "AU",
    countryName: "Australia",
  },

  // Single-line address for compact display.
  addressOneLine: "Unit 5/9 Wellington Park Way, Sale VIC 3850",

  hours: {
    weekdays:  { open: "07:00", close: "17:00", display: "Mon–Fri · 7am–5pm" },
    emergency: true,
  },

  serviceArea: {
    display: "Gippsland",
    full:    "Gippsland, Victoria, Australia",
  },

  // Marketing strap-line shown across the site.
  tagline: "Wired for Gippsland.",

  // Canonical site URL — used for absolute links in schema and sitemap.
  url: "https://goodallelectrical.com.au",

  // Service-call pricing for TV antenna jobs. Update here and it propagates
  // across the antennas landing page, every per-town page and any FAQ
  // mentions automatically.
  antennaRates: {
    serviceCall: {
      amount: 149,
      currency: "AUD",
      label: "Service call",
      tagline: "Mon–Fri · 7am–5pm",
      priceSuffix: "inc GST",
      detail: "Includes the first 30 minutes of labour on site, during business hours.",
    },
    continuingLabour: {
      amount: 125,
      currency: "AUD",
      label: "After the first 30 minutes",
      tagline: "Mon–Fri · 7am–5pm",
      priceSuffix: "/ hr + GST",
      detail: "Billed in 30-minute blocks, during business hours.",
    },
    afterHours: {
      amount: 195,
      currency: "AUD",
      label: "Weekend & after-hours",
      tagline: "Per hour",
      priceSuffix: "/ hr + GST",
      detail: "Outside business hours, weekends and public holidays. Charged from when we leave our Sale warehouse to when we return.",
    },
    note: "Business hours are Monday to Friday, 7am to 5pm, excluding public holidays. Anything outside that runs at the after-hours rate. The service call is GST-inclusive; ongoing labour rates are plus GST. Materials (Matchmaster antenna, mast, brackets, cable) are quoted on site.",
  },
} as const;

// Convenience: full schema.org LocalBusiness object you can spread into a script tag.
export function localBusinessSchema(extras: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "name": business.name,
    "telephone": business.phone.international,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address.street,
      "addressLocality": business.address.locality,
      "addressRegion": business.address.region,
      "postalCode": business.address.postcode,
      "addressCountry": business.address.country,
    },
    "areaServed": business.serviceArea.full,
    "url": business.url,
    "identifier": `ACN ${business.acn}`,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": business.hours.weekdays.open,
        "closes": business.hours.weekdays.close,
      },
    ],
    ...extras,
  };
}
