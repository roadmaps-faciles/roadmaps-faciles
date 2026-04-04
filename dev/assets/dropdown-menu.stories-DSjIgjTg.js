import{a as e,n as t}from"./chunk-BneVvdWh.js";import{O as n,p as r}from"./iframe-ENPEqnHb.js";import{A as i,C as a,D as o,M as s,_ as c,a as l,f as u,g as d,i as f,k as p,r as m,t as h,u as g,v as _,x as v}from"./lucide-react-S7WLdKUI.js";import{r as y,t as b}from"./button-Dn437qkE.js";import{a as x,c as S,d as C,f as w,g as T,h as E,i as D,l as O,m as k,n as A,o as j,p as M,r as N,s as P,t as F,u as I}from"./dropdown-menu-BSk9iXTm.js";var L,R,z,B,V,H,U,W;t((()=>{h(),L=e(n(),1),y(),T(),R=r(),z={title:`Components/DropdownMenu`,component:F,parameters:{docs:{description:{component:`Menu contextuel déclenché par un bouton. Supporte les items, items à cocher, groupes radio, sous-menus, raccourcis clavier et variantes destructives.`}}}},B={render:()=>(0,R.jsxs)(F,{children:[(0,R.jsx)(E,{asChild:!0,children:(0,R.jsx)(b,{variant:`outline`,children:`Open Menu`})}),(0,R.jsxs)(N,{className:`w-56`,children:[(0,R.jsx)(j,{children:`My Account`}),(0,R.jsx)(I,{}),(0,R.jsxs)(D,{children:[(0,R.jsxs)(x,{children:[(0,R.jsx)(f,{}),(0,R.jsx)(`span`,{children:`Profile`}),(0,R.jsx)(C,{children:`Ctrl+P`})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(p,{}),(0,R.jsx)(`span`,{children:`Billing`}),(0,R.jsx)(C,{children:`Ctrl+B`})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(g,{}),(0,R.jsx)(`span`,{children:`Settings`}),(0,R.jsx)(C,{children:`Ctrl+S`})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(a,{}),(0,R.jsx)(`span`,{children:`Shortcuts`})]})]}),(0,R.jsx)(I,{}),(0,R.jsxs)(D,{children:[(0,R.jsxs)(x,{children:[(0,R.jsx)(m,{}),(0,R.jsx)(`span`,{children:`Team`})]}),(0,R.jsxs)(w,{children:[(0,R.jsxs)(k,{children:[(0,R.jsx)(l,{}),(0,R.jsx)(`span`,{children:`Invite users`})]}),(0,R.jsx)(P,{children:(0,R.jsxs)(M,{children:[(0,R.jsxs)(x,{children:[(0,R.jsx)(c,{}),(0,R.jsx)(`span`,{children:`Email`})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(d,{}),(0,R.jsx)(`span`,{children:`Message`})]}),(0,R.jsx)(I,{}),(0,R.jsxs)(x,{children:[(0,R.jsx)(s,{}),(0,R.jsx)(`span`,{children:`More...`})]})]})})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(u,{}),(0,R.jsx)(`span`,{children:`New Team`}),(0,R.jsx)(C,{children:`Ctrl+T`})]})]}),(0,R.jsx)(I,{}),(0,R.jsxs)(x,{children:[(0,R.jsx)(o,{}),(0,R.jsx)(`span`,{children:`GitHub`})]}),(0,R.jsxs)(x,{children:[(0,R.jsx)(v,{}),(0,R.jsx)(`span`,{children:`Support`})]}),(0,R.jsxs)(x,{disabled:!0,children:[(0,R.jsx)(i,{}),(0,R.jsx)(`span`,{children:`API (disabled)`})]}),(0,R.jsx)(I,{}),(0,R.jsxs)(x,{variant:`destructive`,children:[(0,R.jsx)(_,{}),(0,R.jsx)(`span`,{children:`Log out`}),(0,R.jsx)(C,{children:`Ctrl+Q`})]})]})]})},V={render:function(){let[e,t]=(0,L.useState)(!0),[n,r]=(0,L.useState)(!1),[i,a]=(0,L.useState)(!0);return(0,R.jsxs)(F,{children:[(0,R.jsx)(E,{asChild:!0,children:(0,R.jsx)(b,{variant:`outline`,children:[e&&`Status Bar`,n&&`Activity Bar`,i&&`Panel`].filter(Boolean).join(`, `)||`None`})}),(0,R.jsxs)(N,{className:`w-56`,children:[(0,R.jsx)(j,{children:`Appearance`}),(0,R.jsx)(I,{}),(0,R.jsx)(A,{checked:e,onCheckedChange:t,children:`Status Bar`}),(0,R.jsx)(A,{checked:n,onCheckedChange:r,children:`Activity Bar`}),(0,R.jsx)(A,{checked:i,onCheckedChange:a,children:`Panel`})]})]})}},H={render:function(){let[e,t]=(0,L.useState)(`apple`);return(0,R.jsxs)(F,{children:[(0,R.jsx)(E,{asChild:!0,children:(0,R.jsxs)(b,{variant:`outline`,children:[`Fruit: `,e]})}),(0,R.jsxs)(N,{className:`w-56`,children:[(0,R.jsx)(j,{children:`Favorite Fruit`}),(0,R.jsx)(I,{}),(0,R.jsxs)(S,{value:e,onValueChange:t,children:[(0,R.jsx)(O,{value:`apple`,children:`Apple`}),(0,R.jsx)(O,{value:`banana`,children:`Banana`}),(0,R.jsx)(O,{value:`cherry`,children:`Cherry`})]})]})]})}},U={parameters:{docs:{description:{story:"Les items avec la prop `inset` ajoutent un padding gauche pour aligner le texte avec les items contenant des icones au-dessus."}}},render:()=>(0,R.jsxs)(F,{children:[(0,R.jsx)(E,{asChild:!0,children:(0,R.jsx)(b,{variant:`outline`,children:`Inset Items`})}),(0,R.jsxs)(N,{className:`w-56`,children:[(0,R.jsx)(j,{inset:!0,children:`View`}),(0,R.jsx)(I,{}),(0,R.jsx)(x,{inset:!0,children:`Reload`}),(0,R.jsx)(x,{inset:!0,disabled:!0,children:`Force Reload`}),(0,R.jsx)(I,{}),(0,R.jsx)(x,{inset:!0,children:`Toggle Fullscreen`})]})]})},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            <span>Profile</span>
            <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            <span>Billing</span>
            <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            <span>Settings</span>
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Keyboard />
            <span>Shortcuts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users />
            <span>Team</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare />
                  <span>Message</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle />
                  <span>More...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Plus />
            <span>New Team</span>
            <DropdownMenuShortcut>Ctrl+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <GitFork />
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LifeBuoy />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Cloud />
          <span>API (disabled)</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut />
          <span>Log out</span>
          <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: function CheckboxItemsStory() {
    const [statusBar, setStatusBar] = useState(true);
    const [activityBar, setActivityBar] = useState(false);
    const [panel, setPanel] = useState(true);
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {[statusBar && "Status Bar", activityBar && "Activity Bar", panel && "Panel"].filter(Boolean).join(", ") || "None"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={activityBar} onCheckedChange={setActivityBar}>
            Activity Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={panel} onCheckedChange={setPanel}>
            Panel
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: function RadioItemsStory() {
    const [fruit, setFruit] = useState("apple");
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Fruit: {fruit}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Favorite Fruit</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={fruit} onValueChange={setFruit}>
            <DropdownMenuRadioItem value="apple">Apple</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="banana">Banana</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="cherry">Cherry</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Les items avec la prop \`inset\` ajoutent un padding gauche pour aligner le texte avec les items contenant des icones au-dessus."
      }
    }
  },
  render: () => <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Inset Items</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel inset>View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset>Reload</DropdownMenuItem>
        <DropdownMenuItem inset disabled>
          Force Reload
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset>Toggle Fullscreen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...U.parameters?.docs?.source}}},W=[`Default`,`WithCheckboxItems`,`WithRadioItems`,`Inset`]}))();export{B as Default,U as Inset,V as WithCheckboxItems,H as WithRadioItems,W as __namedExportsOrder,z as default};