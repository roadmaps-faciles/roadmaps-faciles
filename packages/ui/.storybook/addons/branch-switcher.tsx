import { BranchIcon } from "@storybook/icons";
import { Fragment } from "react";
import { IconButton, TooltipLinkList, WithTooltip } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";

const ADDON_ID = "branch-switcher";

const BRANCHES: Array<{ id: string; title: string }> = [
  { id: "main", title: "main" },
  { id: "dev", title: "dev" },
];

/** Derive sibling branch URL from current location. */
const getBranchHref = (branchId: string) => {
  const { origin, pathname } = window.location;
  // pathname is e.g. /roadmaps-faciles/main/... → replace the branch segment
  const segments = pathname.split("/").filter(Boolean); // ["roadmaps-faciles", "main", ...]
  if (segments.length >= 2) {
    segments[1] = branchId;
  }
  return `${origin}/${segments.join("/")}`;
};

/** Detect current branch from URL path. */
const getCurrentBranch = () => {
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[1] ?? "main";
};

addons.register(ADDON_ID, () => {
  addons.add(`${ADDON_ID}/tool`, {
    title: "Branch",
    type: types.TOOL,
    match: ({ viewMode }: { viewMode?: string }) => !!(viewMode && /^(story|docs)$/.test(viewMode)),
    render: () => {
      const current = getCurrentBranch();
      return (
        <Fragment>
          <WithTooltip
            placement="top"
            trigger="click"
            closeOnOutsideClick
            tooltip={({ onHide }) => (
              <TooltipLinkList
                links={BRANCHES.map(b => ({
                  id: b.id,
                  title: b.title,
                  active: b.id === current,
                  onClick: () => {
                    if (b.id !== current) {
                      window.location.href = getBranchHref(b.id);
                    }
                    onHide();
                  },
                }))}
              />
            )}
          >
            <IconButton title={`Branch: ${current}`}>
              <BranchIcon />
              <span style={{ marginLeft: 4, fontSize: 12 }}>{current}</span>
            </IconButton>
          </WithTooltip>
        </Fragment>
      );
    },
  });
});
