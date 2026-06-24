import{i as e,s as t}from"./preload-helper-DLnNNFi6.js";import{t as n}from"./react-CPwbka9z.js";import{t as r}from"./jsx-runtime-G3nxQKZ8.js";import{Et as i,H as a,R as o,t as s}from"./lucide-react-C8VNcfP9.js";import{n as c,r as l,t as u}from"./segmented-control-MjlsV4gG.js";var d,f,p,m,h,g,_,v;e((()=>{s(),d=t(n(),1),l(),f=r(),p={title:`Components/SegmentedControl`,component:u,parameters:{docs:{description:{component:`Bascule exclusive entre options dans un conteneur bordé. L'item actif reçoit le fond primaire. Supporte icones et texte.`}}}},m={render:function(){let[e,t]=(0,d.useState)(`account`);return(0,f.jsxs)(u,{value:e,onValueChange:e=>e&&t(e),children:[(0,f.jsx)(c,{value:`account`,children:`Account`}),(0,f.jsx)(c,{value:`password`,children:`Password`}),(0,f.jsx)(c,{value:`notifications`,children:`Notifications`})]})}},h={parameters:{docs:{description:{story:`Les items peuvent inclure des icones à coté du texte pour un contexte visuel supplémentaire.`}}},render:function(){let[e,t]=(0,d.useState)(`grid`);return(0,f.jsxs)(u,{value:e,onValueChange:e=>e&&t(e),children:[(0,f.jsxs)(c,{value:`grid`,children:[(0,f.jsx)(a,{}),` Grid`]}),(0,f.jsxs)(c,{value:`list`,children:[(0,f.jsx)(o,{}),` List`]}),(0,f.jsxs)(c,{value:`chart`,children:[(0,f.jsx)(i,{}),` Chart`]})]})}},g={parameters:{docs:{description:{story:"Items icone seule pour les layouts compacts. Ajouter un `aria-label` pour l'accessibilité."}}},render:function(){let[e,t]=(0,d.useState)(`grid`);return(0,f.jsxs)(u,{value:e,onValueChange:e=>e&&t(e),children:[(0,f.jsx)(c,{value:`grid`,"aria-label":`Grid view`,children:(0,f.jsx)(a,{})}),(0,f.jsx)(c,{value:`list`,"aria-label":`List view`,children:(0,f.jsx)(o,{})}),(0,f.jsx)(c,{value:`chart`,"aria-label":`Chart view`,children:(0,f.jsx)(i,{})})]})}},_={render:function(){let[e,t]=(0,d.useState)(`active`);return(0,f.jsxs)(u,{value:e,onValueChange:e=>e&&t(e),children:[(0,f.jsx)(c,{value:`active`,children:`Active`}),(0,f.jsx)(c,{value:`disabled`,disabled:!0,children:`Disabled`}),(0,f.jsx)(c,{value:`another`,children:`Another`})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: function DefaultStory() {
    const [value, setValue] = useState("account");
    return <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="account">Account</SegmentedControlItem>
        <SegmentedControlItem value="password">Password</SegmentedControlItem>
        <SegmentedControlItem value="notifications">Notifications</SegmentedControlItem>
      </SegmentedControl>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Les items peuvent inclure des icones à coté du texte pour un contexte visuel supplémentaire."
      }
    }
  },
  render: function WithIconsStory() {
    const [value, setValue] = useState("grid");
    return <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="grid">
          <LayoutGrid /> Grid
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <List /> List
        </SegmentedControlItem>
        <SegmentedControlItem value="chart">
          <BarChart3 /> Chart
        </SegmentedControlItem>
      </SegmentedControl>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Items icone seule pour les layouts compacts. Ajouter un \`aria-label\` pour l'accessibilité."
      }
    }
  },
  render: function IconOnlyStory() {
    const [value, setValue] = useState("grid");
    return <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="grid" aria-label="Grid view">
          <LayoutGrid />
        </SegmentedControlItem>
        <SegmentedControlItem value="list" aria-label="List view">
          <List />
        </SegmentedControlItem>
        <SegmentedControlItem value="chart" aria-label="Chart view">
          <BarChart3 />
        </SegmentedControlItem>
      </SegmentedControl>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: function WithDisabledStory() {
    const [value, setValue] = useState("active");
    return <SegmentedControl value={value} onValueChange={(v: string) => v && setValue(v)}>
        <SegmentedControlItem value="active">Active</SegmentedControlItem>
        <SegmentedControlItem value="disabled" disabled>
          Disabled
        </SegmentedControlItem>
        <SegmentedControlItem value="another">Another</SegmentedControlItem>
      </SegmentedControl>;
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`WithIcons`,`IconOnly`,`WithDisabled`]}))();export{m as Default,g as IconOnly,_ as WithDisabled,h as WithIcons,v as __namedExportsOrder,p as default};