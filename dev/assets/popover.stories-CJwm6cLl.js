import{i as e}from"./preload-helper-Ce6laLq_.js";import{x as t}from"./iframe-iSxkq6le.js";import{r as n,t as r}from"./button-B9XHJ4lF.js";import{n as i,t as a}from"./input-BZZBslfe.js";import{n as o,t as s}from"./label-B6-vcJOd.js";import{i as c,n as l,r as u,t as d}from"./popover-CFSOkDEs.js";var f,p,m,h,g,_;e((()=>{n(),i(),o(),c(),f=t(),p={title:`Components/Popover`,component:d,parameters:{docs:{description:{component:`Panneau de contenu flottant ancré à un élément déclencheur. Supporte l'alignement configurable et le décalage latéral.`}}}},m={render:()=>(0,f.jsx)(`div`,{className:`flex justify-center`,children:(0,f.jsxs)(d,{children:[(0,f.jsx)(u,{asChild:!0,children:(0,f.jsx)(r,{variant:`outline`,children:`Open Popover`})}),(0,f.jsx)(l,{children:(0,f.jsxs)(`div`,{className:`grid gap-4`,children:[(0,f.jsxs)(`div`,{className:`space-y-2`,children:[(0,f.jsx)(`h4`,{className:`font-medium leading-none`,children:`Dimensions`}),(0,f.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Set the dimensions for the layer.`})]}),(0,f.jsxs)(`div`,{className:`grid gap-2`,children:[(0,f.jsxs)(`div`,{className:`grid grid-cols-3 items-center gap-4`,children:[(0,f.jsx)(s,{htmlFor:`width`,children:`Width`}),(0,f.jsx)(a,{id:`width`,defaultValue:`100%`,className:`col-span-2 h-8`})]}),(0,f.jsxs)(`div`,{className:`grid grid-cols-3 items-center gap-4`,children:[(0,f.jsx)(s,{htmlFor:`height`,children:`Height`}),(0,f.jsx)(a,{id:`height`,defaultValue:`25px`,className:`col-span-2 h-8`})]})]})]})})]})})},h={render:()=>(0,f.jsx)(`div`,{className:`flex justify-center`,children:(0,f.jsxs)(d,{children:[(0,f.jsx)(u,{asChild:!0,children:(0,f.jsx)(r,{variant:`outline`,children:`Align Start`})}),(0,f.jsx)(l,{align:`start`,children:(0,f.jsx)(`p`,{className:`text-sm`,children:`Content aligned to start.`})})]})})},g={render:()=>(0,f.jsxs)(d,{children:[(0,f.jsx)(u,{asChild:!0,children:(0,f.jsx)(r,{variant:`outline`,children:`Align End`})}),(0,f.jsx)(l,{align:`end`,children:(0,f.jsx)(`p`,{className:`text-sm`,children:`Content aligned to end.`})})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p className="text-sm">Content aligned to start.</p>
        </PopoverContent>
      </Popover>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Align End</Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <p className="text-sm">Content aligned to end.</p>
      </PopoverContent>
    </Popover>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`AlignStart`,`AlignEnd`]}))();export{g as AlignEnd,h as AlignStart,m as Default,_ as __namedExportsOrder,p as default};