import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{n,t as r}from"./separator-BhMER1Dy.js";var i,a,o,s,c;e((()=>{n(),i=t(),a={title:`Components/Separator`,component:r,parameters:{docs:{description:{component:`Ligne de séparation visuelle, horizontale ou verticale. Décorative par défaut (masquée de l'arbre d'accessibilité).`}}}},o={render:()=>(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`div`,{className:`space-y-1`,children:[(0,i.jsx)(`h4`,{className:`text-sm font-medium leading-none`,children:`Radix Primitives`}),(0,i.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`An open-source UI component library.`})]}),(0,i.jsx)(r,{className:`my-4`}),(0,i.jsxs)(`div`,{className:`flex h-5 items-center gap-4 text-sm`,children:[(0,i.jsx)(`div`,{children:`Blog`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`div`,{children:`Docs`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`div`,{children:`Source`})]})]})},s={render:()=>(0,i.jsxs)(`div`,{className:`flex h-5 items-center gap-4 text-sm`,children:[(0,i.jsx)(`div`,{children:`Item 1`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`div`,{children:`Item 2`}),(0,i.jsx)(r,{orientation:`vertical`}),(0,i.jsx)(`div`,{children:`Item 3`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex h-5 items-center gap-4 text-sm">
      <div>Item 1</div>
      <Separator orientation="vertical" />
      <div>Item 2</div>
      <Separator orientation="vertical" />
      <div>Item 3</div>
    </div>
}`,...s.parameters?.docs?.source}}},c=[`Horizontal`,`Vertical`]}))();export{o as Horizontal,s as Vertical,c as __namedExportsOrder,a as default};