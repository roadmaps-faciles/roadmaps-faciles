import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-CP1YPFjh.js";import{a as n,c as r,i,n as a,o,r as s,s as c,t as l}from"./breadcrumb-AVTeiF8h.js";var u,d,f,p,m,h;e((()=>{r(),u=t(),d={title:`Components/Breadcrumb`,component:l,parameters:{docs:{description:{component:"Fil d'Ariane de navigation avec séparateurs chevron automatiques, ellipse de débordement et composition de liens via `asChild`."}}}},f={render:()=>(0,u.jsx)(l,{children:(0,u.jsxs)(n,{children:[(0,u.jsx)(s,{children:(0,u.jsx)(i,{href:`#`,children:`Home`})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(i,{href:`#`,children:`Components`})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(o,{children:`Breadcrumb`})})]})})},p={parameters:{docs:{description:{story:`Réduit les items intermédiaires du fil d'Ariane en un indicateur d'ellipse pour les chemins de navigation longs.`}}},render:()=>(0,u.jsx)(l,{children:(0,u.jsxs)(n,{children:[(0,u.jsx)(s,{children:(0,u.jsx)(i,{href:`#`,children:`Home`})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(a,{})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(i,{href:`#`,children:`Category`})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(o,{children:`Current Page`})})]})})},m={parameters:{docs:{description:{story:"Utilise `asChild` sur `BreadcrumbLink` pour fusionner les styles sur un élément personnalisé (ex. `Link` de Next.js)."}}},render:()=>(0,u.jsx)(l,{children:(0,u.jsxs)(n,{children:[(0,u.jsx)(s,{children:(0,u.jsx)(i,{asChild:!0,children:(0,u.jsx)(`a`,{href:`#`,children:`Home (asChild)`})})}),(0,u.jsx)(c,{}),(0,u.jsx)(s,{children:(0,u.jsx)(o,{children:`Current`})})]})})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Réduit les items intermédiaires du fil d'Ariane en un indicateur d'ellipse pour les chemins de navigation longs."
      }
    }
  },
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Category</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Utilise \`asChild\` sur \`BreadcrumbLink\` pour fusionner les styles sur un élément personnalisé (ex. \`Link\` de Next.js)."
      }
    }
  },
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="#">Home (asChild)</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithEllipsis`,`AsChild`]}))();export{m as AsChild,f as Default,p as WithEllipsis,h as __namedExportsOrder,d as default};