import{i as e}from"./preload-helper-Ce6laLq_.js";import{x as t}from"./iframe-B0lzWL6d.js";import{a as n,c as r,i,l as a,n as o,o as s,r as c,s as l,t as u}from"./table-Dg1ZQT1H.js";var d,f,p,m,h,g,_;e((()=>{a(),d=t(),f={title:`Components/Table`,component:u,parameters:{docs:{description:{component:`Tableau de données responsive avec conteneur à défilement horizontal, lignes surlignées au survol et caption/footer optionnels.`}}}},p=[{invoice:`INV001`,status:`Paid`,method:`Credit Card`,amount:`$250.00`},{invoice:`INV002`,status:`Pending`,method:`PayPal`,amount:`$150.00`},{invoice:`INV003`,status:`Unpaid`,method:`Bank Transfer`,amount:`$350.00`},{invoice:`INV004`,status:`Paid`,method:`Credit Card`,amount:`$450.00`},{invoice:`INV005`,status:`Paid`,method:`PayPal`,amount:`$550.00`}],m={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(c,{children:`A list of your recent invoices.`}),(0,d.jsx)(l,{children:(0,d.jsxs)(r,{children:[(0,d.jsx)(s,{className:`w-25`,children:`Invoice`}),(0,d.jsx)(s,{children:`Status`}),(0,d.jsx)(s,{children:`Method`}),(0,d.jsx)(s,{className:`text-right`,children:`Amount`})]})}),(0,d.jsx)(o,{children:p.map(e=>(0,d.jsxs)(r,{children:[(0,d.jsx)(i,{className:`font-medium`,children:e.invoice}),(0,d.jsx)(i,{children:e.status}),(0,d.jsx)(i,{children:e.method}),(0,d.jsx)(i,{className:`text-right`,children:e.amount})]},e.invoice))}),(0,d.jsx)(n,{children:(0,d.jsxs)(r,{children:[(0,d.jsx)(i,{colSpan:3,children:`Total`}),(0,d.jsx)(i,{className:`text-right`,children:`$1,750.00`})]})})]})},h={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(l,{children:(0,d.jsxs)(r,{children:[(0,d.jsx)(s,{children:`Name`}),(0,d.jsx)(s,{children:`Email`}),(0,d.jsx)(s,{children:`Role`})]})}),(0,d.jsxs)(o,{children:[(0,d.jsxs)(r,{children:[(0,d.jsx)(i,{children:`Alice`}),(0,d.jsx)(i,{children:`alice@example.com`}),(0,d.jsx)(i,{children:`Admin`})]}),(0,d.jsxs)(r,{children:[(0,d.jsx)(i,{children:`Bob`}),(0,d.jsx)(i,{children:`bob@example.com`}),(0,d.jsx)(i,{children:`User`})]})]})]})},g={render:()=>(0,d.jsxs)(u,{children:[(0,d.jsx)(l,{children:(0,d.jsxs)(r,{children:[(0,d.jsx)(s,{children:`Name`}),(0,d.jsx)(s,{children:`Status`})]})}),(0,d.jsx)(o,{children:(0,d.jsx)(r,{children:(0,d.jsx)(i,{colSpan:2,className:`text-muted-foreground text-center`,children:`No results.`})})})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(invoice => <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>)}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$1,750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="text-muted-foreground text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
}`,...g.parameters?.docs?.source}}},_=[`Default`,`Simple`,`Empty`]}))();export{m as Default,g as Empty,h as Simple,_ as __namedExportsOrder,f as default};