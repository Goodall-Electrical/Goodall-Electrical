// Per-town electrical landing-page data.
// Same town list as the antenna pages (same service area), but with
// electrical-specific intros and context. Each town here gets a
// dedicated URL at /services/electrical/<slug>.
//
// Keep intro/context unique per town so Google doesn't treat these as
// near-duplicates. The teaser is the short blurb shown on the parent
// /services/electrical page tile grid.

export interface ElectricalTown {
  name: string;
  slug: string;
  region: string;
  postcode?: string;
  teaser: string;
  intro: string;
  context: string;
  nearby: string[]; // slugs
}

export const electricalTowns: ElectricalTown[] = [
  // ── Sale / Maffra core ─────────────────────────────────────────────
  {
    name: "Sale",
    slug: "sale",
    region: "Wellington Shire",
    postcode: "3850",
    teaser: "Our home base. Same-day callouts, switchboard upgrades and new installs.",
    intro:
      "Sale is our home base, so we get to most Sale electrical jobs faster than anyone else in the region. From the older brick homes around the centre of town to the newer estates on the edges, we handle the lot — switchboard upgrades, power-point additions, lighting refreshes and the bigger renovation jobs.",
    context:
      "The dominant electrical job we see in Sale is switchboard upgrades on homes built before the 1990s — old ceramic fuses replaced with proper safety switches and circuit breakers. The newer estates closer to the wetlands tend to need point additions as families grow into the house. We're licensed, insured, and we leave the paperwork with you at the end.",
    nearby: ["maffra", "longford", "stratford", "rosedale"],
  },
  {
    name: "Maffra",
    slug: "maffra",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "Switchboard upgrades, dairy-shed three-phase and home electrical work.",
    intro:
      "Maffra sits in dairy country north of Sale, so our work here splits between town electrical (switchboards, lighting, point additions) and rural three-phase work for sheds, pumps and dairies. We're set up for both — same team, same standards.",
    context:
      "On rural Maffra blocks we see a lot of ageing shed wiring that's outgrown what the original installer designed for. We pull the rotten cable, install a proper sub-board, and bring everything into compliance. Town homes get the standard mix — switchboard upgrades, RCD installations, kitchen renos, EV charger installs becoming more common.",
    nearby: ["sale", "boisdale", "newry", "tinamba"],
  },
  {
    name: "Stratford",
    slug: "stratford",
    region: "Wellington Shire",
    postcode: "3862",
    teaser: "Electrical work for Stratford homes, businesses and rural properties.",
    intro:
      "Stratford sits on the Princes Highway and the Avon River between Sale and Bairnsdale. We do the full spread of electrical work here — town homes, the highway businesses, and rural blocks on the way out toward Briagolong and Munro.",
    context:
      "A lot of Stratford homes have older switchboards that should have been upgraded a decade ago — usually we replace them at the same time as a kitchen or bathroom reno so the whole house gets brought up to current code together. New estate work tends to be straightforward additions: extra points, garage circuits, outdoor lighting.",
    nearby: ["sale", "munro", "maffra", "briagolong"],
  },
  {
    name: "Heyfield",
    slug: "heyfield",
    region: "Wellington Shire",
    postcode: "3858",
    teaser: "Town electrical, farm shed wiring and switchboard upgrades.",
    intro:
      "Heyfield is the gateway to the Macalister Valley north of Maffra. We do town electrical work here plus a steady flow of farm and lifestyle-block jobs further out — pump wiring, shed three-phase, machinery circuits.",
    context:
      "Heyfield's rural electrical work usually involves longer cable runs than town jobs and harder access to existing wiring. We plan the route, use the right cable spec for the distance, and document the install so future trades can follow what's there. Town jobs are the usual mix — switchboards, point additions, lighting upgrades.",
    nearby: ["cowwarr", "maffra", "boisdale", "tinamba"],
  },
  {
    name: "Rosedale",
    slug: "rosedale",
    region: "Wellington Shire",
    postcode: "3847",
    teaser: "Switchboard work, new installs and rural property electrical.",
    intro:
      "Rosedale sits between Sale and Traralgon on the highway. We do the regular town-home work here — switchboards, additions, lighting — plus farm and lifestyle-block work on properties either side of the highway.",
    context:
      "Most Rosedale switchboard jobs are straightforward replacements: ceramic fuse panel out, proper RCBOs in, certificate at the end. Rural jobs trend bigger — new sheds, pump houses, sometimes a three-phase upgrade from the street to support a new piece of equipment. We coordinate with the DNSP if a service upgrade is needed.",
    nearby: ["sale", "glengarry", "traralgon", "longford"],
  },
  {
    name: "Longford",
    slug: "longford",
    region: "Wellington Shire",
    postcode: "3851",
    teaser: "Domestic electrical and switchboard work for Longford homes.",
    intro:
      "Longford sits just south of Sale near the Sale Common wetlands. Older homes mixed with newer estate builds toward the lakes — we cover both.",
    context:
      "We do a fair bit of safety-switch retrofitting on older Longford homes — they're now mandatory on most circuits and a lot of the original 80s installs only ran them on power circuits, not lighting. Newer estates need point additions, outdoor lighting and the occasional sub-board for a granny flat.",
    nearby: ["sale", "seaspray", "loch-sport", "rosedale"],
  },

  // ── Smaller towns around Sale / Maffra ─────────────────────────────
  {
    name: "Newry",
    slug: "newry",
    region: "Wellington Shire",
    postcode: "3859",
    teaser: "Rural electrical work — sheds, pumps, switchboards.",
    intro:
      "Newry is a small town between Maffra and Stratford surrounded by dairy and grazing country. We're out here regularly for shed wiring, three-phase sub-boards and house renovations on the farms.",
    context:
      "Rural electrical work near Newry is usually a longer cable run and a bigger main switchboard load than people expect. We size for what the property will actually be doing in five years, not just what plugs in today. House work in the town itself is the standard residential mix.",
    nearby: ["maffra", "tinamba", "boisdale", "stratford"],
  },
  {
    name: "Boisdale",
    slug: "boisdale",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "Farm and home electrical work in dairy country.",
    intro:
      "Boisdale sits north-east of Maffra, deep in dairy country. The work here is mostly rural — shed three-phase, pump wiring, dairy electrical — with the usual home electrical jobs mixed in.",
    context:
      "Dairy and irrigation electrical is its own discipline — wash-down environments, vibration, salt, and constant pump cycling all take their toll on standard residential gear. We use IP-rated enclosures, gland the cable properly, and document the layout so the next contractor isn't guessing.",
    nearby: ["maffra", "briagolong", "newry", "heyfield"],
  },
  {
    name: "Briagolong",
    slug: "briagolong",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "Town and rural electrical work in the foothills.",
    intro:
      "Briagolong sits at the edge of the Great Dividing Range foothills north of Maffra. Town homes mix with lifestyle blocks heading up into the hills — we cover both, including the kind of fault-finding that takes a while because the wiring's been there 40 years.",
    context:
      "On older Briagolong homes we often find a few rounds of patch work from previous owners — extra circuits added without rebalancing the board, junction boxes hidden behind plaster, junction-box mysteries that take an hour to trace. We sort them properly so the next round of work isn't fighting the last one.",
    nearby: ["maffra", "boisdale", "stratford", "newry"],
  },
  {
    name: "Tinamba",
    slug: "tinamba",
    region: "Wellington Shire",
    postcode: "3859",
    teaser: "Domestic and farm electrical work west of Maffra.",
    intro:
      "Tinamba is a small town west of Maffra. Quiet rural pocket, mostly farming, with town homes and the occasional lifestyle block scattered through.",
    context:
      "Tinamba jobs are mostly straightforward — switchboard upgrades, additions, the occasional shed three-phase. Nothing exotic, just done properly and tidily. We bring the same standards to a small Tinamba job as we do to a city venue fitout.",
    nearby: ["maffra", "newry", "heyfield", "cowwarr"],
  },
  {
    name: "Cowwarr",
    slug: "cowwarr",
    region: "Wellington Shire",
    postcode: "3857",
    teaser: "Rural electrical work and switchboard upgrades.",
    intro:
      "Cowwarr is a small community between Maffra and Heyfield. Mostly rural blocks, older houses, the kind of place where wiring's been in place since the 70s and is finally asking for a refresh.",
    context:
      "The bulk of our Cowwarr work is upgrade jobs — switchboards, RCDs, point additions in renovated kitchens. Rural blocks add the occasional three-phase shed install. We don't push people into bigger jobs than they need.",
    nearby: ["heyfield", "glengarry", "tinamba", "maffra"],
  },
  {
    name: "Glengarry",
    slug: "glengarry",
    region: "Wellington Shire",
    postcode: "3854",
    teaser: "Town electrical and rural shed wiring across Glengarry.",
    intro:
      "Glengarry sits between Traralgon and Heyfield. Latrobe Valley grid quality is strong out here — the work is mostly switchboard upgrades, additions and shed wiring on the surrounding properties.",
    context:
      "Strong grid + older houses = a fair number of switchboard upgrades — modern appliances and EV chargers ask more of the main board than 80s wiring was designed for. We size up appropriately and run new sub-mains where the run from board to load needs it.",
    nearby: ["traralgon", "rosedale", "cowwarr", "heyfield"],
  },
  {
    name: "Munro",
    slug: "munro",
    region: "Wellington Shire",
    postcode: "3862",
    teaser: "Rural electrical work between Sale and Stratford.",
    intro:
      "Munro is a quiet rural locality east of Stratford. We're out here for the standard country-block mix — sheds, pumps, switchboards, renovation rewires.",
    context:
      "Munro jobs are usually the kind of work that's been deferred for a year or two — the owner finally books an electrician and we get a list of things to sort out at once. We work through them in priority order, tidy the comms cabinet, and leave the home or property in better shape than we found it.",
    nearby: ["stratford", "sale", "bairnsdale", "rosedale"],
  },

  // ── Coastal / 90 Mile Beach ────────────────────────────────────────
  {
    name: "Loch Sport",
    slug: "loch-sport",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Coastal electrical — salt-rated gear and weatherproof installs.",
    intro:
      "Loch Sport sits on the southern shore of Lake Wellington. Salt air, wind exposure and the long drive in mean we plan Loch Sport electrical jobs carefully — right gear, right enclosures, right cable spec.",
    context:
      "On the coast we don't use residential-grade gear for anything that lives outside — switchboards, outlets and lighting all need IP-rated, marine-suitable enclosures. The cost difference is small and the gear lasts decades instead of years. Inside-the-house work is the regular mix.",
    nearby: ["seaspray", "golden-beach", "sale", "longford"],
  },
  {
    name: "Seaspray",
    slug: "seaspray",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Coastal electrical work for permanents and holiday homes.",
    intro:
      "Seaspray is a coastal village south of Sale on the 90 Mile Beach. Holiday homes mix with permanent residents — we handle both, often pre-summer when owners arrive and find something's failed since the last visit.",
    context:
      "Coastal electrical is the same discipline as Loch Sport — proper IP-rated gear outside, sealed enclosures, salt-resistant terminations. We also do pre-summer health checks for holiday-home owners so they don't arrive to a dead hot-water service or a tripped main switch.",
    nearby: ["loch-sport", "golden-beach", "longford", "sale"],
  },
  {
    name: "Golden Beach",
    slug: "golden-beach",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Beach-house electrical and pre-summer health checks.",
    intro:
      "Golden Beach sits north of Seaspray along the 90 Mile Beach. Mix of permanent homes and holiday rentals. Same coastal install rules as the rest of the strip — marine-grade hardware, proper sealing, no shortcuts.",
    context:
      "Pre-summer is our busy season for Golden Beach — owners coming back to a holiday house and discovering an issue we can fix in a single trip if we're booked early. Permanents get the standard residential mix of switchboard upgrades, additions and renovation electrical.",
    nearby: ["seaspray", "loch-sport", "sale", "longford"],
  },

  // ── East Gippsland ─────────────────────────────────────────────────
  {
    name: "Bairnsdale",
    slug: "bairnsdale",
    region: "East Gippsland",
    postcode: "3875",
    teaser: "Residential and commercial electrical across East Gippsland.",
    intro:
      "Bairnsdale is the largest town in East Gippsland — bigger spread of work than the smaller country towns, with a proper commercial component on top of the residential side.",
    context:
      "We see the full range here — switchboard upgrades on older homes, rural three-phase, commercial fitouts in the shop strips, EV charger installs in the newer estates. The diversity is what makes Bairnsdale interesting; no two weeks look the same.",
    nearby: ["munro", "stratford", "sale", "rosedale"],
  },

  // ── Latrobe Valley ─────────────────────────────────────────────────
  {
    name: "Traralgon",
    slug: "traralgon",
    region: "Latrobe Valley",
    postcode: "3844",
    teaser: "Residential and commercial electrical in the Latrobe Valley.",
    intro:
      "Traralgon is the largest Latrobe Valley town. Strong grid (one of the strongest in regional Victoria), good supply, and a wide mix of housing stock — we do everything from older-home rewires to new commercial fitouts.",
    context:
      "Traralgon's strong supply is a double-edged sword — homes can carry a heavier load than equivalent rural blocks, but old switchboards rated for 1980s loads start tripping more often as people add modern appliances + EV chargers. Upgrading the board, not adding amperage, is usually the right answer.",
    nearby: ["morwell", "glengarry", "rosedale", "sale"],
  },
  {
    name: "Morwell",
    slug: "morwell",
    region: "Latrobe Valley",
    postcode: "3840",
    teaser: "Residential, commercial and switchboard electrical work.",
    intro:
      "Morwell is the next Latrobe Valley town along from Traralgon — same strong grid, same broad mix of residential and commercial work.",
    context:
      "Most Morwell residential work is upgrades — boards, points, EV chargers, the occasional rewire. Commercial work tends to be small business fitouts and maintenance contracts. We're set up for both with the same crew.",
    nearby: ["traralgon", "glengarry", "rosedale", "sale"],
  },

  // ── Yarram / South Gippsland fringe ────────────────────────────────
  {
    name: "Yarram",
    slug: "yarram",
    region: "South Gippsland",
    postcode: "3971",
    teaser: "Town, rural and coastal electrical work across South Gippsland.",
    intro:
      "Yarram sits south of the Strzelecki Ranges. Quieter pocket than the Latrobe Valley but a steady mix of residential, farm and small-commercial work that keeps us coming back regularly.",
    context:
      "Yarram electrical work tends to be slightly bigger jobs — the trip down here makes single small jobs uneconomic for the customer, so we typically combine a switchboard upgrade with point additions, or a shed wiring job with house compliance work. We're up-front about the trip charge so there are no surprises.",
    nearby: ["sale", "longford", "seaspray", "loch-sport"],
  },
];
