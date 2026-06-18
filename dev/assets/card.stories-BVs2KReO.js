import{i as e}from"./preload-helper-Ce6laLq_.js";import{x as t}from"./iframe-B0lzWL6d.js";import{r as n,t as r}from"./button-BGbzQRMu.js";import{a as i,c as a,i as o,n as s,o as c,r as l,s as u,t as d}from"./card-DYPWPUHa.js";import{n as f,t as p}from"./input-Bxjr8VTw.js";import{n as m,t as h}from"./label-vTs8oYp4.js";var g,_,v,y,b,x,S;e((()=>{n(),a(),f(),m(),g=t(),_={title:`Components/Card`,component:d,parameters:{docs:{description:{component:`Conteneur de contenu avec en-tête structuré (titre, description, emplacement d'action), corps et pied de page.`}}}},v={render:()=>(0,g.jsxs)(d,{className:`w-87.5`,children:[(0,g.jsxs)(c,{children:[(0,g.jsx)(u,{children:`Card Title`}),(0,g.jsx)(o,{children:`Card description text goes here.`})]}),(0,g.jsx)(l,{children:(0,g.jsx)(`p`,{children:`Card content goes here.`})}),(0,g.jsx)(i,{children:(0,g.jsx)(r,{children:`Action`})})]})},y={parameters:{docs:{description:{story:"Utilise l'emplacement `CardAction` pour placer un bouton en haut à droite de l'en-tête, aligné avec le titre."}}},render:()=>(0,g.jsxs)(d,{className:`w-87.5`,children:[(0,g.jsxs)(c,{children:[(0,g.jsx)(u,{children:`Notifications`}),(0,g.jsx)(o,{children:`You have 3 unread messages.`}),(0,g.jsx)(s,{children:(0,g.jsx)(r,{variant:`outline`,size:`sm`,children:`Mark all read`})})]}),(0,g.jsx)(l,{children:(0,g.jsx)(`p`,{children:`Your notification content here.`})})]})},b={render:()=>(0,g.jsxs)(d,{className:`w-87.5`,children:[(0,g.jsxs)(c,{children:[(0,g.jsx)(u,{children:`Create project`}),(0,g.jsx)(o,{children:`Deploy your new project in one-click.`})]}),(0,g.jsx)(l,{children:(0,g.jsx)(`div`,{className:`grid gap-4`,children:(0,g.jsxs)(`div`,{className:`grid gap-2`,children:[(0,g.jsx)(h,{htmlFor:`name`,children:`Name`}),(0,g.jsx)(p,{id:`name`,placeholder:`Name of your project`})]})})}),(0,g.jsxs)(i,{className:`flex justify-between`,children:[(0,g.jsx)(r,{variant:`outline`,children:`Cancel`}),(0,g.jsx)(r,{children:`Deploy`})]})]})},x={render:()=>(0,g.jsxs)(d,{className:`w-87.5`,children:[(0,g.jsx)(c,{children:(0,g.jsx)(u,{children:`Simple Card`})}),(0,g.jsx)(l,{children:(0,g.jsx)(`p`,{children:`A card with just a title and content.`})})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description text goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Utilise l'emplacement \`CardAction\` pour placer un bouton en haut à droite de l'en-tête, aligné avec le titre."
      }
    }
  },
  render: () => <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Your notification content here.</p>
      </CardContent>
    </Card>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name of your project" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-87.5">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>A card with just a title and content.</p>
      </CardContent>
    </Card>
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithAction`,`WithForm`,`Simple`]}))();export{v as Default,x as Simple,y as WithAction,b as WithForm,S as __namedExportsOrder,_ as default};