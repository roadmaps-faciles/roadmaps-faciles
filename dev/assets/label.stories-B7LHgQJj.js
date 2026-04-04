import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-CP1YPFjh.js";import{n,t as r}from"./checkbox-CNCxlmYf.js";import{n as i,t as a}from"./input-BcTJh7yU.js";import{n as o,t as s}from"./label-Q-3rYpzD.js";var c,l,u,d,f,p,m;e((()=>{n(),i(),o(),c=t(),l={title:`Components/Label`,component:s,args:{children:`Label text`},parameters:{docs:{description:{component:`Label de formulaire accessible basé sur Radix. S'atténue automatiquement quand le champ associé est désactivé.`}}}},u={},d={render:()=>(0,c.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,c.jsx)(s,{htmlFor:`name`,children:`Name`}),(0,c.jsx)(a,{id:`name`,placeholder:`Enter your name`})]})},f={render:()=>(0,c.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,c.jsx)(r,{id:`agree`}),(0,c.jsx)(s,{htmlFor:`agree`,children:`I agree to the terms`})]})},p={render:()=>(0,c.jsxs)(`div`,{className:`group grid w-full max-w-sm gap-1.5`,"data-disabled":`true`,children:[(0,c.jsx)(s,{htmlFor:`disabled`,children:`Disabled Label`}),(0,c.jsx)(a,{id:`disabled`,disabled:!0,placeholder:`Disabled`})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-2">
      <Checkbox id="agree" />
      <Label htmlFor="agree">I agree to the terms</Label>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="group grid w-full max-w-sm gap-1.5" data-disabled="true">
      <Label htmlFor="disabled">Disabled Label</Label>
      <Input id="disabled" disabled placeholder="Disabled" />
    </div>
}`,...p.parameters?.docs?.source}}},m=[`Default`,`WithInput`,`WithCheckbox`,`Disabled`]}))();export{u as Default,p as Disabled,f as WithCheckbox,d as WithInput,m as __namedExportsOrder,l as default};