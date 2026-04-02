import { z } from "zod";

import { PostStatusChange } from "./PostStatusChange";

export const POST_STATUS_COLOR = {
  grey: "grey",
  gray: "gray",
  blueFrance: "blueFrance",
  redMarianne: "redMarianne",
  greenTilleulVerveine: "greenTilleulVerveine",
  greenBourgeon: "greenBourgeon",
  greenEmeraude: "greenEmeraude",
  greenMenthe: "greenMenthe",
  greenArchipel: "greenArchipel",
  blueEcume: "blueEcume",
  blueCumulus: "blueCumulus",
  purpleGlycine: "purpleGlycine",
  pinkMacaron: "pinkMacaron",
  pinkTuile: "pinkTuile",
  yellowTournesol: "yellowTournesol",
  yellowMoutarde: "yellowMoutarde",
  orangeTerreBattue: "orangeTerreBattue",
  brownCafeCreme: "brownCafeCreme",
  brownCaramel: "brownCaramel",
  brownOpera: "brownOpera",
  beigeGrisGalet: "beigeGrisGalet",
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
} as const;

export const POST_STATUS_COLOR_MAP = {
  [POST_STATUS_COLOR.grey]: "grey",
  [POST_STATUS_COLOR.gray]: "grey",
  [POST_STATUS_COLOR.blueFrance]: "blue-france",
  [POST_STATUS_COLOR.redMarianne]: "red-marianne",
  [POST_STATUS_COLOR.greenTilleulVerveine]: "green-tilleul-verveine",
  [POST_STATUS_COLOR.greenBourgeon]: "green-bourgeon",
  [POST_STATUS_COLOR.greenEmeraude]: "green-emeraude",
  [POST_STATUS_COLOR.greenMenthe]: "green-menthe",
  [POST_STATUS_COLOR.greenArchipel]: "green-archipel",
  [POST_STATUS_COLOR.blueEcume]: "blue-ecume",
  [POST_STATUS_COLOR.blueCumulus]: "blue-cumulus",
  [POST_STATUS_COLOR.purpleGlycine]: "purple-glycine",
  [POST_STATUS_COLOR.pinkMacaron]: "pink-macaron",
  [POST_STATUS_COLOR.pinkTuile]: "pink-tuile",
  [POST_STATUS_COLOR.yellowTournesol]: "yellow-tournesol",
  [POST_STATUS_COLOR.yellowMoutarde]: "yellow-moutarde",
  [POST_STATUS_COLOR.orangeTerreBattue]: "orange-terre-battue",
  [POST_STATUS_COLOR.brownCafeCreme]: "brown-cafe-creme",
  [POST_STATUS_COLOR.brownCaramel]: "brown-caramel",
  [POST_STATUS_COLOR.brownOpera]: "brown-opera",
  [POST_STATUS_COLOR.beigeGrisGalet]: "beige-gris-galet",
  [POST_STATUS_COLOR.info]: "info",
  [POST_STATUS_COLOR.success]: "success",
  [POST_STATUS_COLOR.warning]: "warning",
  [POST_STATUS_COLOR.error]: "error",
} as const;

export type PostStatusColor = keyof typeof POST_STATUS_COLOR;

export const postStatusColorEnum = z.enum(POST_STATUS_COLOR);

export const PostStatus = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
  color: postStatusColorEnum,
  tenantId: z.number(),
  showInRoadmap: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const PostStatusWithChanges = PostStatus.extend({
  statusChanges: z.lazy(() => PostStatusChange.array()),
});

export type PostStatus = z.infer<typeof PostStatus>;
export type PostStatusWithChanges = z.infer<typeof PostStatusWithChanges>;
