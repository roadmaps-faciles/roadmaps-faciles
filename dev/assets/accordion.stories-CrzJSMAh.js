import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-ENPEqnHb.js";import{a as n,i as r,n as i,r as a,t as o}from"./accordion-t5A-DjxV.js";var s,c,l,u,d,f,p;e((()=>{n(),s=t(),c={title:`Components/Accordion`,component:o,parameters:{docs:{description:{component:`Sections de contenu dépliables basées sur Radix. Supporte l'ouverture simple ou multiple, avec des transitions animées d'ouverture/fermeture.`}}}},l={render:()=>(0,s.jsxs)(o,{type:`single`,collapsible:!0,className:`w-full max-w-md`,children:[(0,s.jsxs)(a,{value:`item-1`,children:[(0,s.jsx)(r,{children:`Is it accessible?`}),(0,s.jsx)(i,{children:`Yes. It adheres to the WAI-ARIA design pattern.`})]}),(0,s.jsxs)(a,{value:`item-2`,children:[(0,s.jsx)(r,{children:`Is it styled?`}),(0,s.jsx)(i,{children:`Yes. It comes with default styles that match the design system.`})]}),(0,s.jsxs)(a,{value:`item-3`,children:[(0,s.jsx)(r,{children:`Is it animated?`}),(0,s.jsx)(i,{children:`Yes. It uses CSS animations for smooth open/close transitions.`})]})]})},u={parameters:{docs:{description:{story:`Permet d'ouvrir plusieurs items simultanément (pas de fermeture automatique).`}}},render:()=>(0,s.jsxs)(o,{type:`multiple`,className:`w-full max-w-md`,children:[(0,s.jsxs)(a,{value:`item-1`,children:[(0,s.jsx)(r,{children:`First item`}),(0,s.jsx)(i,{children:`Content for the first item.`})]}),(0,s.jsxs)(a,{value:`item-2`,children:[(0,s.jsx)(r,{children:`Second item`}),(0,s.jsx)(i,{children:`Content for the second item.`})]}),(0,s.jsxs)(a,{value:`item-3`,children:[(0,s.jsx)(r,{children:`Third item`}),(0,s.jsx)(i,{children:`Content for the third item.`})]})]})},d={render:()=>(0,s.jsxs)(o,{type:`single`,collapsible:!0,defaultValue:`item-1`,className:`w-full max-w-md`,children:[(0,s.jsxs)(a,{value:`item-1`,children:[(0,s.jsx)(r,{children:`Open by default`}),(0,s.jsx)(i,{children:`This item is open by default.`})]}),(0,s.jsxs)(a,{value:`item-2`,children:[(0,s.jsx)(r,{children:`Closed by default`}),(0,s.jsx)(i,{children:`This item is closed by default.`})]})]})},f={render:()=>(0,s.jsxs)(o,{type:`single`,collapsible:!0,className:`w-full max-w-md`,children:[(0,s.jsxs)(a,{value:`item-1`,children:[(0,s.jsx)(r,{children:`Enabled item`}),(0,s.jsx)(i,{children:`This item can be toggled.`})]}),(0,s.jsxs)(a,{value:`item-2`,disabled:!0,children:[(0,s.jsx)(r,{children:`Disabled item`}),(0,s.jsx)(i,{children:`This item cannot be toggled.`})]})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default styles that match the design system.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It uses CSS animations for smooth open/close transitions.</AccordionContent>
      </AccordionItem>
    </Accordion>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Permet d'ouvrir plusieurs items simultanément (pas de fermeture automatique)."
      }
    }
  },
  render: () => <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First item</AccordionTrigger>
        <AccordionContent>Content for the first item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second item</AccordionTrigger>
        <AccordionContent>Content for the second item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third item</AccordionTrigger>
        <AccordionContent>Content for the third item.</AccordionContent>
      </AccordionItem>
    </Accordion>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>This item is open by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>This item is closed by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Enabled item</AccordionTrigger>
        <AccordionContent>This item can be toggled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Disabled item</AccordionTrigger>
        <AccordionContent>This item cannot be toggled.</AccordionContent>
      </AccordionItem>
    </Accordion>
}`,...f.parameters?.docs?.source}}},p=[`Single`,`Multiple`,`DefaultOpen`,`Disabled`]}))();export{d as DefaultOpen,f as Disabled,u as Multiple,l as Single,p as __namedExportsOrder,c as default};