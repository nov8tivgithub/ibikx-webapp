// Digital card module. Endpoint paths + parameters match the live backend
// (see captured Postman payloads). Each function takes the fields the server
// actually expects rather than a generic params blob.

import { MakeAxiosRequest } from '../api/request';

// /cardlisting — list cards inside a sub-category (or favourites).
// favourite="1" filters to the user's saved items; "0" returns the regular list.
// type is "videos" | "cards" (the active dashboard tab).
// last_id: pass the previous response's last_id to fetch the next page; "" or 0
// for the first page. Server signals "more pages available" via has_load_more.
export const getCardListingService = (
  { categorykey = '', favourite = '0', type = 'videos', last_id = '' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/cardlisting', { categorykey, favourite, type, last_id }, signal);

// /myfavourites — user's saved cards/videos. `type` filters by tab
// ("videos" | "cards"); pass an empty string for all.
export const getFavouritesService = (
  { type = '' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/myfavourites', { type }, signal);

// Back-compat shim — older code paths import getCardListService. Routes
// through the same /cardlisting endpoint with the new payload shape.
export const getCardListService = getCardListingService;

// /carddetails — preview a single card. The detail page is keyed by
// templatekey (NOT cardkey, which is for tracking via /cardview).
export const getCardDetailsService = (
  { templatekey, categorykey = '', favourite = '0', languageid = 0, type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest(
    'post',
    '/carddetails',
    { templatekey, categorykey, favourite, languageid, type },
    signal,
  );

// /cardview — full details for the card/video shown on the details page.
// Same endpoint serves both modes (`type` switches the response). Replaces
// /carddetails for the in-app card-details / video-details views.
export const getCardViewService = (
  { cardkey, languageid = 0, type = 'cards' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/cardview', { cardkey, languageid, type }, signal);

// /personalizecard — renders the card with the user's profile stamped in.
// Live payload: { templatekey, languageid, favourite, type }. `favourite`
// is the current favourite state of the source card ("0" or "1").
export const personalizeCardService = (
  { templatekey, languageid = 0, favourite = '0', type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest(
    'post',
    '/personalizecard',
    { templatekey, languageid, favourite, type },
    signal,
  );

// /cardview — fire-and-forget view tracker. Keyed by cardkey + language + type.
export const recordCardViewService = (
  { cardkey, languageid = 0, type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/cardview', { cardkey, languageid, type }, signal);

// /sharecard — fire-and-forget share tracker.
export const shareCardService = (
  { cardkey, languageid = 0, type = 'videos', channel = '' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/sharecard', { cardkey, languageid, type, channel }, signal);

// /markasfavourite — favourite "1" to favourite, "0" to unfavourite. The
// backend keys by templatekey + type. Older call sites passed `value` —
// accept either and normalise.
export const markAsFavouriteService = (
  { templatekey, favourite, value, type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest(
    'post',
    '/markasfavourite',
    { templatekey, favourite: favourite ?? value ?? '1', type },
    signal,
  );
