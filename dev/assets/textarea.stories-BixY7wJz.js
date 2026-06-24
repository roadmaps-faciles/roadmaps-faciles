import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{n,t as r}from"./hint-BbLknZ3A.js";import{n as i,t as a}from"./label-DwTbaTT2.js";import{n as o,t as s}from"./textarea-CyV-J0Ic.js";var c,l,u,d,f,p,m,h;e((()=>{n(),i(),o(),c=t(),l={title:`Components/Textarea`,component:s,args:{placeholder:`Type your message here...`},parameters:{docs:{description:{component:"Zone de texte auto-dimensionnante via `field-sizing: content`. Hauteur minimum 64px, avec support de la validation et du mode sombre."}}}},u={},d={render:()=>(0,c.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,c.jsx)(a,{htmlFor:`message`,children:`Votre message`}),(0,c.jsx)(s,{id:`message`,placeholder:`Écrivez votre message ici.`}),(0,c.jsx)(r,{children:`Maximum 500 caractères.`})]})},f={args:{disabled:!0,value:`Disabled textarea`}},p={args:{defaultValue:`This is some default text content that was pre-filled.`}},m={render:()=>(0,c.jsxs)(`div`,{className:`grid w-full max-w-sm gap-1.5`,children:[(0,c.jsx)(a,{htmlFor:`bio`,children:`Biographie`}),(0,c.jsx)(s,{id:`bio`,defaultValue:`x`,"aria-invalid":!0}),(0,c.jsx)(r,{variant:`error`,children:`Le texte doit contenir au moins 10 caractères.`})]})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="message">Votre message</Label>
      <Textarea id="message" placeholder="Écrivez votre message ici." />
      <Hint>Maximum 500 caractères.</Hint>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    value: "Disabled textarea"
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "This is some default text content that was pre-filled."
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="bio">Biographie</Label>
      <Textarea id="bio" defaultValue="x" aria-invalid />
      <Hint variant="error">Le texte doit contenir au moins 10 caractères.</Hint>
    </div>
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithLabel`,`Disabled`,`WithDefaultValue`,`Invalid`]}))();export{u as Default,f as Disabled,m as Invalid,p as WithDefaultValue,d as WithLabel,h as __namedExportsOrder,l as default};