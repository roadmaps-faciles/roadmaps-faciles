import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-CP1YPFjh.js";import{r as n,t as r}from"./button-CrnzGfy4.js";import{a as i,i as a,n as o,r as s,t as c}from"./tooltip-Ce-qwbF2.js";var l,u,d,f,p,m,h,g;e((()=>{n(),i(),l=t(),u={title:`Components/Tooltip`,component:c,decorators:[e=>(0,l.jsx)(s,{children:(0,l.jsx)(e,{})})],parameters:{docs:{description:{component:"Infobulle au survol avec indicateur fléché et animation d'ouverture/fermeture. Nécessite un `TooltipProvider` englobant pour la configuration du délai."}}}},d={render:()=>(0,l.jsxs)(c,{children:[(0,l.jsx)(a,{asChild:!0,children:(0,l.jsx)(r,{variant:`outline`,children:`Hover me`})}),(0,l.jsx)(o,{children:(0,l.jsx)(`p`,{children:`This is a tooltip`})})]})},f={render:()=>(0,l.jsx)(`div`,{className:`flex min-h-[100px] items-center justify-center`,children:(0,l.jsxs)(c,{children:[(0,l.jsx)(a,{asChild:!0,children:(0,l.jsx)(r,{variant:`outline`,children:`Top`})}),(0,l.jsx)(o,{side:`top`,children:(0,l.jsx)(`p`,{children:`Tooltip on top`})})]})})},p={render:()=>(0,l.jsxs)(c,{children:[(0,l.jsx)(a,{asChild:!0,children:(0,l.jsx)(r,{variant:`outline`,children:`Bottom`})}),(0,l.jsx)(o,{side:`bottom`,children:(0,l.jsx)(`p`,{children:`Tooltip on bottom`})})]})},m={render:()=>(0,l.jsx)(`div`,{className:`flex justify-center`,children:(0,l.jsxs)(c,{children:[(0,l.jsx)(a,{asChild:!0,children:(0,l.jsx)(r,{variant:`outline`,children:`Left`})}),(0,l.jsx)(o,{side:`left`,children:(0,l.jsx)(`p`,{children:`Tooltip on left`})})]})})},h={render:()=>(0,l.jsxs)(c,{children:[(0,l.jsx)(a,{asChild:!0,children:(0,l.jsx)(r,{variant:`outline`,children:`Right`})}),(0,l.jsx)(o,{side:`right`,children:(0,l.jsx)(`p`,{children:`Tooltip on right`})})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex min-h-[100px] items-center justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Bottom</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Tooltip on bottom</p>
      </TooltipContent>
    </Tooltip>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Right</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Tooltip on right</p>
      </TooltipContent>
    </Tooltip>
}`,...h.parameters?.docs?.source}}},g=[`Default`,`SideTop`,`SideBottom`,`SideLeft`,`SideRight`]}))();export{d as Default,p as SideBottom,m as SideLeft,h as SideRight,f as SideTop,g as __namedExportsOrder,u as default};