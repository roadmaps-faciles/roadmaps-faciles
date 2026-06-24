import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{r as n,t as r}from"./button-BTiftHaf.js";import{a as i,c as a,i as o,o as s,r as c,s as l,t as u}from"./card-4YBH3sSN.js";import{n as d,t as f}from"./input-BlltYP9O.js";import{n as p,t as m}from"./label-DwTbaTT2.js";import{a as h,i as g,n as _,r as v,t as y}from"./tabs-qYt8RjAh.js";var b,x,S,C,w,T,E,D;e((()=>{n(),a(),d(),p(),h(),b=t(),x={title:`Components/Tabs`,component:y,parameters:{docs:{description:{component:`Interface à onglets avec orientation horizontale ou verticale. Trois variantes : default (pastille sur l'actif), line (indicateur souligné) et segmented (controle contenu).`}}}},S={render:()=>(0,b.jsxs)(y,{defaultValue:`account`,className:`w-100`,children:[(0,b.jsxs)(v,{children:[(0,b.jsx)(g,{value:`account`,children:`Account`}),(0,b.jsx)(g,{value:`password`,children:`Password`}),(0,b.jsx)(g,{value:`notifications`,children:`Notifications`})]}),(0,b.jsx)(_,{value:`account`,children:(0,b.jsxs)(u,{children:[(0,b.jsxs)(s,{children:[(0,b.jsx)(l,{children:`Account`}),(0,b.jsx)(o,{children:`Make changes to your account here.`})]}),(0,b.jsx)(c,{className:`space-y-2`,children:(0,b.jsxs)(`div`,{className:`space-y-1`,children:[(0,b.jsx)(m,{htmlFor:`tab-name`,children:`Name`}),(0,b.jsx)(f,{id:`tab-name`,defaultValue:`Pedro Duarte`})]})}),(0,b.jsx)(i,{children:(0,b.jsx)(r,{children:`Save changes`})})]})}),(0,b.jsx)(_,{value:`password`,children:(0,b.jsxs)(u,{children:[(0,b.jsxs)(s,{children:[(0,b.jsx)(l,{children:`Password`}),(0,b.jsx)(o,{children:`Change your password here.`})]}),(0,b.jsxs)(c,{className:`space-y-2`,children:[(0,b.jsxs)(`div`,{className:`space-y-1`,children:[(0,b.jsx)(m,{htmlFor:`current`,children:`Current password`}),(0,b.jsx)(f,{id:`current`,type:`password`})]}),(0,b.jsxs)(`div`,{className:`space-y-1`,children:[(0,b.jsx)(m,{htmlFor:`new`,children:`New password`}),(0,b.jsx)(f,{id:`new`,type:`password`})]})]}),(0,b.jsx)(i,{children:(0,b.jsx)(r,{children:`Save password`})})]})}),(0,b.jsx)(_,{value:`notifications`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Notification preferences content.`})})]})},C={parameters:{docs:{description:{story:'Utilise `variant="line"` sur `TabsList` pour un fond transparent avec un indicateur souligné sur l\'onglet actif.'}}},render:()=>(0,b.jsxs)(y,{defaultValue:`tab1`,className:`w-100`,children:[(0,b.jsxs)(v,{variant:`line`,children:[(0,b.jsx)(g,{value:`tab1`,children:`Overview`}),(0,b.jsx)(g,{value:`tab2`,children:`Analytics`}),(0,b.jsx)(g,{value:`tab3`,children:`Reports`})]}),(0,b.jsx)(_,{value:`tab1`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Overview content.`})}),(0,b.jsx)(_,{value:`tab2`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Analytics content.`})}),(0,b.jsx)(_,{value:`tab3`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Reports content.`})})]})},w={parameters:{docs:{description:{story:'Passe en layout `orientation="vertical"` avec les onglets empilés à gauche et le contenu à droite.'}}},render:()=>(0,b.jsxs)(y,{defaultValue:`general`,orientation:`vertical`,className:`w-100`,children:[(0,b.jsxs)(v,{children:[(0,b.jsx)(g,{value:`general`,children:`General`}),(0,b.jsx)(g,{value:`security`,children:`Security`}),(0,b.jsx)(g,{value:`notifications`,children:`Notifications`})]}),(0,b.jsx)(_,{value:`general`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`General settings content.`})}),(0,b.jsx)(_,{value:`security`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Security settings content.`})}),(0,b.jsx)(_,{value:`notifications`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Notification settings content.`})})]})},T={parameters:{docs:{description:{story:`Combine l'orientation verticale avec la variante line, affichant une barre d'indicateur actif sur le coté gauche.`}}},render:()=>(0,b.jsxs)(y,{defaultValue:`general`,orientation:`vertical`,className:`w-100`,children:[(0,b.jsxs)(v,{variant:`line`,children:[(0,b.jsx)(g,{value:`general`,children:`General`}),(0,b.jsx)(g,{value:`security`,children:`Security`}),(0,b.jsx)(g,{value:`notifications`,children:`Notifications`})]}),(0,b.jsx)(_,{value:`general`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`General settings content.`})}),(0,b.jsx)(_,{value:`security`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Security settings content.`})}),(0,b.jsx)(_,{value:`notifications`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Notification settings content.`})})]})},E={render:()=>(0,b.jsxs)(y,{defaultValue:`tab1`,className:`w-100`,children:[(0,b.jsxs)(v,{children:[(0,b.jsx)(g,{value:`tab1`,children:`Active`}),(0,b.jsx)(g,{value:`tab2`,disabled:!0,children:`Disabled`}),(0,b.jsx)(g,{value:`tab3`,children:`Another`})]}),(0,b.jsx)(_,{value:`tab1`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Active tab content.`})}),(0,b.jsx)(_,{value:`tab3`,children:(0,b.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Another tab content.`})})]})},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="account" className="w-100">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Make changes to your account here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="tab-name">Name</Label>
              <Input id="tab-name" defaultValue="Pedro Duarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification preferences content.</p>
      </TabsContent>
    </Tabs>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Utilise \`variant="line"\` sur \`TabsList\` pour un fond transparent avec un indicateur souligné sur l\\'onglet actif.'
      }
    }
  },
  render: () => <Tabs defaultValue="tab1" className="w-100">
      <TabsList variant="line">
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-muted-foreground text-sm">Overview content.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-muted-foreground text-sm">Analytics content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-muted-foreground text-sm">Reports content.</p>
      </TabsContent>
    </Tabs>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'Passe en layout \`orientation="vertical"\` avec les onglets empilés à gauche et le contenu à droite.'
      }
    }
  },
  render: () => <Tabs defaultValue="general" orientation="vertical" className="w-100">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-muted-foreground text-sm">General settings content.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-muted-foreground text-sm">Security settings content.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification settings content.</p>
      </TabsContent>
    </Tabs>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Combine l'orientation verticale avec la variante line, affichant une barre d'indicateur actif sur le coté gauche."
      }
    }
  },
  render: () => <Tabs defaultValue="general" orientation="vertical" className="w-100">
      <TabsList variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-muted-foreground text-sm">General settings content.</p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-muted-foreground text-sm">Security settings content.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-muted-foreground text-sm">Notification settings content.</p>
      </TabsContent>
    </Tabs>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="tab1" className="w-100">
      <TabsList>
        <TabsTrigger value="tab1">Active</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-muted-foreground text-sm">Active tab content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-muted-foreground text-sm">Another tab content.</p>
      </TabsContent>
    </Tabs>
}`,...E.parameters?.docs?.source}}},D=[`Default`,`LineVariant`,`Vertical`,`VerticalLine`,`DisabledTab`]}))();export{S as Default,E as DisabledTab,C as LineVariant,w as Vertical,T as VerticalLine,D as __namedExportsOrder,x as default};