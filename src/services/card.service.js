// Digital card module. Endpoint paths + parameters match the live backend
// (see captured Postman payloads). Each function takes the fields the server
// actually expects rather than a generic params blob.

import { MakeAxiosRequest } from '../api/request';

// /cardlisting — list cards inside a sub-category (or favourites).
// favourite="1" filters to the user's saved items; "0" returns the regular list.
// type is "videos" | "cards" (the active dashboard tab).
export const getCardListingService = (
  { categorykey = '', favourite = '0', type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest('post', '/cardlisting', { categorykey, favourite, type }, signal);

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

// /personalizecard — renders the card with the user's profile stamped in.
export const personalizeCardService = (
  { templatekey, categorykey = '', languageid = 0, type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest(
    'post',
    '/personalizecard',
    { templatekey, categorykey, languageid, type },
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

// /markasfavourite — value "1" to favourite, "0" to unfavourite. Backend
// generally keys by templatekey; pass whichever id the listing supplies.
export const markAsFavouriteService = (
  { templatekey, cardkey, value = '1', type = 'videos' } = {},
  signal,
) =>
  MakeAxiosRequest(
    'post',
    '/markasfavourite',
    { templatekey, cardkey, value, type },
    signal,
  );
