import{i as e,s as t}from"./preload-helper-B_TrffEr.js";import{t as n}from"./react-CSHu137V.js";import{t as r}from"./jsx-runtime-IKcXo5NR.js";import{J as i,Ot as a,X as o,b as s,t as c,v as l,w as u}from"./lucide-react-ClE0FCTG.js";import{qt as d,t as f}from"./dist-Y4OKOMet.js";import{n as p,t as m}from"./cn-Cyxd3MKj.js";import{n as h,t as g}from"./dist-CX8VGI-Y.js";import{r as _,t as ee}from"./button-F-D0STVv.js";import{n as te,t as ne}from"./input-BZcW1AD6.js";import{n as re,t as ie}from"./separator-Cp0HgeBk.js";import{i as ae,l as oe,o as se,r as ce,s as le,t as ue}from"./sheet-DmgS_FMB.js";import{n as de,t as v}from"./skeleton-BkogTO13.js";import{a as fe,i as pe,n as me,r as he,t as ge}from"./tooltip-BXnMDu_J.js";function _e(){return(0,ve.useSyncExternalStore)(ye,be,xe)}var ve,y,ye,be,xe,Se=e((()=>{ve=t(n(),1),y=768,ye=e=>{let t=window.matchMedia(`(max-width: ${y-1}px)`);return t.addEventListener(`change`,e),()=>t.removeEventListener(`change`,e)},be=()=>window.innerWidth<y,xe=()=>!1}));function b(){let e=(0,B.useContext)(G);if(!e)throw Error(`useSidebar must be used within a SidebarProvider.`);return e}function x({defaultOpen:e=!0,open:t,onOpenChange:n,className:r,style:i,children:a,...o}){let s=_e(),[c,l]=(0,B.useState)(!1),[u,d]=(0,B.useState)(e),f=t??u,p=(0,B.useCallback)(e=>{let t=typeof e==`function`?e(f):e;n?n(t):d(t),document.cookie=`${H}=${t}; path=/; max-age=${U}`},[n,f]),h=(0,B.useCallback)(()=>s?l(e=>!e):p(e=>!e),[s,p,l]);(0,B.useEffect)(()=>{let e=e=>{e.key===ke&&(e.metaKey||e.ctrlKey)&&(e.preventDefault(),h())};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[h]);let g=f?`expanded`:`collapsed`,_=(0,B.useMemo)(()=>({state:g,open:f,setOpen:p,isMobile:s,openMobile:c,setOpenMobile:l,toggleSidebar:h}),[g,f,p,s,c,l,h]);return(0,V.jsx)(G.Provider,{value:_,children:(0,V.jsx)(he,{delayDuration:0,children:(0,V.jsx)(`div`,{"data-slot":`sidebar-wrapper`,style:{"--sidebar-width":W,"--sidebar-width-icon":Oe,...i},className:m(`group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full`,r),...o,children:a})})})}function S({side:e=`left`,variant:t=`sidebar`,collapsible:n=`offcanvas`,className:r,children:i,...a}){let{isMobile:o,state:s,openMobile:c,setOpenMobile:l}=b();return n===`none`?(0,V.jsx)(`div`,{"data-slot":`sidebar`,className:m(`bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col`,r),...a,children:i}):o?(0,V.jsx)(ue,{open:c,onOpenChange:l,...a,children:(0,V.jsxs)(ce,{"data-sidebar":`sidebar`,"data-slot":`sidebar`,"data-mobile":`true`,className:`bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden`,style:{"--sidebar-width":De},side:e,children:[(0,V.jsxs)(se,{className:`sr-only`,children:[(0,V.jsx)(le,{children:`Sidebar`}),(0,V.jsx)(ae,{children:`Displays the mobile sidebar.`})]}),(0,V.jsx)(`div`,{className:`flex size-full flex-col`,children:i})]})}):(0,V.jsxs)(`div`,{className:`group peer text-sidebar-foreground`,"data-state":s,"data-collapsible":s===`collapsed`?n:``,"data-variant":t,"data-side":e,"data-slot":`sidebar`,children:[(0,V.jsx)(`div`,{"data-slot":`sidebar-gap`,className:m(`relative hidden w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear md:block`,`group-data-[collapsible=offcanvas]:w-0`,`group-data-[side=right]:rotate-180`,t===`floating`||t===`inset`?`group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]`:`group-data-[collapsible=icon]:w-(--sidebar-width-icon)`)}),(0,V.jsx)(`div`,{"data-slot":`sidebar-container`,className:m(`fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex`,e===`left`?`left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)`:`right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)`,t===`floating`||t===`inset`?`p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]`:`group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l`,r),...a,children:(0,V.jsx)(`div`,{"data-sidebar":`sidebar`,"data-slot":`sidebar-inner`,className:`bg-sidebar group-data-[variant=floating]:border-sidebar-border flex size-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm`,children:i})})]})}function C({className:e,onClick:t,...n}){let{toggleSidebar:r}=b();return(0,V.jsxs)(ee,{"data-sidebar":`trigger`,"data-slot":`sidebar-trigger`,variant:`ghost`,size:`icon`,className:m(`size-7`,e),onClick:e=>{t?.(e),r()},...n,children:[(0,V.jsx)(u,{}),(0,V.jsx)(`span`,{className:`sr-only`,children:`Toggle Sidebar`})]})}function Ce({className:e,...t}){let{toggleSidebar:n}=b();return(0,V.jsx)(`button`,{"data-sidebar":`rail`,"data-slot":`sidebar-rail`,"aria-label":`Toggle Sidebar`,tabIndex:-1,onClick:n,title:`Toggle Sidebar`,className:m(`hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 sm:flex`,`in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize`,`[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize`,`hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full`,`[[data-side=left][data-collapsible=offcanvas]_&]:-right-2`,`[[data-side=right][data-collapsible=offcanvas]_&]:-left-2`,e),...t})}function w({className:e,...t}){return(0,V.jsx)(`main`,{"data-slot":`sidebar-inset`,className:m(`bg-background relative flex w-full flex-1 flex-col`,`md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2`,e),...t})}function we({className:e,...t}){return(0,V.jsx)(ne,{"data-slot":`sidebar-input`,"data-sidebar":`input`,className:m(`bg-background h-8 w-full shadow-none`,e),...t})}function T({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-header`,"data-sidebar":`header`,className:m(`flex flex-col gap-2 p-2`,e),...t})}function E({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-footer`,"data-sidebar":`footer`,className:m(`flex flex-col gap-2 p-2`,e),...t})}function D({className:e,...t}){return(0,V.jsx)(ie,{"data-slot":`sidebar-separator`,"data-sidebar":`separator`,className:m(`bg-sidebar-border mx-2 w-auto`,e),...t})}function O({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-content`,"data-sidebar":`content`,className:m(`flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden`,e),...t})}function k({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-group`,"data-sidebar":`group`,className:m(`relative flex w-full min-w-0 flex-col p-2`,e),...t})}function A({className:e,asChild:t=!1,...n}){return(0,V.jsx)(t?d:`div`,{"data-slot":`sidebar-group-label`,"data-sidebar":`group-label`,className:m(`text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0`,`group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0`,e),...n})}function Te({className:e,asChild:t=!1,...n}){return(0,V.jsx)(t?d:`button`,{"data-slot":`sidebar-group-action`,"data-sidebar":`group-action`,className:m(`text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0`,`after:absolute after:-inset-2 md:after:hidden`,`group-data-[collapsible=icon]:hidden`,e),...n})}function j({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-group-content`,"data-sidebar":`group-content`,className:m(`w-full text-sm`,e),...t})}function M({className:e,...t}){return(0,V.jsx)(`ul`,{"data-slot":`sidebar-menu`,"data-sidebar":`menu`,className:m(`flex w-full min-w-0 flex-col gap-1`,e),...t})}function N({className:e,...t}){return(0,V.jsx)(`li`,{"data-slot":`sidebar-menu-item`,"data-sidebar":`menu-item`,className:m(`group/menu-item relative`,e),...t})}function P({asChild:e=!1,isActive:t=!1,variant:n=`default`,size:r=`default`,tooltip:i,className:a,...o}){let s=e?d:`button`,{isMobile:c,state:l}=b(),u=(0,V.jsx)(s,{"data-slot":`sidebar-menu-button`,"data-sidebar":`menu-button`,"data-size":r,"data-active":t,className:m(Ae({variant:n,size:r}),a),...o});return i?(typeof i==`string`&&(i={children:i}),(0,V.jsxs)(ge,{children:[(0,V.jsx)(pe,{asChild:!0,children:u}),(0,V.jsx)(me,{side:`right`,align:`center`,hidden:l!==`collapsed`||c,...i})]})):u}function Ee({className:e,asChild:t=!1,showOnHover:n=!1,...r}){return(0,V.jsx)(t?d:`button`,{"data-slot":`sidebar-menu-action`,"data-sidebar":`menu-action`,className:m(`text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0`,`after:absolute after:-inset-2 md:after:hidden`,`peer-data-[size=sm]/menu-button:top-1`,`peer-data-[size=default]/menu-button:top-1.5`,`peer-data-[size=lg]/menu-button:top-2.5`,`group-data-[collapsible=icon]:hidden`,n&&`peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0`,e),...r})}function F({className:e,...t}){return(0,V.jsx)(`div`,{"data-slot":`sidebar-menu-badge`,"data-sidebar":`menu-badge`,className:m(`text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none`,`peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground`,`peer-data-[size=sm]/menu-button:top-1`,`peer-data-[size=default]/menu-button:top-1.5`,`peer-data-[size=lg]/menu-button:top-2.5`,`group-data-[collapsible=icon]:hidden`,e),...t})}function I({className:e,showIcon:t=!1,...n}){return(0,V.jsxs)(`div`,{"data-slot":`sidebar-menu-skeleton`,"data-sidebar":`menu-skeleton`,className:m(`flex h-8 items-center gap-2 rounded-md px-2`,e),...n,children:[t&&(0,V.jsx)(v,{className:`size-4 rounded-md`,"data-sidebar":`menu-skeleton-icon`}),(0,V.jsx)(v,{className:`h-4 max-w-(--skeleton-width) flex-1`,"data-sidebar":`menu-skeleton-text`,style:{"--skeleton-width":`70%`}})]})}function L({className:e,...t}){return(0,V.jsx)(`ul`,{"data-slot":`sidebar-menu-sub`,"data-sidebar":`menu-sub`,className:m(`border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5`,`group-data-[collapsible=icon]:hidden`,e),...t})}function R({className:e,...t}){return(0,V.jsx)(`li`,{"data-slot":`sidebar-menu-sub-item`,"data-sidebar":`menu-sub-item`,className:m(`group/menu-sub-item relative`,e),...t})}function z({asChild:e=!1,size:t=`md`,isActive:n=!1,className:r,...i}){return(0,V.jsx)(e?d:`a`,{"data-slot":`sidebar-menu-sub-button`,"data-sidebar":`menu-sub-button`,"data-size":t,"data-active":n,className:m(`text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`,`data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground`,t===`sm`&&`text-xs`,t===`md`&&`text-sm`,`group-data-[collapsible=icon]:hidden`,r),...i})}var B,V,H,U,W,De,Oe,ke,G,Ae,je=e((()=>{h(),c(),f(),B=t(n(),1),p(),Se(),_(),te(),re(),oe(),de(),fe(),V=r(),H=`sidebar_state`,U=3600*24*7,W=`16rem`,De=`18rem`,Oe=`3rem`,ke=`b`,G=(0,B.createContext)(null),Ae=g(`peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[active=true]:bg-white/60 data-[active=true]:font-bold data-[active=true]:text-sidebar-primary data-[active=true]:shadow-sm data-[active=true]:ring-1 data-[active=true]:ring-black/5 dark:data-[active=true]:bg-white/5 dark:data-[active=true]:ring-white/5 data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`,{variants:{variant:{default:`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`,outline:`bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]`},size:{default:`h-8 text-sm`,sm:`h-7 text-xs`,lg:`h-12 text-sm group-data-[collapsible=icon]:p-0!`}},defaultVariants:{variant:`default`,size:`default`}}),S.__docgenInfo={description:'@param side `"left"` (default) or `"right"` edge placement.\n@param variant `"sidebar"` (default border), `"floating"` (detached with shadow), `"inset"` (nested in content).\n@param collapsible `"offcanvas"` (slides out), `"icon"` (collapses to icon strip), `"none"` (always expanded).',methods:[],displayName:`Sidebar`,props:{side:{required:!1,tsType:{name:`union`,raw:`"left" | "right"`,elements:[{name:`literal`,value:`"left"`},{name:`literal`,value:`"right"`}]},description:``,defaultValue:{value:`"left"`,computed:!1}},variant:{required:!1,tsType:{name:`union`,raw:`"floating" | "inset" | "sidebar"`,elements:[{name:`literal`,value:`"floating"`},{name:`literal`,value:`"inset"`},{name:`literal`,value:`"sidebar"`}]},description:``,defaultValue:{value:`"sidebar"`,computed:!1}},collapsible:{required:!1,tsType:{name:`union`,raw:`"icon" | "none" | "offcanvas"`,elements:[{name:`literal`,value:`"icon"`},{name:`literal`,value:`"none"`},{name:`literal`,value:`"offcanvas"`}]},description:``,defaultValue:{value:`"offcanvas"`,computed:!1}}}},O.__docgenInfo={description:``,methods:[],displayName:`SidebarContent`},E.__docgenInfo={description:``,methods:[],displayName:`SidebarFooter`},k.__docgenInfo={description:``,methods:[],displayName:`SidebarGroup`},Te.__docgenInfo={description:``,methods:[],displayName:`SidebarGroupAction`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},j.__docgenInfo={description:``,methods:[],displayName:`SidebarGroupContent`},A.__docgenInfo={description:``,methods:[],displayName:`SidebarGroupLabel`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},T.__docgenInfo={description:``,methods:[],displayName:`SidebarHeader`},we.__docgenInfo={description:``,methods:[],displayName:`SidebarInput`},w.__docgenInfo={description:``,methods:[],displayName:`SidebarInset`},M.__docgenInfo={description:``,methods:[],displayName:`SidebarMenu`},Ee.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuAction`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},showOnHover:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},F.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuBadge`},P.__docgenInfo={description:"@param isActive Marks the button as the current/active item (accent background + font-medium).\n@param tooltip Tooltip shown when sidebar is collapsed. String or `TooltipContent` props.\n@param asChild Merge props onto child element via Radix `Slot`.",methods:[],displayName:`SidebarMenuButton`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},isActive:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},tooltip:{required:!1,tsType:{name:`union`,raw:`ComponentProps<typeof TooltipContent> | string`,elements:[{name:`ComponentProps`,elements:[{name:`TooltipContent`}],raw:`ComponentProps<typeof TooltipContent>`},{name:`string`}]},description:``},variant:{defaultValue:{value:`"default"`,computed:!1},required:!1},size:{defaultValue:{value:`"default"`,computed:!1},required:!1}}},N.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuItem`},I.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuSkeleton`,props:{showIcon:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},L.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuSub`},z.__docgenInfo={description:'@param isActive Marks the sub-button as the current/active item.\n@param size `"md"` (default) or `"sm"` (xs text).',methods:[],displayName:`SidebarMenuSubButton`,props:{asChild:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`"md" | "sm"`,elements:[{name:`literal`,value:`"md"`},{name:`literal`,value:`"sm"`}]},description:``,defaultValue:{value:`"md"`,computed:!1}},isActive:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}}},R.__docgenInfo={description:``,methods:[],displayName:`SidebarMenuSubItem`},x.__docgenInfo={description:``,methods:[],displayName:`SidebarProvider`,props:{defaultOpen:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}},open:{required:!1,tsType:{name:`boolean`},description:``},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(open: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`open`}],return:{name:`void`}}},description:``}}},Ce.__docgenInfo={description:``,methods:[],displayName:`SidebarRail`},D.__docgenInfo={description:``,methods:[],displayName:`SidebarSeparator`},C.__docgenInfo={description:``,methods:[],displayName:`SidebarTrigger`}})),K,Me,Ne,q,J,Y,X,Z,Q,$;e((()=>{c(),je(),K=r(),Me={title:`Components/Sidebar`,component:S,decorators:[e=>(0,K.jsx)(`div`,{style:{height:`600px`,display:`flex`},children:(0,K.jsx)(e,{})})],parameters:{docs:{description:{component:`Layout de barre latérale repliable avec fallback en sheet sur mobile, raccourci clavier (Cmd+B), tooltips, sous-menus et support de badges.`}}}},Ne=[{title:`Home`,icon:o,url:`#`},{title:`Inbox`,icon:i,url:`#`,badge:`12`},{title:`Calendar`,icon:a,url:`#`},{title:`Search`,icon:s,url:`#`},{title:`Settings`,icon:l,url:`#`}],q={render:()=>(0,K.jsxs)(x,{children:[(0,K.jsxs)(S,{children:[(0,K.jsx)(T,{children:(0,K.jsx)(`div`,{className:`px-2 py-1 text-sm font-semibold`,children:`Application`})}),(0,K.jsx)(O,{children:(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Navigation`}),(0,K.jsx)(j,{children:(0,K.jsx)(M,{children:Ne.map(e=>(0,K.jsxs)(N,{children:[(0,K.jsxs)(P,{tooltip:e.title,children:[(0,K.jsx)(e.icon,{}),(0,K.jsx)(`span`,{children:e.title})]}),e.badge&&(0,K.jsx)(F,{children:e.badge})]},e.title))})})]})}),(0,K.jsx)(E,{children:(0,K.jsx)(`div`,{className:`px-2 py-1 text-xs text-muted-foreground`,children:`v1.0.0`})})]}),(0,K.jsxs)(w,{children:[(0,K.jsxs)(`header`,{className:`flex items-center gap-2 border-b p-4`,children:[(0,K.jsx)(C,{}),(0,K.jsx)(`span`,{className:`text-sm font-medium`,children:`Content Area`})]}),(0,K.jsx)(`div`,{className:`p-4`,children:(0,K.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Main content goes here.`})})]})]})},J={render:()=>(0,K.jsxs)(x,{children:[(0,K.jsx)(S,{children:(0,K.jsx)(O,{children:(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Platform`}),(0,K.jsx)(j,{children:(0,K.jsxs)(M,{children:[(0,K.jsx)(N,{children:(0,K.jsxs)(P,{isActive:!0,children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Dashboard`})]})}),(0,K.jsxs)(N,{children:[(0,K.jsxs)(P,{children:[(0,K.jsx)(l,{}),(0,K.jsx)(`span`,{children:`Settings`})]}),(0,K.jsxs)(L,{children:[(0,K.jsx)(R,{children:(0,K.jsx)(z,{isActive:!0,children:`General`})}),(0,K.jsx)(R,{children:(0,K.jsx)(z,{children:`Security`})}),(0,K.jsx)(R,{children:(0,K.jsx)(z,{children:`Notifications`})})]})]})]})})]})})}),(0,K.jsx)(w,{children:(0,K.jsx)(`div`,{className:`p-4`,children:`Content`})})]})},Y={render:()=>(0,K.jsxs)(x,{children:[(0,K.jsx)(S,{children:(0,K.jsxs)(O,{children:[(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Main`}),(0,K.jsx)(j,{children:(0,K.jsx)(M,{children:(0,K.jsx)(N,{children:(0,K.jsxs)(P,{children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Home`})]})})})})]}),(0,K.jsx)(D,{}),(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Other`}),(0,K.jsx)(j,{children:(0,K.jsx)(M,{children:(0,K.jsx)(N,{children:(0,K.jsxs)(P,{children:[(0,K.jsx)(l,{}),(0,K.jsx)(`span`,{children:`Settings`})]})})})})]})]})}),(0,K.jsx)(w,{children:(0,K.jsx)(`div`,{className:`p-4`,children:`Content`})})]})},X={parameters:{docs:{description:{story:"Utilise des composants `SidebarMenuSkeleton` avec des placeholders d'icones pour afficher un état de chargement pendant le fetch des items du menu."}}},render:()=>(0,K.jsxs)(x,{children:[(0,K.jsx)(S,{children:(0,K.jsx)(O,{children:(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Loading...`}),(0,K.jsx)(j,{children:(0,K.jsx)(M,{children:Array.from({length:5}).map((e,t)=>(0,K.jsx)(N,{children:(0,K.jsx)(I,{showIcon:!0})},t))})})]})})}),(0,K.jsx)(w,{children:(0,K.jsx)(`div`,{className:`p-4`,children:`Loading sidebar items...`})})]})},Z={parameters:{docs:{description:{story:'Définit `collapsible="none"` pour désactiver le repli -- la barre latérale reste entièrement ouverte en permanence.'}}},render:()=>(0,K.jsxs)(x,{children:[(0,K.jsx)(S,{collapsible:`none`,children:(0,K.jsx)(O,{children:(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Non-collapsible`}),(0,K.jsx)(j,{children:(0,K.jsxs)(M,{children:[(0,K.jsx)(N,{children:(0,K.jsxs)(P,{children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Home`})]})}),(0,K.jsx)(N,{children:(0,K.jsxs)(P,{children:[(0,K.jsx)(l,{}),(0,K.jsx)(`span`,{children:`Settings`})]})})]})})]})})}),(0,K.jsx)(w,{children:(0,K.jsx)(`div`,{className:`p-4`,children:`This sidebar cannot be collapsed.`})})]})},Q={render:()=>(0,K.jsxs)(x,{children:[(0,K.jsx)(S,{children:(0,K.jsx)(O,{children:(0,K.jsxs)(k,{children:[(0,K.jsx)(A,{children:`Button Sizes`}),(0,K.jsx)(j,{children:(0,K.jsxs)(M,{children:[(0,K.jsx)(N,{children:(0,K.jsxs)(P,{size:`sm`,children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Small`})]})}),(0,K.jsx)(N,{children:(0,K.jsxs)(P,{size:`default`,children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Default`})]})}),(0,K.jsx)(N,{children:(0,K.jsxs)(P,{size:`lg`,children:[(0,K.jsx)(o,{}),(0,K.jsx)(`span`,{children:`Large`})]})})]})})]})})}),(0,K.jsx)(w,{children:(0,K.jsx)(`div`,{className:`p-4`,children:`Different menu button sizes.`})})]})},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="px-2 py-1 text-sm font-semibold">Application</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-1 text-xs text-muted-foreground">v1.0.0</div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 border-b p-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Content Area</span>
        </header>
        <div className="p-4">
          <p className="text-muted-foreground text-sm">Main content goes here.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Home />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>General</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Security</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Notifications</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Content</div>
      </SidebarInset>
    </SidebarProvider>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Content</div>
      </SidebarInset>
    </SidebarProvider>
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Utilise des composants \`SidebarMenuSkeleton\` avec des placeholders d'icones pour afficher un état de chargement pendant le fetch des items du menu."
      }
    }
  },
  render: () => <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({
                length: 5
              }).map((_, i) => <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Loading sidebar items...</div>
      </SidebarInset>
    </SidebarProvider>
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Définit \`collapsible="none"\` pour désactiver le repli -- la barre latérale reste entièrement ouverte en permanence.'
      }
    }
  },
  render: () => <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Non-collapsible</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">This sidebar cannot be collapsed.</div>
      </SidebarInset>
    </SidebarProvider>
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Button Sizes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm">
                    <Home />
                    <span>Small</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="default">
                    <Home />
                    <span>Default</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <Home />
                    <span>Large</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">Different menu button sizes.</div>
      </SidebarInset>
    </SidebarProvider>
}`,...Q.parameters?.docs?.source}}},$=[`Default`,`WithSubMenu`,`WithSeparator`,`SkeletonLoading`,`CollapsibleNone`,`MenuButtonSizes`]}))();export{Z as CollapsibleNone,q as Default,Q as MenuButtonSizes,X as SkeletonLoading,Y as WithSeparator,J as WithSubMenu,$ as __namedExportsOrder,Me as default};