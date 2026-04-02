import { isBrowser } from "@/utils/browser";
import { illogical } from "@/utils/error";

import { getInstanceFn } from "./getInstance";

const isomorphicServices = {} as const;
export const getService = getInstanceFn(isomorphicServices);

export const getServerService = getInstanceFn(
  {
    ...isomorphicServices,
  } as const,
  () => isBrowser && illogical("Should not be called on the client side"),
);
