// Per-town antenna landing-page data.
// Each town here gets a dedicated URL at /services/antennas/<slug>.
// Keep the intro/context unique per town so Google doesn't treat these as
// near-duplicates. The teaser is the short blurb shown on the parent page.

export interface AntennaTown {
  name: string;
  slug: string;
  region: string;
  postcode?: string;
  teaser: string;
  intro: string;
  context: string;
  localIssues: string[];
  nearby: string[]; // slugs
}

export const antennaTowns: AntennaTown[] = [
  // ── Sale / Maffra core ─────────────────────────────────────────────
  {
    name: "Sale",
    slug: "sale",
    region: "Wellington Shire",
    postcode: "3850",
    teaser: "Our home base. New antenna installs, fault-finding and same-day repairs.",
    intro:
      "Sale is Goodall Electrical's home base — our workshop is in Wellington Park Way, so we cover Sale antenna jobs as quickly as anyone in the region. Most of the town sits on flat ground and gets a clean line to the Mount Tassie transmitter, which means signal isn't usually the problem; it's the gear in between.",
    context:
      "Sale is a relatively easy reception area. The dominant issue we see is ageing distribution: cheap splitters, dead amplifiers, and old cable that has slowly degraded. The fix is almost always at the wall-plate end of the system, not the roof. When we do replace antennas it's usually after a storm or because a previous installer used residential-grade gear on a multi-storey home that needed a higher mast.",
    localIssues: [
      "Distribution failures in older brick homes with multiple TVs",
      "Storm damage from spring/summer fronts coming off Bass Strait",
      "Insurance jobs after wind events along the Avon River corridor",
    ],
    nearby: ["maffra", "longford", "stratford", "rosedale"],
  },
  {
    name: "Maffra",
    slug: "maffra",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "Same-day reception fixes and new installs across Maffra homes.",
    intro:
      "Maffra sits north of Sale across the Avon and is surrounded by dairy country. Most homes get clean Mount Tassie signal but rural blocks tend to have longer cable runs and older distribution kits — which is where we spend most of our Maffra time.",
    context:
      "Maffra reception is generally good — the town itself has clear line-of-sight to Mount Tassie. What we see most often: amplifiers that have died after fifteen years, water in roof-cavity splitters, and TVs that were added to the system years ago via a daisy-chain rather than a properly balanced run. We replace the weak point and rebalance, rather than throwing the whole system out.",
    localIssues: [
      "Long cable runs in older farmhouses pulling signal below threshold",
      "Storm damage on exposed properties on the Maffra-Sale road",
      "Picture freezing on multi-TV homes after a recent room addition",
    ],
    nearby: ["sale", "boisdale", "newry", "tinamba"],
  },
  {
    name: "Stratford",
    slug: "stratford",
    region: "Wellington Shire",
    postcode: "3862",
    teaser: "Antenna work and signal tuning for Stratford residents.",
    intro:
      "Stratford lies on the Princes Highway and the Avon River between Sale and Bairnsdale. It's another Mount Tassie reception area — clean for most of the town, with rural fringes that benefit from a slightly taller mast or a higher-gain antenna.",
    context:
      "Stratford's town blocks are straightforward. The work we do most often: replacing antennas damaged in westerly winds, fixing reception in older homes whose roof-cavity wiring is past its best, and adding TV points to rooms in the newer estates south of the railway.",
    localIssues: [
      "Wind damage on exposed elevated homes near the highway",
      "Lower signal in homes shadowed by railway line ridges",
      "New TV points added in extended living areas and garages",
    ],
    nearby: ["sale", "munro", "maffra", "briagolong"],
  },
  {
    name: "Heyfield",
    slug: "heyfield",
    region: "Wellington Shire",
    postcode: "3858",
    teaser: "TV antenna service to Heyfield homes and surrounding farms.",
    intro:
      "Heyfield sits at the southern edge of the foothills north of Maffra. The town gets Mount Tassie signal but the terrain starts to assert itself — some properties on the wrong side of a low ridge need a taller mast or a relay-fed antenna.",
    context:
      "We see two distinct Heyfield jobs. Town homes are generally fine and need the same kind of repair work as anywhere else — old amplifiers, water ingress, distribution issues. Properties further out toward Glenmaggie or up the Macalister Valley sometimes need a more considered install: higher mast, higher-gain antenna, and a properly chosen amplifier.",
    localIssues: [
      "Terrain shadowing on properties west of the town toward Glenmaggie",
      "Need for taller masts on hillside blocks",
      "Storm and wind damage on exposed farm sheds and homes",
    ],
    nearby: ["cowwarr", "maffra", "boisdale", "tinamba"],
  },
  {
    name: "Rosedale",
    slug: "rosedale",
    region: "Wellington Shire",
    postcode: "3847",
    teaser: "Reception diagnostics and antenna replacements in Rosedale.",
    intro:
      "Rosedale sits on the Princes Highway between Sale and Traralgon. It's close enough to Mount Tassie to enjoy strong signal in most of the town, with the usual rural-fringe variability on outlying properties.",
    context:
      "Rosedale signal is strong — sometimes strong enough that an amplifier installed years ago is now overdriving the TVs and causing pixelation. We diagnose with a signal meter and quite often pull the amplifier rather than replacing the antenna. New installs are usually clean, single-mast jobs.",
    localIssues: [
      "Over-amplified systems causing pixelation on newer TVs",
      "Replacement of antennas damaged in storm cells along the highway",
      "Extending coverage to home extensions and granny flats",
    ],
    nearby: ["sale", "glengarry", "traralgon", "longford"],
  },
  {
    name: "Longford",
    slug: "longford",
    region: "Wellington Shire",
    postcode: "3851",
    teaser: "Antenna and reception service to Longford homes and properties.",
    intro:
      "Longford sits just south of Sale near the Sale Common wetlands. It's a Mount Tassie reception area with mostly clean line-of-sight and a mix of established homes and newer builds out toward the lakes.",
    context:
      "Most Longford work is straightforward. We see the usual mix of dead amplifiers, water-affected connectors, and homes that need an extra TV point added cleanly. Newer estates often have basic developer-spec gear that benefits from an upgrade if you actually use the TV in multiple rooms.",
    localIssues: [
      "Developer-spec distribution that struggles with 3+ TVs",
      "Water ingress through poorly sealed roof penetrations",
      "Adding TV points to extensions on older homes",
    ],
    nearby: ["sale", "seaspray", "loch-sport", "rosedale"],
  },

  // ── Smaller towns around Sale / Maffra ─────────────────────────────
  {
    name: "Newry",
    slug: "newry",
    region: "Wellington Shire",
    postcode: "3859",
    teaser: "Antenna service to Newry homes and the surrounding farmland.",
    intro:
      "Newry is a small town between Maffra and Stratford, ringed by dairy and grazing land. Most Newry properties enjoy clean Mount Tassie signal but rural blocks need a bit of thought around antenna spec and mast height.",
    context:
      "Newry jobs are usually rural — longer cable runs, older homes, farm sheds being wired up for TV. We size the antenna properly for the distance from the transmitter and use shielded cable for any runs that pass through machinery sheds or near pump houses.",
    localIssues: [
      "Long cable runs from antenna to lounge in older farmhouses",
      "Interference from pump houses and farm machinery sheds",
      "Adding TV reception to farm offices and accommodation",
    ],
    nearby: ["maffra", "tinamba", "boisdale", "stratford"],
  },
  {
    name: "Boisdale",
    slug: "boisdale",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "New installs and reception fixes for Boisdale properties.",
    intro:
      "Boisdale sits north-east of Maffra, deep in dairy country. Reception across the area is good thanks to clean Mount Tassie line-of-sight, with the usual rural caveats — long runs, older distribution, and the occasional property in a hollow that needs a taller mast.",
    context:
      "Most Boisdale work is on rural homes — the kind of property where the antenna has been there for twenty years and is finally giving up. We replace with properly specified residential-grade gear and balance the distribution so every TV in the house runs clean.",
    localIssues: [
      "Two-decade-old antennas finally failing",
      "Rural distribution that's been added to over the years and needs rebalancing",
      "Wind damage on exposed properties",
    ],
    nearby: ["maffra", "briagolong", "newry", "heyfield"],
  },
  {
    name: "Briagolong",
    slug: "briagolong",
    region: "Wellington Shire",
    postcode: "3860",
    teaser: "Antenna work for Briagolong homes — fringe-area signal tuning included.",
    intro:
      "Briagolong sits at the edge of the Great Dividing Range foothills north of Maffra. Some properties enjoy clean Mount Tassie signal; others sit in a terrain shadow and need a higher mast or a more carefully chosen antenna to pull a clean picture.",
    context:
      "Briagolong is one of the more interesting areas to design an install for — terrain can make or break a job. We carry a signal meter on every Briagolong call-out and will sometimes recommend going slightly higher with the mast rather than throwing more amplifier at a marginal signal. The result lasts longer and looks cleaner.",
    localIssues: [
      "Terrain shadowing requiring taller masts",
      "Properties in valleys needing higher-gain antennas",
      "Maintenance on existing fringe-area systems",
    ],
    nearby: ["maffra", "boisdale", "stratford", "newry"],
  },
  {
    name: "Tinamba",
    slug: "tinamba",
    region: "Wellington Shire",
    postcode: "3859",
    teaser: "TV antenna installation and signal repair across Tinamba.",
    intro:
      "Tinamba is a small town west of Maffra. Reception is generally good — Mount Tassie line-of-sight is clean and most homes are on flat or gently rolling ground.",
    context:
      "Tinamba work is mostly small repairs and replacements. We see plenty of long-running antenna kits that have lasted twenty years and are finally tired. Replacement is usually quick and the result lasts another decade.",
    localIssues: [
      "Ageing antenna systems coming up for replacement",
      "Wind damage on rural properties",
      "Adding TV points to renovated farmhouses",
    ],
    nearby: ["maffra", "newry", "heyfield", "cowwarr"],
  },
  {
    name: "Cowwarr",
    slug: "cowwarr",
    region: "Wellington Shire",
    postcode: "3857",
    teaser: "Antenna service to Cowwarr homes and surrounding properties.",
    intro:
      "Cowwarr is a small rural community between Maffra and Heyfield. Most properties get clean Mount Tassie reception with the usual rural quirks — long cable runs, older distribution, and antennas that have been up for decades.",
    context:
      "We treat Cowwarr like the rest of the smaller Wellington Shire towns: diagnose with a meter, replace the weak link, and avoid up-selling to a full new system when the existing antenna still has years in it. Honest service work, mostly.",
    localIssues: [
      "Long cable runs degrading signal in older homes",
      "Aged antennas finally requiring replacement",
      "Storm damage on exposed elevated blocks",
    ],
    nearby: ["heyfield", "glengarry", "tinamba", "maffra"],
  },
  {
    name: "Glengarry",
    slug: "glengarry",
    region: "Wellington Shire",
    postcode: "3854",
    teaser: "Reception work and new antenna installs across Glengarry.",
    intro:
      "Glengarry sits between Traralgon and Heyfield, with the Latrobe Valley starting to give way to the foothills. Mount Tassie is close and signal is generally strong — sometimes strong enough to overdrive older amplifier systems.",
    context:
      "Most Glengarry jobs are about right-sizing existing systems. We've found that swapping an over-spec amplifier for one matched to the strong local signal often fixes pixelation that the owner has been blaming on the antenna.",
    localIssues: [
      "Over-amplified systems on strong-signal blocks",
      "New TV points in homes that have been extended",
      "Replacement of antennas that have lost elements in strong winds",
    ],
    nearby: ["traralgon", "rosedale", "cowwarr", "heyfield"],
  },
  {
    name: "Munro",
    slug: "munro",
    region: "Wellington Shire",
    postcode: "3862",
    teaser: "Antenna work for Munro homes and farms between Sale and Stratford.",
    intro:
      "Munro is a quiet rural locality east of Stratford. Reception from Mount Tassie is generally clean, with rural-block fundamentals (longer runs, older gear) dictating the work.",
    context:
      "Munro jobs are simple, honest fixes — replacing a tired antenna, swapping a dead amplifier, sealing roof penetrations that have leaked water into the cable. We do the job once and properly.",
    localIssues: [
      "Older cable runs that have degraded over time",
      "Storm damage on exposed sheds and homes",
      "Adding TV points to farm cottages and granny flats",
    ],
    nearby: ["stratford", "sale", "bairnsdale", "rosedale"],
  },

  // ── Coastal / 90 Mile Beach ────────────────────────────────────────
  {
    name: "Loch Sport",
    slug: "loch-sport",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Coastal antenna service — built for salt air, wind and fringe signal.",
    intro:
      "Loch Sport sits on the southern shore of Lake Wellington at the end of a long, single road. It's a fringe-signal area for Mount Tassie reception and a salt-air environment that's hard on cheap antenna gear — both factors that shape every install we do here.",
    context:
      "Loch Sport is a job we plan for: stainless-steel hardware where it matters, sealed connectors, properly bracketed masts that handle the wind off the lake. We don't run residential-grade gear here — it doesn't survive long enough to be worth the cost saving.",
    localIssues: [
      "Salt-air corrosion shortening antenna life",
      "Wind exposure on lakeside and elevated blocks",
      "Fringe-area signal requiring high-gain antennas",
      "Holiday homes left unattended for months between visits",
    ],
    nearby: ["seaspray", "golden-beach", "sale", "longford"],
  },
  {
    name: "Seaspray",
    slug: "seaspray",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Antenna installs and reception fixes along 90 Mile Beach.",
    intro:
      "Seaspray is a coastal village south of Sale on the 90 Mile Beach. Mount Tassie reception reaches Seaspray but the salt-air environment is the dominant factor in any install lasting more than a few years.",
    context:
      "We treat Seaspray like Loch Sport — stainless hardware, sealed connectors, proper bracketing for the on-shore wind. Holiday homes get the same treatment as permanents because nobody wants to discover a failed antenna the day they arrive for Christmas.",
    localIssues: [
      "Salt-air corrosion on antennas and connectors",
      "Wind damage during winter southerlies",
      "Reception issues in homes shielded by dunes",
      "Holiday homes returning to no signal after months unattended",
    ],
    nearby: ["loch-sport", "golden-beach", "longford", "sale"],
  },
  {
    name: "Golden Beach",
    slug: "golden-beach",
    region: "90 Mile Beach",
    postcode: "3851",
    teaser: "Antenna work for Golden Beach holiday homes and permanents.",
    intro:
      "Golden Beach sits north of Seaspray along the 90 Mile Beach. Holiday homes and permanent residences mix here, and the antenna work reflects both — quick repairs for residents and pre-summer fault-finds for owners coming back to a quiet house.",
    context:
      "Same coastal install rules apply: marine-grade hardware, sealed connectors, antennas spec'd for fringe Mount Tassie signal. We're often called before Christmas to bring a holiday-home system back to life — book early if that's you.",
    localIssues: [
      "Salt-air corrosion and connector failures",
      "Holiday homes with failed systems detected on arrival",
      "Wind damage from coastal southerlies",
      "Multi-TV holiday rentals needing reliable, balanced distribution",
    ],
    nearby: ["seaspray", "loch-sport", "sale", "longford"],
  },

  // ── East Gippsland ─────────────────────────────────────────────────
  {
    name: "Bairnsdale",
    slug: "bairnsdale",
    region: "East Gippsland",
    postcode: "3875",
    teaser: "TV antenna installation and signal fixes for East Gippsland homes.",
    intro:
      "Bairnsdale is the largest town in East Gippsland. Mount Tassie still serves the area but distance and intervening terrain mean reception varies — some homes pull in strong signal, others sit in a shadow and need a more considered install.",
    context:
      "Bairnsdale antenna work is more varied than the Sale-Maffra core. We sometimes use a higher-gain antenna or recommend a different mast position to get around a ridge between the home and the transmitter. As always, we diagnose with a meter before recommending parts — guesswork is expensive.",
    localIssues: [
      "Terrain shadowing in homes north of the Mitchell River",
      "Reception variance between hilltop and valley blocks",
      "Replacement of antennas damaged by river-valley wind funnelling",
    ],
    nearby: ["munro", "stratford", "sale", "rosedale"],
  },

  // ── Latrobe Valley ─────────────────────────────────────────────────
  {
    name: "Traralgon",
    slug: "traralgon",
    region: "Latrobe Valley",
    postcode: "3844",
    teaser: "Residential antenna service across the Latrobe Valley.",
    intro:
      "Traralgon sits almost directly under Mount Tassie. Signal in town is strong — sometimes too strong — and the work is more about right-sizing the gear than chasing missing signal.",
    context:
      "The classic Traralgon job: a home with an amplifier installed when amplifiers were the default answer, now overdriving the TVs and causing pixelation on the strongest channels. We measure, swap the amplifier for an attenuator or remove it entirely, and the picture clears.",
    localIssues: [
      "Over-amplified systems on strong-signal blocks close to Mount Tassie",
      "Pixelation that looks like weak signal but is actually too much signal",
      "Adding TV points to extensions and granny flats",
    ],
    nearby: ["morwell", "glengarry", "rosedale", "sale"],
  },
  {
    name: "Morwell",
    slug: "morwell",
    region: "Latrobe Valley",
    postcode: "3840",
    teaser: "New installs, tuning and repair for Morwell homes.",
    intro:
      "Morwell is the next Latrobe Valley town along from Traralgon — same proximity to Mount Tassie, same dominant local issue (signal so strong it's the problem, not the solution).",
    context:
      "We do a lot of Morwell jobs that boil down to removing or replacing an old amplifier that was right for the era it was installed in and wrong for the modern TVs that are far more sensitive to signal level. Diagnosis with a meter, then a focused fix.",
    localIssues: [
      "Over-amplified distribution causing pixelation",
      "Older homes with cable that has aged out",
      "Adding TV points to renovated open-plan rooms",
    ],
    nearby: ["traralgon", "glengarry", "rosedale", "sale"],
  },

  // ── Yarram / South Gippsland fringe ────────────────────────────────
  {
    name: "Yarram",
    slug: "yarram",
    region: "South Gippsland",
    postcode: "3971",
    teaser: "Antenna installation and signal tuning across Yarram and South Gippsland.",
    intro:
      "Yarram sits south of the Strzelecki Ranges, well clear of the main Latrobe population. Mount Tassie is the main transmitter but the ranges sit between Yarram and the tower, which makes higher masts and properly chosen antennas more important than in the flatter parts of Gippsland.",
    context:
      "Yarram jobs almost always involve terrain. We've seen residential-grade kits installed by previous contractors that simply can't pull a clean picture from the available signal — and the fix is usually a taller mast and a higher-gain antenna, not more amplifier. We diagnose with a meter and quote the proper job.",
    localIssues: [
      "Terrain shadowing from the Strzelecki Ranges",
      "Under-spec antennas struggling with available signal",
      "Wind exposure on properties closer to the coast",
    ],
    nearby: ["sale", "longford", "seaspray", "loch-sport"],
  },
];
