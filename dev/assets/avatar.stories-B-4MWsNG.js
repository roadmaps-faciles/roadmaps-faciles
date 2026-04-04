import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-CP1YPFjh.js";import{B as n,t as r}from"./lucide-react-DNrK8VK6.js";import{a as i,i as a,n as o,o as s,r as c,s as l,t as u}from"./avatar-DhLfLM4m.js";var d,f,p,m,h,g,_,v,y,b,x;e((()=>{r(),l(),d=t(),f={title:`Components/Avatar`,component:u,parameters:{docs:{description:{component:`Avatar utilisateur avec image, initiales en fallback, badge de statut optionnel et empilement en groupe. Disponible en tailles sm, default et lg.`}}}},p={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(s,{src:`https://github.com/shadcn.png`,alt:`@shadcn`}),(0,d.jsx)(c,{children:`CN`})]})},m={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(s,{src:`/broken-image.jpg`,alt:`Broken`}),(0,d.jsx)(c,{children:`AB`})]})},h={render:()=>(0,d.jsx)(u,{size:`default`,children:(0,d.jsx)(c,{children:`MD`})})},g={render:()=>(0,d.jsx)(u,{size:`sm`,children:(0,d.jsx)(c,{children:`SM`})})},_={render:()=>(0,d.jsx)(u,{size:`lg`,children:(0,d.jsx)(c,{children:`LG`})})},v={parameters:{docs:{description:{story:`Superpose un petit badge circulaire (ex. icone de validation) en bas à droite de l'avatar.`}}},render:()=>(0,d.jsxs)(u,{size:`lg`,children:[(0,d.jsx)(c,{children:`AB`}),(0,d.jsx)(o,{children:(0,d.jsx)(n,{})})]})},y={parameters:{docs:{description:{story:`Empile plusieurs avatars avec un espacement négatif et un indicateur de compteur pour le surplus.`}}},render:()=>(0,d.jsxs)(a,{children:[(0,d.jsx)(u,{children:(0,d.jsx)(c,{children:`A`})}),(0,d.jsx)(u,{children:(0,d.jsx)(c,{children:`B`})}),(0,d.jsx)(u,{children:(0,d.jsx)(c,{children:`C`})}),(0,d.jsx)(i,{children:`+5`})]})},b={render:()=>(0,d.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,d.jsx)(u,{size:`sm`,children:(0,d.jsx)(c,{children:`SM`})}),(0,d.jsx)(u,{size:`default`,children:(0,d.jsx)(c,{children:`MD`})}),(0,d.jsx)(u,{size:`lg`,children:(0,d.jsx)(c,{children:`LG`})})]})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="Broken" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar size="default">
      <AvatarFallback>MD</AvatarFallback>
    </Avatar>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar size="sm">
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Avatar size="lg">
      <AvatarFallback>LG</AvatarFallback>
    </Avatar>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Superpose un petit badge circulaire (ex. icone de validation) en bas à droite de l'avatar."
      }
    }
  },
  render: () => <Avatar size="lg">
      <AvatarFallback>AB</AvatarFallback>
      <AvatarBadge>
        <Check />
      </AvatarBadge>
    </Avatar>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Empile plusieurs avatars avec un espacement négatif et un indicateur de compteur pour le surplus."
      }
    }
  },
  render: () => <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>B</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>C</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
}`,...b.parameters?.docs?.source}}},x=[`WithImage`,`Fallback`,`SizeDefault`,`SizeSmall`,`SizeLarge`,`WithBadge`,`Group`,`AllSizes`]}))();export{b as AllSizes,m as Fallback,y as Group,h as SizeDefault,_ as SizeLarge,g as SizeSmall,v as WithBadge,p as WithImage,x as __namedExportsOrder,f as default};