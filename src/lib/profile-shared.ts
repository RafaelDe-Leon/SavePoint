/**
 * Profile rules and vocabulary that both the server actions and the client
 * forms need. Kept apart from `profile.ts`, which touches the filesystem and
 * so can't be imported into a Client Component.
 */

export const USERNAME = /^[a-z0-9_]{3,20}$/i;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  displayName: 40,
  bio: 280,
  favorites: 4,
  journalNote: 500,
  review: 5000,
  listTitle: 80,
  listDescription: 280,
} as const;

/** Other Savepoint players, until there are real accounts to follow. */
export interface Person {
  username: string;
  name: string;
  owned: number;
  beaten: number;
  /** Whether they follow you back. Fixed, since they can't act. */
  followsYou: boolean;
}

export const PEOPLE: Person[] = [
  { username: "mika_plays", name: "Mika Tanaka", owned: 212, beaten: 131, followsYou: true },
  { username: "backlogbrian", name: "Brian Okafor", owned: 487, beaten: 96, followsYou: true },
  { username: "sofiaretro", name: "Sofía Reyes", owned: 158, beaten: 120, followsYou: false },
  { username: "jun", name: "Jun Park", owned: 74, beaten: 51, followsYou: true },
  { username: "hundredpercent", name: "Priya Nair", owned: 93, beaten: 88, followsYou: false },
  { username: "deckdad", name: "Tom Lindqvist", owned: 301, beaten: 64, followsYou: false },
];

/** Email notifications you can switch on or off. */
export const NOTIFICATIONS = {
  newFollower: { label: "New followers", description: "When someone follows you." },
  friendActivity: { label: "Friends' milestones", description: "When someone you follow beats or 100%s a game." },
  weeklyDigest: { label: "Weekly backlog digest", description: "A Monday email with what's waiting on each system." },
  releaseReminders: { label: "Wishlist releases", description: "When a game on your wishlist comes out." },
  productNews: { label: "Product news", description: "New features, a few times a year." },
} as const;
export type NotificationKey = keyof typeof NOTIFICATIONS;

export const VISIBILITY = {
  public: { label: "Public", description: "Anyone with the link can see your profile." },
  followers: { label: "Followers", description: "Only people you follow can see it." },
  private: { label: "Only you", description: "Your profile is hidden from everyone else." },
} as const;
export type Visibility = keyof typeof VISIBILITY;

/** What parts of your profile others can see, when it's visible at all. */
export const PRIVACY_TOGGLES = {
  showHours: { label: "Show hours played", description: "On your games, journal and stats." },
  showActivity: { label: "Show activity", description: "Your Activity tab and journal." },
  showRatings: { label: "Show ratings", description: "Stars on your games and the ratings chart." },
} as const;
export type PrivacyToggle = keyof typeof PRIVACY_TOGGLES;

export interface Settings {
  notifications: Record<NotificationKey, boolean>;
  visibility: Visibility;
  privacy: Record<PrivacyToggle, boolean>;
}

export const DEFAULT_SETTINGS: Settings = {
  notifications: {
    newFollower: true,
    friendActivity: true,
    weeklyDigest: false,
    releaseReminders: true,
    productNews: false,
  },
  visibility: "public",
  privacy: { showHours: true, showActivity: true, showRatings: true },
};

/** Avatar uploads: resized in the browser, checked again on the server. */
export const AVATAR = {
  /** Edge length the browser crops and scales to, in px. */
  size: 256,
  maxBytes: 512 * 1024,
  types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>,
};

/** The profile tabs, in order. `""` is the overview at `/u/<name>`. */
export const PROFILE_TABS = [
  { segment: "", label: "Profile" },
  { segment: "games", label: "Games" },
  { segment: "journal", label: "Journal" },
  { segment: "activity", label: "Activity" },
  { segment: "reviews", label: "Reviews" },
  { segment: "lists", label: "Lists" },
  { segment: "friends", label: "Friends" },
  { segment: "likes", label: "Likes" },
] as const;

/** Today as YYYY-MM-DD, the format every stored date uses. */
export const today = () => new Date().toISOString().slice(0, 10);

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Sep 29, 2026" from a stored YYYY-MM-DD, read as UTC so it never shifts a day. */
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
