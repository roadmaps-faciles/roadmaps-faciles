import { BranchIcon } from "@storybook/icons";
import React, { Fragment } from "react";

// Workaround: SB 10.3 manager bundler maps "react" to __REACT__ destructured,
// but some internal components expect a global `React` variable (React 19 compat issue)
if (typeof globalThis !== "undefined" && !("React" in globalThis)) {
  (globalThis as Record<string, unknown>).React = React;
}
import { IconButton, TooltipLinkList, WithTooltip } from "storybook/internal/components";
import { addons, types } from "storybook/manager-api";

const ADDON_ID = "branch-switcher";

const BRANCHES: Array<{ id: string; title: string }> = [
  { id: "main", title: "main" },
  { id: "dev", title: "dev" },
];

const getBranchHref = (branchId: string) => {
  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    segments[1] = branchId;
  }
  return `${origin}/${segments.join("/")}`;
};

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
