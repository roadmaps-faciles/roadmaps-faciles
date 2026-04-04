import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-ENPEqnHb.js";import{n,t as r}from"./label-CeJd9eIO.js";import{n as i,r as a,t as o}from"./radio-group-Dip8XL4K.js";var s,c,l,u,d,f;e((()=>{n(),a(),s=t(),c={title:`Components/RadioGroup`,component:o,parameters:{docs:{description:{component:`Groupe de boutons radio accessible basé sur Radix. Affiche un indicateur circulaire plein sur l'item sélectionné.`}}}},l={render:()=>(0,s.jsxs)(o,{defaultValue:`option-one`,children:[(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`option-one`,id:`option-one`}),(0,s.jsx)(r,{htmlFor:`option-one`,children:`Option One`})]}),(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`option-two`,id:`option-two`}),(0,s.jsx)(r,{htmlFor:`option-two`,children:`Option Two`})]}),(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`option-three`,id:`option-three`}),(0,s.jsx)(r,{htmlFor:`option-three`,children:`Option Three`})]})]})},u={render:()=>(0,s.jsxs)(o,{defaultValue:`option-one`,disabled:!0,children:[(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`option-one`,id:`d-option-one`}),(0,s.jsx)(r,{htmlFor:`d-option-one`,children:`Option One`})]}),(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`option-two`,id:`d-option-two`}),(0,s.jsx)(r,{htmlFor:`d-option-two`,children:`Option Two`})]})]})},d={parameters:{docs:{description:{story:"Remplace la grille verticale par défaut par `flex-row` pour des options radio horizontales inline."}}},render:()=>(0,s.jsxs)(o,{defaultValue:`a`,className:`flex flex-row gap-4`,children:[(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`a`,id:`h-a`}),(0,s.jsx)(r,{htmlFor:`h-a`,children:`A`})]}),(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`b`,id:`h-b`}),(0,s.jsx)(r,{htmlFor:`h-b`,children:`B`})]}),(0,s.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,s.jsx)(i,{value:`c`,id:`h-c`}),(0,s.jsx)(r,{htmlFor:`h-c`,children:`C`})]})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <RadioGroup defaultValue="option-one">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-three" id="option-three" />
        <Label htmlFor="option-three">Option Three</Label>
      </div>
    </RadioGroup>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-one" id="d-option-one" />
        <Label htmlFor="d-option-one">Option One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-two" id="d-option-two" />
        <Label htmlFor="d-option-two">Option Two</Label>
      </div>
    </RadioGroup>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Remplace la grille verticale par défaut par \`flex-row\` pour des options radio horizontales inline."
      }
    }
  },
  render: () => <RadioGroup defaultValue="a" className="flex flex-row gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="h-a" />
        <Label htmlFor="h-a">A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="h-b" />
        <Label htmlFor="h-b">B</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="c" id="h-c" />
        <Label htmlFor="h-c">C</Label>
      </div>
    </RadioGroup>
}`,...d.parameters?.docs?.source}}},f=[`Default`,`Disabled`,`Horizontal`]}))();export{l as Default,u as Disabled,d as Horizontal,f as __namedExportsOrder,c as default};