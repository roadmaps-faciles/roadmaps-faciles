import{n as e}from"./chunk-BneVvdWh.js";import{p as t}from"./iframe-ENPEqnHb.js";import{r as n,t as r}from"./button-Dn437qkE.js";import{n as i,t as a}from"./input-K4ktH9wP.js";import{n as o,t as s}from"./label-CeJd9eIO.js";import{a as c,c as l,i as u,l as d,n as f,o as p,r as m,s as h,t as g}from"./sheet-DrbwK9J-.js";var _,v,y,b,x,S,C,w;e((()=>{n(),i(),o(),d(),_=t(),v={title:`Components/Sheet`,component:g,parameters:{docs:{description:{component:`Panneau coulissant (drawer) depuis n'importe quel bord de l'écran. Basé sur Radix Dialog avec overlay et transitions animées.`}}}},y={render:()=>(0,_.jsxs)(g,{children:[(0,_.jsx)(l,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`Open Sheet`})}),(0,_.jsxs)(m,{children:[(0,_.jsxs)(p,{children:[(0,_.jsx)(h,{children:`Edit profile`}),(0,_.jsx)(u,{children:`Make changes to your profile here. Click save when you are done.`})]}),(0,_.jsxs)(`div`,{className:`grid gap-4 p-4`,children:[(0,_.jsxs)(`div`,{className:`grid grid-cols-4 items-center gap-4`,children:[(0,_.jsx)(s,{htmlFor:`sheet-name`,className:`text-right`,children:`Name`}),(0,_.jsx)(a,{id:`sheet-name`,className:`col-span-3`})]}),(0,_.jsxs)(`div`,{className:`grid grid-cols-4 items-center gap-4`,children:[(0,_.jsx)(s,{htmlFor:`sheet-username`,className:`text-right`,children:`Username`}),(0,_.jsx)(a,{id:`sheet-username`,className:`col-span-3`})]})]}),(0,_.jsxs)(c,{children:[(0,_.jsx)(f,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`Cancel`})}),(0,_.jsx)(r,{children:`Save changes`})]})]})]})},b={render:()=>(0,_.jsxs)(g,{children:[(0,_.jsx)(l,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`Open Left`})}),(0,_.jsx)(m,{side:`left`,children:(0,_.jsxs)(p,{children:[(0,_.jsx)(h,{children:`Left Sheet`}),(0,_.jsx)(u,{children:`This sheet opens from the left side.`})]})})]})},x={render:()=>(0,_.jsxs)(g,{children:[(0,_.jsx)(l,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`Open Top`})}),(0,_.jsx)(m,{side:`top`,children:(0,_.jsxs)(p,{children:[(0,_.jsx)(h,{children:`Top Sheet`}),(0,_.jsx)(u,{children:`This sheet opens from the top.`})]})})]})},S={render:()=>(0,_.jsxs)(g,{children:[(0,_.jsx)(l,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`Open Bottom`})}),(0,_.jsx)(m,{side:`bottom`,children:(0,_.jsxs)(p,{children:[(0,_.jsx)(h,{children:`Bottom Sheet`}),(0,_.jsx)(u,{children:`This sheet opens from the bottom.`})]})})]})},C={parameters:{docs:{description:{story:"Masque le bouton X en haut à droite via `showCloseButton={false}`, nécessitant des actions explicites dans le pied de page pour fermer."}}},render:()=>(0,_.jsxs)(g,{children:[(0,_.jsx)(l,{asChild:!0,children:(0,_.jsx)(r,{variant:`outline`,children:`No Close Button`})}),(0,_.jsxs)(m,{showCloseButton:!1,children:[(0,_.jsxs)(p,{children:[(0,_.jsx)(h,{children:`No Close Button`}),(0,_.jsx)(u,{children:`This sheet does not show an X close button.`})]}),(0,_.jsx)(c,{children:(0,_.jsx)(f,{asChild:!0,children:(0,_.jsx)(r,{children:`Done`})})})]})]})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you are done.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 p-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-name" className="text-right">
              Name
            </Label>
            <Input id="sheet-name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sheet-username" className="text-right">
              Username
            </Label>
            <Input id="sheet-username" className="col-span-3" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Left</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Left Sheet</SheetTitle>
          <SheetDescription>This sheet opens from the left side.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Top</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Top Sheet</SheetTitle>
          <SheetDescription>This sheet opens from the top.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Bottom Sheet</SheetTitle>
          <SheetDescription>This sheet opens from the bottom.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Masque le bouton X en haut à droite via \`showCloseButton={false}\`, nécessitant des actions explicites dans le pied de page pour fermer."
      }
    }
  },
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">No Close Button</Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>No Close Button</SheetTitle>
          <SheetDescription>This sheet does not show an X close button.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`SideLeft`,`SideTop`,`SideBottom`,`WithoutCloseButton`]}))();export{y as Default,S as SideBottom,b as SideLeft,x as SideTop,C as WithoutCloseButton,w as __namedExportsOrder,v as default};