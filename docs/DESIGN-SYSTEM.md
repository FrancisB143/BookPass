# BookPass design system

The contract every screen builds against. Tokens come from the Figma file
(`design/figma/`), not from taste — if a value is not in here, check the frame
before inventing one.

Regenerate the design source with `npm run figma:pull`.

## Rules

1. **Never hardcode a colour, font size, or spacing value.** Import from
   `@/constants/theme`. A raw `#FFF` or `fontSize: 15` in a screen is a bug.
2. **Never use `fontWeight`.** Weight is carried by `fontFamily`. Android
   ignores synthetic weights on custom fonts and silently renders regular.
3. **All text goes through `<Text>`** from `@/components/ui/text`, with a
   `variant` from the type scale.
4. **Screens never import `@/data/`.** They call `@/services/` or read
   `useLibrary()`. Services are async so they can become `fetch()` later.
5. **The app is light-only.** `app.json` pins `userInterfaceStyle: "light"`.
   Do not add `useColorScheme` branches.
6. **Say BookPass, never BookHive.** The Figma copy uses a "Hive" metaphor
   throughout; rewrite it. See the copy map below.

## Colour roles

`Colors` in `@/constants/theme`. Material 3 naming — the design's error pair is
M3's default, so the rest follows suit.

| Token | Hex | Use |
| --- | --- | --- |
| `primary` | `#D97736` | FAB, primary buttons |
| `onPrimary` | `#FFFFFF` | text on primary |
| `primaryContainer` | `#FFDBC9` | icon tiles, eyebrow pills |
| `onPrimaryContainer` | `#994703` | accent text, active tab |
| `success` / `successContainer` | `#306949` / `#B1EDC5` | "On Shelf", "Available" |
| `onSuccessContainer` | `#155133` | text on green |
| `warning` | `#8F4955` | "Lent Out" |
| `error` / `errorContainer` | `#BA1A1A` / `#FFDAD6` | overdue |
| `background` | `#F1F3FC` | app canvas |
| `surface` | `#FFFFFF` | cards |
| `surfaceVariant` | `#EBEEF6` | inputs, chips, segment tracks |
| `outline` | `#DFE2EB` | hairlines |
| `onSurface` | `#181C22` | headings |
| `onSurfaceVariant` | `#554339` | body (warm brown, deliberately) |
| `onSurfaceMuted` | `#887367` | meta, captions |
| `inverseSurface` / `onInverseSurface` | `#181C22` / `#FFFFFF` | selected chip |

## Type scale

`Typography` in `@/constants/theme`. Newsreader is the editorial serif; Plus
Jakarta Sans carries the interface.

| Variant | Font | Size/Line | Use |
| --- | --- | --- | --- |
| `display` | Newsreader 600 | 28/36 | "What are we reading today?" |
| `titleLg` | Newsreader 600 | 24/30 | screen titles |
| `title` | Newsreader 600 | 18/24 | section headings |
| `titleBook` | Newsreader 500 | 18/23 | book titles in lists |
| `quote` | Newsreader 600 italic | 18/24 | pull quotes |
| `labelLg` | Jakarta 600 | 14/20 | buttons, emphasised rows |
| `body` | Jakarta 400 | 14/20 | body copy |
| `label` | Jakarta 600 | 12/16 | pill labels |
| `caption` | Jakarta 400 | 12/16 | meta |
| `overline` | Jakarta 700 | 10/12 +0.4 | "ACTIVE PROPOSAL" eyebrows |
| `micro` | Jakarta 500 | 10/12 +0.4 | tab labels |

## Spacing and shape

`Spacing`: `xxs 2 · xs 4 · sm 6 · md 8 · lg 10 · xl 12 · xxl 14 · gutter 16 ·
x5 20 · x6 24 · x8 32`. Screen and card padding is `gutter`.

`Radius`: `xs 6 · sm 12 · md 16 · lg 24 · pill 9999`. Pills dominate — 231
nodes in the file use a full round.

`Elevation.card` for raised cards, `Elevation.floating` for the FAB and primary
buttons.

## Components

From `@/components/ui/`:

- `<Text variant color>` and `<Overline>` — all typography.
- `<Button label onPress variant size icon block busy>` — `primary` (orange
  pill) · `secondary` (white, outlined) · `tonal` (grey) · `ghost`.
- `<Card tone padded radius>` — `raised` (white + shadow) · `flat` (tinted) ·
  `accent` (peach) · `success` (green).
- `<IconTile name tone size round>` — the rounded icon squares and circles.
- `<Divider>`.
- `<Pill label tone dot>` — status badges. `<Chip label selected onPress>` —
  filter chips; selected renders as the inverted black pill.
- `<Field label hint icon valid error secure>` — form input.
- `<Segmented options value onChange>` — two-up pill toggle.

Elsewhere:

- `<BookCover title author isbn width height>` — Open Library cover with a
  typographic fallback. Always pass `isbn` when known.
- `<Screen safe surface>` — screen container.
- `<LoadingState>`, `<ErrorState message onRetry>`, `<EmptyState icon title
  message action>`.
- `<AppTabBar>` — the four-tab bar with the centre FAB. Already wired.

## Gradients and vector art

`expo-linear-gradient` and `react-native-svg` are available — both work in
Expo Go.

Use `<LinearGradient>` for the design's soft canvas washes and glows rather
than stacking low-opacity `View`s. Use `react-native-svg` for line art the icon
sets cannot express (the honeycomb watermarks, decorative rules, progress arcs).

Colours still come from `Colors`. A gradient is a list of tokens, never new hex
values:

```tsx
<LinearGradient colors={[Colors.surface, Colors.surfaceBright]} />
```

## Data

`useLibrary()` from `@/context/library-context` gives `shelf`, `borrowed`,
`lent`, `requests`, `stats`, `isLoading`, `error`, and the mutations
`refresh`, `returnBook`, `editCopy`, `deleteCopy`, `requestBook`,
`respondToRequest`, `withdrawRequest`.

`useSession()` gives `user`, `signIn`, `signOut`.

Read-only queries live in `@/services/catalog` (`getExchangeListings`,
`getNearbyListings`, `searchListings`, `getGenres`, `getListing`,
`addBookToShelf`) and `@/services/loans` (`daysUntilDue`, `isOverdue`,
`isDueSoon`, `LOAN_PERIOD_DAYS`).

Types are in `@/types`. The key one: a `Book` is the work, a `Copy` is one
member's physical copy, and a `Listing` joins a copy to its book and owner.

## Copy map — Hive to BookPass

| Figma says | Use instead |
| --- | --- |
| BookHive | BookPass |
| Campus Hive #4 | Campus Library #4 |
| Recently in Your Hive | Recently Added |
| Hive Shelf | My Shelf |
| Community Hive Drop Point | Community Drop Point |
| Sign In to Hive | Sign In to BookPass |
| BookPass Little Free Shelves | keep, it already reads fine |

"Swap Match", "Open for Trade", "Direct Swaps" and "Seeking" are not Hive
terms — keep them.

## Routes

```
/                 gate → /home or /sign-in
/sign-in          (auth) group
/home             tab 1
/my-books         tab 2
/exchange         tab 3
/borrowed         tab 4
/add-book         pushed from the FAB
/book/[id]        edit and delete a copy
```
