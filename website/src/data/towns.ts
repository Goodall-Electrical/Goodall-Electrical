// Master per-town content used by /areas/[town] hub pages.
//
// These are the town-level intros — not service-specific. Service-specific
// town content lives in antenna-towns.ts and electrical-towns.ts.
//
// Keep the town list in sync with antenna-towns.ts and electrical-towns.ts
// (same 20 Gippsland towns, same slugs).

export interface Town {
  name: string;
  slug: string;
  region: string;
  postcode: string;
  intro: string;        // 2 short paragraphs — the town + the work we do there
  nearby: string[];     // 4 nearby town slugs
}

export const towns: Town[] = [
  // ── Sale / Maffra core ─────────────────────────────────────────────
  {
    name: "Sale",
    slug: "sale",
    region: "Wellington Shire",
    postcode: "3850",
    intro:
      "Sale is the largest town in Wellington Shire and Goodall Electrical's home base. About 14,000 people, mostly residential housing stock spanning older brick homes through to newer estates on the edges, with a steady spine of commercial and hospitality businesses through the centre. Mount Tassie reception is clean in town and the grid is strong.\n\nWe cover the full range of work in Sale — electrical, AV, automation, communications and TV antennas — and being based here means we get to most central-area jobs faster than anyone in the region.",
    nearby: ["maffra", "longford", "stratford", "rosedale"],
  },
  {
    name: "Maffra",
    slug: "maffra",
    region: "Wellington Shire",
    postcode: "3860",
    intro:
      "Maffra sits about 20 minutes north of Sale across the Avon River, surrounded by dairy country. A mix of town homes, dairy operations and lifestyle blocks on the surrounding land. Strong Mount Tassie reception and a reasonable grid, with rural-block runs adding distance to most off-town jobs.\n\nIn Maffra we split our time between town electrical and AV work, and rural three-phase / shed / pump installs for the dairies and farms. Same crew handles both.",
    nearby: ["sale", "boisdale", "newry", "tinamba"],
  },
  {
    name: "Stratford",
    slug: "stratford",
    region: "Wellington Shire",
    postcode: "3862",
    intro:
      "Stratford sits on the Princes Highway and the Avon River between Sale and Bairnsdale. Town homes, highway businesses, and rural blocks heading out toward Briagolong and Munro. Reception is clean (Mount Tassie is well-aligned) and the residential housing stock spans older brick through to newer estate builds.\n\nMost Stratford jobs are residential — switchboards, point additions, antenna work, the occasional renovation rewire. Highway-business and commercial jobs round out the mix.",
    nearby: ["sale", "munro", "maffra", "briagolong"],
  },
  {
    name: "Heyfield",
    slug: "heyfield",
    region: "Wellington Shire",
    postcode: "3858",
    intro:
      "Heyfield is the gateway to the Macalister Valley north of Maffra — town in the front, farming and lifestyle blocks stretching up into the foothills behind. Reception varies between town (clean) and outlying properties (some terrain shadowing of Mount Tassie). The grid is fine in town and adequate further out.\n\nWe do a steady mix of Heyfield work — residential electrical and antenna in town, farm and shed work further out, and the occasional bigger commercial job in the town centre.",
    nearby: ["cowwarr", "maffra", "boisdale", "tinamba"],
  },
  {
    name: "Rosedale",
    slug: "rosedale",
    region: "Wellington Shire",
    postcode: "3847",
    intro:
      "Rosedale sits east of Sale on the Princes Highway. Mostly residential, with a smaller commercial centre serving travellers and locals, and rural properties spread either side of the highway. Strong Mount Tassie signal — sometimes strong enough to overdrive old amplifiers.\n\nThe work here is the standard country-town mix: switchboard upgrades, point additions, antenna and reception fixes, the occasional shed three-phase, and small commercial jobs along the highway strip.",
    nearby: ["sale", "glengarry", "traralgon", "longford"],
  },
  {
    name: "Longford",
    slug: "longford",
    region: "Wellington Shire",
    postcode: "3851",
    intro:
      "Longford sits just south of Sale near the Sale Common wetlands. Older homes mixed with newer estate builds heading toward the lakes. Clean Mount Tassie reception and a strong grid, with the usual variability you get on rural blocks past the town edge.\n\nLongford work tends to be straightforward — switchboards, point additions, antenna repairs and new installs, the occasional outdoor lighting or extension wiring job.",
    nearby: ["sale", "seaspray", "loch-sport", "rosedale"],
  },

  // ── Smaller towns around Sale / Maffra ─────────────────────────────
  {
    name: "Newry",
    slug: "newry",
    region: "Wellington Shire",
    postcode: "3859",
    intro:
      "Newry is a small town between Maffra and Stratford, ringed by dairy and grazing land. A handful of town homes plus the surrounding rural properties. Reception is generally clean (Mount Tassie line of sight) and the grid is adequate for most domestic loads.\n\nWe cover Newry as part of our Maffra/Stratford run — shed three-phase, pump wiring, switchboard upgrades, antenna and reception work, the occasional farm-office network install.",
    nearby: ["maffra", "tinamba", "boisdale", "stratford"],
  },
  {
    name: "Boisdale",
    slug: "boisdale",
    region: "Wellington Shire",
    postcode: "3860",
    intro:
      "Boisdale sits north-east of Maffra, deep in dairy country. Mostly rural property — large blocks, working dairies and lifestyle holdings — with a small town centre. Clean Mount Tassie line of sight and an adequate grid for the load profile.\n\nDairy and irrigation electrical is the dominant work here — wash-down environments, three-phase pumps, shed wiring — alongside the standard residential mix when older homes come due for board upgrades.",
    nearby: ["maffra", "briagolong", "newry", "heyfield"],
  },
  {
    name: "Briagolong",
    slug: "briagolong",
    region: "Wellington Shire",
    postcode: "3860",
    intro:
      "Briagolong sits at the edge of the Great Dividing Range foothills north of Maffra. The town itself is straightforward; properties further into the hills get terrain shadowing of the Mount Tassie transmitter and can need higher masts for clean reception. Grid is fine.\n\nWe do town electrical and antenna work in Briagolong proper, plus fringe-signal antenna work on the lifestyle blocks heading into the hills. Older homes here often need a few rounds of patch work sorted properly.",
    nearby: ["maffra", "boisdale", "stratford", "newry"],
  },
  {
    name: "Tinamba",
    slug: "tinamba",
    region: "Wellington Shire",
    postcode: "3859",
    intro:
      "Tinamba is a small town west of Maffra. Quiet pocket, mostly farming country with scattered town homes and lifestyle blocks. Clean Mount Tassie reception and an adequate grid.\n\nTinamba jobs are usually straightforward — switchboard upgrades, antenna replacements, the occasional shed three-phase or farm-office wiring. We bring the same standards to a small Tinamba job as we do to a venue fitout in Sale.",
    nearby: ["maffra", "newry", "heyfield", "cowwarr"],
  },
  {
    name: "Cowwarr",
    slug: "cowwarr",
    region: "Wellington Shire",
    postcode: "3857",
    intro:
      "Cowwarr is a small rural community between Maffra and Heyfield. Older houses, surrounding farms, and the kind of place where electrical and antenna gear that's been in for 30+ years is finally due for refresh. Clean Mount Tassie reception, adequate grid.\n\nThe bulk of our Cowwarr work is upgrade and refresh — switchboards, antenna replacements, point additions in renovated kitchens, the occasional shed install. Nothing exotic, just done properly.",
    nearby: ["heyfield", "glengarry", "tinamba", "maffra"],
  },
  {
    name: "Glengarry",
    slug: "glengarry",
    region: "Wellington Shire",
    postcode: "3854",
    intro:
      "Glengarry sits between Traralgon and Heyfield. Strong Latrobe Valley grid runs out this way and Mount Tassie signal is plentiful — sometimes to the point of overdriving older amplifiers and switchboards designed for lower loads.\n\nMost Glengarry work is residential upgrades — boards, points, EV chargers, antenna systems that need right-sizing rather than more amplification.",
    nearby: ["traralgon", "rosedale", "cowwarr", "heyfield"],
  },
  {
    name: "Munro",
    slug: "munro",
    region: "Wellington Shire",
    postcode: "3862",
    intro:
      "Munro is a quiet rural locality east of Stratford. Country blocks, scattered farms, lifestyle holdings. Clean Mount Tassie reception, adequate grid.\n\nMunro jobs are usually deferred work caught up at once — switchboard upgrades, antenna replacements, point additions, shed wiring. We work through the list in priority order and leave the property tidier than we found it.",
    nearby: ["stratford", "sale", "bairnsdale", "rosedale"],
  },

  // ── Coastal / 90 Mile Beach ────────────────────────────────────────
  {
    name: "Loch Sport",
    slug: "loch-sport",
    region: "90 Mile Beach",
    postcode: "3851",
    intro:
      "Loch Sport sits on the southern shore of Lake Wellington at the end of a long, single road. Salt air, wind exposure, fringe-signal Mount Tassie reception. Mix of permanent residents and holiday homes that sit empty for months between visits.\n\nCoastal electrical and antenna work needs proper marine-grade gear, sealed connectors, and the right antenna spec for fringe signal. Cheap residential-grade fittings don't last more than a year or two here. We do it once and properly.",
    nearby: ["seaspray", "golden-beach", "sale", "longford"],
  },
  {
    name: "Seaspray",
    slug: "seaspray",
    region: "90 Mile Beach",
    postcode: "3851",
    intro:
      "Seaspray is a coastal village south of Sale on the 90 Mile Beach. Permanent residents mixed with holiday homes — many of which we visit pre-summer to bring back to life after months unattended in salt air.\n\nSame coastal install rules as Loch Sport apply here: marine-grade hardware outside, sealed connectors, antennas spec'd for fringe Mount Tassie reception. Plus a steady flow of pre-summer health checks for holiday-home owners.",
    nearby: ["loch-sport", "golden-beach", "longford", "sale"],
  },
  {
    name: "Golden Beach",
    slug: "golden-beach",
    region: "90 Mile Beach",
    postcode: "3851",
    intro:
      "Golden Beach sits north of Seaspray along the 90 Mile Beach. Holiday homes and permanent residences mix here, with the bulk of our work concentrated in the pre-summer rush.\n\nMarine-grade electrical and antenna gear, sealed connections, proper bracketing — coastal install rules. Pre-summer is busy: book early if you're an owner coming back to a house that's been quiet over winter.",
    nearby: ["seaspray", "loch-sport", "sale", "longford"],
  },

  // ── East Gippsland ─────────────────────────────────────────────────
  {
    name: "Bairnsdale",
    slug: "bairnsdale",
    region: "East Gippsland",
    postcode: "3875",
    intro:
      "Bairnsdale is the largest town in East Gippsland — about 14,000 people, broader spread of work than the smaller country towns, with a proper commercial component on top of the residential side. Mount Tassie reception varies by terrain (some homes shadowed by ridges) and the grid is solid.\n\nWe cover the full range here — residential electrical, commercial fitouts, antenna and reception work, EV chargers, and the occasional venue AV job.",
    nearby: ["munro", "stratford", "sale", "rosedale"],
  },

  // ── Latrobe Valley ─────────────────────────────────────────────────
  {
    name: "Traralgon",
    slug: "traralgon",
    region: "Latrobe Valley",
    postcode: "3844",
    intro:
      "Traralgon is the largest Latrobe Valley town. Strong grid (one of the strongest in regional Victoria, thanks to proximity to power generation), Mount Tassie almost directly overhead, and a wide mix of housing and commercial stock.\n\nTraralgon work spans residential upgrades, commercial fitouts and venue AV. The strong supply means heavier domestic loads (EV chargers, electric hot water) are easy to support, but old boards trip more often as people add load.",
    nearby: ["morwell", "glengarry", "rosedale", "sale"],
  },
  {
    name: "Morwell",
    slug: "morwell",
    region: "Latrobe Valley",
    postcode: "3840",
    intro:
      "Morwell is the next Latrobe Valley town along from Traralgon — same strong grid, similar mix of residential and commercial work. Strong Mount Tassie signal throughout.\n\nMost Morwell residential work is upgrades — switchboards, points, EV chargers, antenna systems. Commercial work tends to be small business fitouts, maintenance contracts and the occasional larger venue job.",
    nearby: ["traralgon", "glengarry", "rosedale", "sale"],
  },

  // ── Yarram / South Gippsland fringe ────────────────────────────────
  {
    name: "Yarram",
    slug: "yarram",
    region: "South Gippsland",
    postcode: "3971",
    intro:
      "Yarram sits south of the Strzelecki Ranges, well clear of the Latrobe Valley population. The Strzeleckis sit between Yarram and Mount Tassie, so antenna work here often needs higher masts and properly chosen antennas to pull a clean picture.\n\nWe do town and rural electrical, fringe-signal antenna work, and the occasional commercial job. The trip down here makes single tiny jobs uneconomic for customers — we encourage combining work where it makes sense.",
    nearby: ["sale", "longford", "seaspray", "loch-sport"],
  },
];
