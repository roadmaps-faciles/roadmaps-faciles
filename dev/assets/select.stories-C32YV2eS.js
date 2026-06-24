import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{n,t as r}from"./label-DwTbaTT2.js";import{a as i,c as a,i as o,l as s,n as c,o as l,r as u,s as d,t as f}from"./select-DsufQQZf.js";var p,m,h,g,_,v,y,b,x;e((()=>{n(),s(),p=t(),m={title:`Components/Select`,component:f,parameters:{docs:{description:{component:`Menu déroulant de type select natif avec boutons de défilement, indicateur de sélection et options groupées. Basé sur Radix Select.`}}}},h={render:()=>(0,p.jsxs)(f,{children:[(0,p.jsx)(d,{className:`w-45`,children:(0,p.jsx)(a,{placeholder:`Select a fruit`})}),(0,p.jsx)(c,{children:(0,p.jsxs)(u,{children:[(0,p.jsx)(i,{children:`Fruits`}),(0,p.jsx)(o,{value:`apple`,children:`Apple`}),(0,p.jsx)(o,{value:`banana`,children:`Banana`}),(0,p.jsx)(o,{value:`blueberry`,children:`Blueberry`}),(0,p.jsx)(o,{value:`grapes`,children:`Grapes`}),(0,p.jsx)(o,{value:`pineapple`,children:`Pineapple`})]})})]})},g={render:()=>(0,p.jsxs)(f,{children:[(0,p.jsx)(d,{className:`w-50`,children:(0,p.jsx)(a,{placeholder:`Select a timezone`})}),(0,p.jsxs)(c,{children:[(0,p.jsxs)(u,{children:[(0,p.jsx)(i,{children:`North America`}),(0,p.jsx)(o,{value:`est`,children:`Eastern (EST)`}),(0,p.jsx)(o,{value:`cst`,children:`Central (CST)`}),(0,p.jsx)(o,{value:`pst`,children:`Pacific (PST)`})]}),(0,p.jsx)(l,{}),(0,p.jsxs)(u,{children:[(0,p.jsx)(i,{children:`Europe`}),(0,p.jsx)(o,{value:`gmt`,children:`GMT`}),(0,p.jsx)(o,{value:`cet`,children:`Central European (CET)`}),(0,p.jsx)(o,{value:`eet`,children:`Eastern European (EET)`})]})]})]})},_={parameters:{docs:{description:{story:"Utilise la variante de taille `sm` sur `SelectTrigger` pour un déclencheur plus compact de 32px de hauteur."}}},render:()=>(0,p.jsxs)(f,{children:[(0,p.jsx)(d,{size:`sm`,className:`w-45`,children:(0,p.jsx)(a,{placeholder:`Small trigger`})}),(0,p.jsxs)(c,{children:[(0,p.jsx)(o,{value:`a`,children:`Option A`}),(0,p.jsx)(o,{value:`b`,children:`Option B`}),(0,p.jsx)(o,{value:`c`,children:`Option C`})]})]})},v={render:()=>(0,p.jsxs)(f,{disabled:!0,children:[(0,p.jsx)(d,{className:`w-45`,children:(0,p.jsx)(a,{placeholder:`Disabled`})}),(0,p.jsx)(c,{children:(0,p.jsx)(o,{value:`a`,children:`Option A`})})]})},y={render:()=>(0,p.jsxs)(f,{children:[(0,p.jsx)(d,{className:`w-45`,children:(0,p.jsx)(a,{placeholder:`Select option`})}),(0,p.jsxs)(c,{children:[(0,p.jsx)(o,{value:`a`,children:`Option A`}),(0,p.jsx)(o,{value:`b`,disabled:!0,children:`Option B (disabled)`}),(0,p.jsx)(o,{value:`c`,children:`Option C`})]})]})},b={render:()=>(0,p.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,p.jsx)(r,{htmlFor:`framework`,children:`Framework`}),(0,p.jsxs)(f,{children:[(0,p.jsx)(d,{id:`framework`,className:`w-45`,children:(0,p.jsx)(a,{placeholder:`Select`})}),(0,p.jsxs)(c,{children:[(0,p.jsx)(o,{value:`next`,children:`Next.js`}),(0,p.jsx)(o,{value:`remix`,children:`Remix`}),(0,p.jsx)(o,{value:`astro`,children:`Astro`}),(0,p.jsx)(o,{value:`nuxt`,children:`Nuxt`})]})]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Select>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Select>
      <SelectTrigger className="w-50">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern (EST)</SelectItem>
          <SelectItem value="cst">Central (CST)</SelectItem>
          <SelectItem value="pst">Pacific (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="gmt">GMT</SelectItem>
          <SelectItem value="cet">Central European (CET)</SelectItem>
          <SelectItem value="eet">Eastern European (EET)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Utilise la variante de taille \`sm\` sur \`SelectTrigger\` pour un déclencheur plus compact de 32px de hauteur."
      }
    }
  },
  render: () => <Select>
      <SelectTrigger size="sm" className="w-45">
        <SelectValue placeholder="Small trigger" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b">Option B</SelectItem>
        <SelectItem value="c">Option C</SelectItem>
      </SelectContent>
    </Select>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Select disabled>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Select>
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b" disabled>
          Option B (disabled)
        </SelectItem>
        <SelectItem value="c">Option C</SelectItem>
      </SelectContent>
    </Select>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="framework">Framework</Label>
      <Select>
        <SelectTrigger id="framework" className="w-45">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="nuxt">Nuxt</SelectItem>
        </SelectContent>
      </Select>
    </div>
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithGroups`,`SizeSmall`,`Disabled`,`DisabledItem`,`WithLabel`]}))();export{h as Default,v as Disabled,y as DisabledItem,_ as SizeSmall,g as WithGroups,b as WithLabel,x as __namedExportsOrder,m as default};