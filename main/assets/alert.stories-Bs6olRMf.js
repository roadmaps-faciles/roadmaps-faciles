import{i as e}from"./preload-helper-B_TrffEr.js";import{t}from"./jsx-runtime-IKcXo5NR.js";import{K as n,ft as r,mt as i,t as a,u as o}from"./lucide-react-ClE0FCTG.js";import{i as s,n as c,r as l,t as u}from"./alert-BiDgguXv.js";var d,f,p,m,h,g,_,v,y;e((()=>{a(),s(),d=t(),f={title:`Components/Alert`,component:u,parameters:{docs:{description:{component:`Bandeau d'alerte contextuel avec code couleur par variante (default, destructive, success, warning).`}}}},p={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(n,{className:`size-4`}),(0,d.jsx)(l,{children:`Default Alert`}),(0,d.jsx)(c,{children:`This is a default alert with an informational message.`})]})},m={render:()=>(0,d.jsxs)(u,{variant:`destructive`,children:[(0,d.jsx)(i,{className:`size-4`}),(0,d.jsx)(l,{children:`Error`}),(0,d.jsx)(c,{children:`Something went wrong. Please try again later.`})]})},h={render:()=>(0,d.jsxs)(u,{variant:`success`,children:[(0,d.jsx)(r,{className:`size-4`}),(0,d.jsx)(l,{children:`Success`}),(0,d.jsx)(c,{children:`Your changes have been saved successfully.`})]})},g={render:()=>(0,d.jsxs)(u,{variant:`warning`,children:[(0,d.jsx)(o,{className:`size-4`}),(0,d.jsx)(l,{children:`Warning`}),(0,d.jsx)(c,{children:`This action cannot be undone.`})]})},_={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(l,{children:`No Icon`}),(0,d.jsx)(c,{children:`This alert has no icon.`})]})},v={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(n,{className:`size-4`}),(0,d.jsx)(l,{children:`Title only alert`})]})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>
      <Info className="size-4" />
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>This is a default alert with an informational message.</AlertDescription>
    </Alert>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
    </Alert>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="success">
      <CheckCircle2 className="size-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your changes have been saved successfully.</AlertDescription>
    </Alert>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Alert variant="warning">
      <TriangleAlert className="size-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>This action cannot be undone.</AlertDescription>
    </Alert>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>
      <AlertTitle>No Icon</AlertTitle>
      <AlertDescription>This alert has no icon.</AlertDescription>
    </Alert>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Alert>
      <Info className="size-4" />
      <AlertTitle>Title only alert</AlertTitle>
    </Alert>
}`,...v.parameters?.docs?.source}}},y=[`Default`,`Destructive`,`Success`,`Warning`,`WithoutIcon`,`TitleOnly`]}))();export{p as Default,m as Destructive,h as Success,v as TitleOnly,g as Warning,_ as WithoutIcon,y as __namedExportsOrder,f as default};