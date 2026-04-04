import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-ENPEqnHb.js";import{n,t as r}from"./skeleton-BEn_56T0.js";var i,a,o,s,c,l,u,d;e((()=>{n(),i=t(),a={title:`Components/Skeleton`,component:r,parameters:{docs:{description:{component:`Bloc placeholder pulsant pour les états de chargement. Forme et taille contrôlées via className.`}}}},o={args:{className:`h-4 w-[250px]`}},s={args:{className:`size-12 rounded-full`}},c={parameters:{docs:{description:{story:`Compose plusieurs skeletons (cercle + lignes de texte) pour prévisualiser un layout typique de carte ou de profil utilisateur.`}}},render:()=>(0,i.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,i.jsx)(r,{className:`size-12 rounded-full`}),(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(r,{className:`h-4 w-[250px]`}),(0,i.jsx)(r,{className:`h-4 w-[200px]`})]})]})},l={render:()=>(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(r,{className:`h-4 w-full`}),(0,i.jsx)(r,{className:`h-4 w-[80%]`}),(0,i.jsx)(r,{className:`h-4 w-[60%]`})]})},u={parameters:{docs:{description:{story:`Simule un état de chargement de formulaire avec des skeletons label + input et un placeholder de bouton de soumission.`}}},render:()=>(0,i.jsxs)(`div`,{className:`space-y-4`,children:[(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(r,{className:`h-4 w-[100px]`}),(0,i.jsx)(r,{className:`h-9 w-full`})]}),(0,i.jsxs)(`div`,{className:`space-y-2`,children:[(0,i.jsx)(r,{className:`h-4 w-[100px]`}),(0,i.jsx)(r,{className:`h-9 w-full`})]}),(0,i.jsx)(r,{className:`h-9 w-[120px]`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    className: "h-4 w-[250px]"
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    className: "size-12 rounded-full"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Compose plusieurs skeletons (cercle + lignes de texte) pour prévisualiser un layout typique de carte ou de profil utilisateur."
      }
    }
  },
  render: () => <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Simule un état de chargement de formulaire avec des skeletons label + input et un placeholder de bouton de soumission."
      }
    }
  },
  render: () => <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-9 w-[120px]" />
    </div>
}`,...u.parameters?.docs?.source}}},d=[`Default`,`Circle`,`Card`,`TextBlock`,`FormSkeleton`]}))();export{c as Card,s as Circle,o as Default,u as FormSkeleton,l as TextBlock,d as __namedExportsOrder,a as default};