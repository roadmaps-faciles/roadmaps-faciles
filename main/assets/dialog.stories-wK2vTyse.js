import{i as e}from"./preload-helper-B_TrffEr.js";import{t}from"./jsx-runtime-IKcXo5NR.js";import{r as n,t as r}from"./button-F-D0STVv.js";import{a as i,c as a,i as o,n as s,o as c,r as l,s as u,t as d}from"./dialog-N5z-H3aR.js";import{n as f,t as p}from"./input-BZcW1AD6.js";import{n as m,t as h}from"./label-Cps1CC6V.js";var g,_,v,y,b,x,S;e((()=>{n(),a(),f(),m(),g=t(),_={title:`Components/Dialog`,component:d,parameters:{docs:{description:{component:`Dialogue modal avec overlay, animation d'ouverture/fermeture et bouton de fermeture configurable. Supporte un layout en-tête, corps et pied de page.`}}}},v={render:()=>(0,g.jsxs)(d,{children:[(0,g.jsx)(u,{asChild:!0,children:(0,g.jsx)(r,{variant:`outline`,children:`Open Dialog`})}),(0,g.jsxs)(s,{children:[(0,g.jsxs)(i,{children:[(0,g.jsx)(c,{children:`Dialog Title`}),(0,g.jsx)(l,{children:`Dialog description text.`})]}),(0,g.jsx)(`p`,{children:`Dialog body content goes here.`}),(0,g.jsx)(o,{children:(0,g.jsx)(r,{children:`Save`})})]})]})},y={render:()=>(0,g.jsxs)(d,{children:[(0,g.jsx)(u,{asChild:!0,children:(0,g.jsx)(r,{children:`Edit Profile`})}),(0,g.jsxs)(s,{children:[(0,g.jsxs)(i,{children:[(0,g.jsx)(c,{children:`Edit profile`}),(0,g.jsx)(l,{children:`Make changes to your profile here. Click save when you are done.`})]}),(0,g.jsxs)(`div`,{className:`grid gap-4 py-4`,children:[(0,g.jsxs)(`div`,{className:`grid grid-cols-4 items-center gap-4`,children:[(0,g.jsx)(h,{htmlFor:`name`,className:`text-right`,children:`Name`}),(0,g.jsx)(p,{id:`name`,defaultValue:`Pedro Duarte`,className:`col-span-3`})]}),(0,g.jsxs)(`div`,{className:`grid grid-cols-4 items-center gap-4`,children:[(0,g.jsx)(h,{htmlFor:`username`,className:`text-right`,children:`Username`}),(0,g.jsx)(p,{id:`username`,defaultValue:`@peduarte`,className:`col-span-3`})]})]}),(0,g.jsx)(o,{children:(0,g.jsx)(r,{type:`submit`,children:`Save changes`})})]})]})},b={parameters:{docs:{description:{story:"Masque le bouton X en haut à droite via `showCloseButton={false}` sur `DialogContent`, la fermeture se fait par les actions du pied de page."}}},render:()=>(0,g.jsxs)(d,{children:[(0,g.jsx)(u,{asChild:!0,children:(0,g.jsx)(r,{variant:`outline`,children:`No Close Button`})}),(0,g.jsxs)(s,{showCloseButton:!1,children:[(0,g.jsxs)(i,{children:[(0,g.jsx)(c,{children:`No Close Button`}),(0,g.jsx)(l,{children:`This dialog has no X close button.`})]}),(0,g.jsx)(o,{showCloseButton:!0,children:(0,g.jsx)(r,{children:`Confirm`})})]})]})},x={parameters:{docs:{description:{story:'Ajoute un bouton "Fermer" outline dans le `DialogFooter` via la prop `showCloseButton`, à coté des actions personnalisées.'}}},render:()=>(0,g.jsxs)(d,{children:[(0,g.jsx)(u,{asChild:!0,children:(0,g.jsx)(r,{variant:`outline`,children:`Footer Close`})}),(0,g.jsxs)(s,{children:[(0,g.jsxs)(i,{children:[(0,g.jsx)(c,{children:`Confirmation`}),(0,g.jsx)(l,{children:`Are you sure you want to proceed?`})]}),(0,g.jsx)(o,{showCloseButton:!0,children:(0,g.jsx)(r,{children:`Confirm`})})]})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description text.</DialogDescription>
        </DialogHeader>
        <p>Dialog body content goes here.</p>
        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you are done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Masque le bouton X en haut à droite via \`showCloseButton={false}\` sur \`DialogContent\`, la fermeture se fait par les actions du pied de page."
      }
    }
  },
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">No Close Button</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No Close Button</DialogTitle>
          <DialogDescription>This dialog has no X close button.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Ajoute un bouton "Fermer" outline dans le \`DialogFooter\` via la prop \`showCloseButton\`, à coté des actions personnalisées.'
      }
    }
  },
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Footer Close</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogDescription>Are you sure you want to proceed?</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithForm`,`WithoutCloseButton`,`WithFooterClose`]}))();export{v as Default,x as WithFooterClose,y as WithForm,b as WithoutCloseButton,S as __namedExportsOrder,_ as default};