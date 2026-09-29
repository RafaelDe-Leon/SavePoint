import type { Platform } from "@/lib/game";

/**
 * Fake game catalog. Stands in for a real source (IGDB, a database) — only
 * `queries.ts` reads this file, so swapping it out doesn't touch any page.
 * Counts and hours are invented.
 */

export interface CatalogGame {
  id: number;
  slug: string;
  title: string;
  year: number;
  developer: string;
  genres: string[];
  /** Platform families it released on. */
  platforms: Platform[];
  /** Placeholder cover tint until there's box art. */
  tint: string;
  /** Relative popularity, for the default sort. Higher is more popular. */
  popularity: number;
  avgRating: number;
  ratingCount: number;
  /** Typical hours to beat the main story / to 100%. */
  hoursMain: number;
  hoursComplete: number;
}

type Row = [
  title: string,
  year: number,
  developer: string,
  genres: string[],
  platforms: Platform[],
  hue: number,
  popularity: number,
  avgRating: number,
  ratingCount: number,
  hoursMain: number,
  hoursComplete: number,
];

const ROWS: Row[] = [
  ["Celeste", 2018, "Maddy Makes Games", ["Platformer", "Indie"], ["nintendo", "pc", "playstation", "xbox"], 350, 880, 4.4, 61200, 8, 37],
  ["Outer Wilds", 2019, "Mobius Digital", ["Adventure", "Puzzle"], ["pc", "playstation", "xbox", "nintendo"], 250, 860, 4.6, 48900, 17, 22],
  ["Elden Ring", 2022, "FromSoftware", ["RPG", "Action"], ["playstation", "xbox", "pc"], 85, 990, 4.5, 211000, 58, 133],
  ["Hades", 2020, "Supergiant Games", ["Roguelike", "Action"], ["nintendo", "pc", "playstation", "xbox"], 25, 940, 4.5, 132000, 22, 95],
  ["Hollow Knight", 2017, "Team Cherry", ["Metroidvania", "Indie"], ["nintendo", "pc", "playstation", "xbox"], 260, 950, 4.5, 158000, 27, 62],
  ["Final Fantasy VII Rebirth", 2024, "Square Enix", ["RPG"], ["playstation", "pc"], 200, 820, 4.3, 38200, 47, 107],
  ["Disco Elysium", 2019, "ZA/UM", ["RPG", "Narrative"], ["pc", "playstation", "xbox", "nintendo"], 55, 830, 4.5, 57100, 23, 51],
  ["Starfield", 2023, "Bethesda", ["RPG", "Sci-fi"], ["xbox", "pc"], 240, 780, 3.1, 64800, 36, 150],
  ["Super Metroid", 1994, "Nintendo", ["Metroidvania"], ["retro", "nintendo"], 300, 700, 4.5, 41300, 8, 11],
  ["Astro Bot", 2024, "Team Asobi", ["Platformer"], ["playstation"], 240, 870, 4.5, 44600, 11, 19],
  ["Balatro", 2024, "LocalThunk", ["Roguelike", "Cards"], ["pc", "nintendo", "playstation", "xbox", "mobile"], 15, 910, 4.4, 72300, 17, 110],
  ["Metroid Prime 4", 2025, "Retro Studios", ["Action", "Adventure"], ["nintendo"], 140, 840, 4.1, 18100, 16, 25],
  ["Hollow Knight: Silksong", 2025, "Team Cherry", ["Metroidvania", "Indie"], ["nintendo", "pc", "playstation", "xbox"], 20, 985, 4.6, 52800, 32, 58],
  ["Chrono Trigger", 1995, "Square", ["RPG"], ["retro", "pc", "mobile"], 100, 690, 4.6, 39800, 23, 42],
  ["Forza Horizon 5", 2021, "Playground Games", ["Racing"], ["xbox", "pc", "playstation"], 60, 800, 4.2, 51700, 19, 140],
  ["The Legend of Zelda: Tears of the Kingdom", 2023, "Nintendo", ["Adventure", "Action"], ["nintendo"], 170, 970, 4.6, 141000, 59, 212],
  ["The Legend of Zelda: Breath of the Wild", 2017, "Nintendo", ["Adventure", "Action"], ["nintendo"], 150, 965, 4.5, 204000, 50, 188],
  ["Grand Theft Auto V", 2013, "Rockstar North", ["Action", "Open world"], ["playstation", "xbox", "pc"], 30, 930, 4.1, 188000, 32, 82],
  ["Red Dead Redemption 2", 2018, "Rockstar Games", ["Action", "Open world"], ["playstation", "xbox", "pc"], 35, 955, 4.5, 176000, 50, 175],
  ["Minecraft", 2011, "Mojang", ["Sandbox"], ["pc", "playstation", "xbox", "nintendo", "mobile"], 130, 920, 4.2, 162000, 58, 150],
  ["God of War", 2018, "Santa Monica Studio", ["Action", "Adventure"], ["playstation", "pc"], 220, 900, 4.4, 131000, 21, 51],
  ["God of War Ragnarök", 2022, "Santa Monica Studio", ["Action", "Adventure"], ["playstation", "pc"], 210, 880, 4.4, 87200, 26, 59],
  ["Portal 2", 2011, "Valve", ["Puzzle"], ["pc", "playstation", "xbox", "nintendo"], 210, 935, 4.6, 156000, 8, 22],
  ["Portal", 2007, "Valve", ["Puzzle"], ["pc", "playstation", "xbox", "nintendo"], 230, 850, 4.4, 121000, 3, 11],
  ["Half-Life 2", 2004, "Valve", ["Shooter"], ["pc", "xbox"], 30, 840, 4.4, 97300, 13, 18],
  ["Cyberpunk 2077", 2020, "CD Projekt Red", ["RPG", "Open world"], ["pc", "playstation", "xbox"], 95, 910, 4.1, 134000, 25, 105],
  ["Marvel's Spider-Man", 2018, "Insomniac Games", ["Action"], ["playstation", "pc"], 20, 890, 4.3, 118000, 17, 35],
  ["Marvel's Spider-Man 2", 2023, "Insomniac Games", ["Action"], ["playstation", "pc"], 10, 870, 4.2, 67400, 18, 34],
  ["Undertale", 2015, "Toby Fox", ["RPG", "Indie"], ["pc", "playstation", "nintendo", "xbox"], 0, 900, 4.4, 122000, 6, 20],
  ["Deltarune", 2018, "Toby Fox", ["RPG", "Indie"], ["pc", "playstation", "nintendo"], 280, 860, 4.5, 58300, 12, 20],
  ["Stardew Valley", 2016, "ConcernedApe", ["Simulation", "Indie"], ["pc", "playstation", "xbox", "nintendo", "mobile"], 120, 925, 4.5, 139000, 53, 164],
  ["Resident Evil 2", 2019, "Capcom", ["Horror", "Action"], ["playstation", "xbox", "pc"], 10, 860, 4.3, 92100, 9, 26],
  ["Resident Evil 4", 2023, "Capcom", ["Horror", "Action"], ["playstation", "xbox", "pc"], 40, 875, 4.4, 71800, 16, 42],
  ["Silent Hill 2", 2024, "Bloober Team", ["Horror"], ["playstation", "pc"], 200, 760, 4.2, 29400, 17, 33],
  ["The Witcher 3: Wild Hunt", 2015, "CD Projekt Red", ["RPG", "Open world"], ["pc", "playstation", "xbox", "nintendo"], 60, 950, 4.5, 181000, 51, 173],
  ["Super Mario Odyssey", 2017, "Nintendo", ["Platformer"], ["nintendo"], 30, 915, 4.5, 126000, 12, 67],
  ["Super Mario Bros. Wonder", 2023, "Nintendo", ["Platformer"], ["nintendo"], 55, 830, 4.3, 49200, 12, 27],
  ["Super Smash Bros. Ultimate", 2018, "Bandai Namco", ["Fighting"], ["nintendo"], 290, 880, 4.3, 88000, 18, 124],
  ["Mario Kart 8 Deluxe", 2017, "Nintendo", ["Racing"], ["nintendo"], 350, 900, 4.3, 97300, 13, 58],
  ["Skyrim", 2011, "Bethesda", ["RPG", "Open world"], ["pc", "playstation", "xbox", "nintendo"], 230, 905, 4.3, 170000, 34, 234],
  ["Dark Souls III", 2016, "FromSoftware", ["RPG", "Action"], ["pc", "playstation", "xbox"], 80, 870, 4.4, 99100, 32, 99],
  ["Bloodborne", 2015, "FromSoftware", ["RPG", "Action"], ["playstation"], 270, 885, 4.6, 104000, 34, 76],
  ["Sekiro: Shadows Die Twice", 2019, "FromSoftware", ["Action"], ["pc", "playstation", "xbox"], 5, 870, 4.5, 91700, 29, 69],
  ["Cuphead", 2017, "Studio MDHR", ["Platformer", "Indie"], ["pc", "xbox", "nintendo", "playstation"], 90, 850, 4.2, 88400, 11, 26],
  ["Batman: Arkham Asylum", 2009, "Rocksteady", ["Action"], ["pc", "playstation", "xbox", "nintendo"], 250, 790, 4.3, 83200, 12, 25],
  ["Persona 5 Royal", 2020, "Atlus", ["RPG"], ["playstation", "xbox", "nintendo", "pc"], 20, 895, 4.6, 81500, 103, 139],
  ["Baldur's Gate 3", 2023, "Larian Studios", ["RPG", "Strategy"], ["pc", "playstation", "xbox"], 280, 960, 4.7, 128000, 70, 173],
  ["Clair Obscur: Expedition 33", 2025, "Sandfall Interactive", ["RPG"], ["playstation", "xbox", "pc"], 40, 945, 4.6, 61900, 31, 62],
  ["Death Stranding 2", 2025, "Kojima Productions", ["Action", "Adventure"], ["playstation"], 230, 830, 4.3, 27200, 42, 110],
  ["Hades II", 2025, "Supergiant Games", ["Roguelike", "Action"], ["pc", "nintendo"], 320, 925, 4.6, 44700, 26, 90],
  ["Inside", 2016, "Playdead", ["Puzzle", "Indie"], ["pc", "playstation", "xbox", "nintendo"], 30, 810, 4.3, 67900, 3, 5],
  ["Tunic", 2022, "Andrew Shouldice", ["Adventure", "Indie"], ["pc", "playstation", "xbox", "nintendo"], 110, 780, 4.3, 31800, 12, 21],
  ["Animal Well", 2024, "Shared Memory", ["Metroidvania", "Puzzle"], ["pc", "playstation", "nintendo", "xbox"], 160, 790, 4.4, 24600, 9, 28],
  ["Pizza Tower", 2023, "Tour De Pizza", ["Platformer", "Indie"], ["pc", "nintendo"], 50, 740, 4.4, 20200, 7, 25],
  ["Sea of Stars", 2023, "Sabotage Studio", ["RPG", "Indie"], ["pc", "playstation", "xbox", "nintendo"], 45, 760, 4.0, 21800, 30, 41],
  ["Lies of P", 2023, "Round8 Studio", ["RPG", "Action"], ["playstation", "xbox", "pc"], 35, 770, 4.2, 25300, 34, 69],
  ["Dave the Diver", 2023, "Mintrocket", ["Adventure", "Simulation"], ["pc", "nintendo", "playstation"], 210, 780, 4.3, 27700, 30, 55],
  ["Signalis", 2022, "rose-engine", ["Horror", "Indie"], ["pc", "playstation", "xbox", "nintendo"], 5, 700, 4.4, 13100, 9, 14],
  ["Inscryption", 2021, "Daniel Mullins Games", ["Cards", "Horror"], ["pc", "playstation", "xbox", "nintendo"], 70, 800, 4.4, 38900, 12, 21],
  ["Stray", 2022, "BlueTwelve Studio", ["Adventure"], ["pc", "playstation", "xbox", "nintendo"], 80, 790, 4.0, 42300, 5, 10],
  ["Katana Zero", 2019, "Askiisoft", ["Action", "Indie"], ["pc", "nintendo", "xbox"], 330, 720, 4.3, 22700, 5, 9],
  ["Fortnite", 2017, "Epic Games", ["Shooter"], ["pc", "playstation", "xbox", "nintendo", "mobile"], 260, 850, 3.2, 73600, 0, 0],
  ["Street Fighter 6", 2023, "Capcom", ["Fighting"], ["playstation", "xbox", "pc"], 15, 760, 4.1, 19400, 11, 60],
  ["Among Us", 2018, "Innersloth", ["Party"], ["pc", "mobile", "nintendo", "playstation", "xbox"], 0, 760, 3.6, 38300, 0, 0],
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const CATALOG: CatalogGame[] = ROWS.map(
  (
    [title, year, developer, genres, platforms, hue, popularity, avgRating, ratingCount, hoursMain, hoursComplete],
    i,
  ) => ({
    id: i + 1,
    slug: slugify(title),
    title,
    year,
    developer,
    genres,
    platforms,
    tint: `oklch(${(0.34 + (i % 4) * 0.025).toFixed(3)} ${(0.07 + (i % 3) * 0.025).toFixed(3)} ${hue})`,
    popularity,
    avgRating,
    ratingCount,
    hoursMain,
    hoursComplete,
  }),
);
