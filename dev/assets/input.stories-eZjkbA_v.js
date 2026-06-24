import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{M as n,b as r,t as i}from"./lucide-react-C8VNcfP9.js";import{n as a,t as o}from"./hint-BbLknZ3A.js";import{n as s,t as c}from"./input-BlltYP9O.js";import{n as l,t as u}from"./label-DwTbaTT2.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{i(),a(),s(),l(),d=t(),f={title:`Components/Input`,component:c,args:{placeholder:`Type something...`},parameters:{docs:{description:{component:`Champ de saisie stylisé avec support de l'upload de fichiers, anneau de focus, état de validation et gestion du mode sombre.`}}}},p={},m={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`email`,children:`Email`}),(0,d.jsx)(c,{type:`email`,id:`email`,placeholder:`Email`})]})},h={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`project`,children:`Nom du projet`}),(0,d.jsx)(c,{id:`project`,defaultValue:`Roadmap Q4`}),(0,d.jsx)(o,{children:`Ce champ a le focus actif.`})]})},g={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`email-icon`,children:`Email`}),(0,d.jsxs)(`div`,{className:`relative`,children:[(0,d.jsx)(n,{className:`text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2`}),(0,d.jsx)(c,{id:`email-icon`,placeholder:`user@exemple.com`,className:`pl-9`})]}),(0,d.jsx)(o,{children:`Champ avec icône descriptive.`})]})},_={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`password-err`,children:`Mot de passe`}),(0,d.jsx)(c,{id:`password-err`,type:`password`,defaultValue:`badpassword`,"aria-invalid":!0}),(0,d.jsx)(o,{variant:`error`,children:`Format d'email invalide`})]})},v={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`deadline`,children:`Date limite`}),(0,d.jsx)(c,{id:`deadline`,disabled:!0,defaultValue:`31/12/2023`}),(0,d.jsx)(o,{children:`Modification non autorisée.`})]})},y={render:()=>(0,d.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`search`,children:`Recherche`}),(0,d.jsxs)(`div`,{className:`relative`,children:[(0,d.jsx)(r,{className:`text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2`}),(0,d.jsx)(c,{id:`search`,type:`search`,placeholder:`Rechercher...`,className:`pl-9`})]})]})},b={args:{defaultValue:`Default value`}},x={args:{type:`password`,placeholder:`Enter password`}},S={args:{type:`file`}},C={render:()=>(0,d.jsxs)(`div`,{className:`grid max-w-2xl grid-cols-2 gap-6`,children:[(0,d.jsxs)(`div`,{className:`grid gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`ff-name`,children:`Nom du projet (Focus)`}),(0,d.jsx)(c,{id:`ff-name`,defaultValue:`Roadmap Q4`}),(0,d.jsx)(o,{children:`Ce champ a le focus actif.`})]}),(0,d.jsxs)(`div`,{className:`grid gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`ff-email`,children:`Email (Icône)`}),(0,d.jsxs)(`div`,{className:`relative`,children:[(0,d.jsx)(n,{className:`text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2`}),(0,d.jsx)(c,{id:`ff-email`,placeholder:`user@exemple.com`,className:`pl-9`})]}),(0,d.jsx)(o,{children:`Champ avec icône descriptive.`})]}),(0,d.jsxs)(`div`,{className:`grid gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`ff-pass`,children:`Mot de passe (Erreur)`}),(0,d.jsx)(c,{id:`ff-pass`,type:`password`,defaultValue:`badpassword`,"aria-invalid":!0}),(0,d.jsx)(o,{variant:`error`,children:`Format d'email invalide`})]}),(0,d.jsxs)(`div`,{className:`grid gap-1.5`,children:[(0,d.jsx)(u,{htmlFor:`ff-date`,children:`Date limite (Désactivé)`}),(0,d.jsx)(c,{id:`ff-date`,disabled:!0,defaultValue:`31/12/2023`}),(0,d.jsx)(o,{children:`Modification non autorisée.`})]})]})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="project">Nom du projet</Label>
      <Input id="project" defaultValue="Roadmap Q4" />
      <Hint>Ce champ a le focus actif.</Hint>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email-icon">Email</Label>
      <div className="relative">
        <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id="email-icon" placeholder="user@exemple.com" className="pl-9" />
      </div>
      <Hint>Champ avec icône descriptive.</Hint>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="password-err">Mot de passe</Label>
      <Input id="password-err" type="password" defaultValue="badpassword" aria-invalid />
      <Hint variant="error">Format d'email invalide</Hint>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="deadline">Date limite</Label>
      <Input id="deadline" disabled defaultValue="31/12/2023" />
      <Hint>Modification non autorisée.</Hint>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="search">Recherche</Label>
      <div className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id="search" type="search" placeholder="Rechercher..." className="pl-9" />
      </div>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "Default value"
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    type: "password",
    placeholder: "Enter password"
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    type: "file"
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid max-w-2xl grid-cols-2 gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="ff-name">Nom du projet (Focus)</Label>
        <Input id="ff-name" defaultValue="Roadmap Q4" />
        <Hint>Ce champ a le focus actif.</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-email">Email (Icône)</Label>
        <div className="relative">
          <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input id="ff-email" placeholder="user@exemple.com" className="pl-9" />
        </div>
        <Hint>Champ avec icône descriptive.</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-pass">Mot de passe (Erreur)</Label>
        <Input id="ff-pass" type="password" defaultValue="badpassword" aria-invalid />
        <Hint variant="error">Format d'email invalide</Hint>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="ff-date">Date limite (Désactivé)</Label>
        <Input id="ff-date" disabled defaultValue="31/12/2023" />
        <Hint>Modification non autorisée.</Hint>
      </div>
    </div>
}`,...C.parameters?.docs?.source},description:{story:`Composition complète : label + input avec icône + select + textarea + hints. Reproduit le pattern Stitch.`,...C.parameters?.docs?.description}}},w=[`Default`,`WithLabel`,`WithHint`,`WithIcon`,`Invalid`,`Disabled`,`Search`,`WithDefaultValue`,`Password`,`File`,`FormFields`]}))();export{p as Default,v as Disabled,S as File,C as FormFields,_ as Invalid,x as Password,y as Search,b as WithDefaultValue,h as WithHint,g as WithIcon,m as WithLabel,w as __namedExportsOrder,f as default};