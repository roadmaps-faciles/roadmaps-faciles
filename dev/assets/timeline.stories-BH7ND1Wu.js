import{i as e}from"./preload-helper-DLnNNFi6.js";import{t}from"./jsx-runtime-G3nxQKZ8.js";import{A as n,f as r,g as i,mt as a,t as o,ut as s,wt as c}from"./lucide-react-C8VNcfP9.js";import{r as l,s as u,t as d}from"./avatar-BfCGDBe9.js";import{n as f,t as p}from"./badge-CKg1PEb6.js";import{c as m,r as h,t as g}from"./card-4YBH3sSN.js";import{a as _,c as v,i as y,l as b,n as x,o as S,r as C,s as w,t as T}from"./timeline-CTOwhjb0.js";var E,D,O,k,A,j,M,N,P,F;e((()=>{o(),u(),f(),m(),b(),E=t(),D={title:`Components/Timeline`,component:T,parameters:{docs:{description:{component:"Timeline verticale pour afficher une séquence d'événements. Compound component : `Timeline` > `TimelineItem` > `TimelineSeparator` (dot + connecteur) + `TimelineContent`."}}}},O={render:()=>(0,E.jsxs)(T,{className:`max-w-md`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Idée soumise`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Il y a 3 jours`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`En cours d'étude`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Il y a 2 jours`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{})}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Planifié`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Aujourd'hui`})]})]})]})},k={parameters:{docs:{description:{story:`Story interactive - utilise les controls Storybook pour configurer les props des sous-composants (dot variant/size, connector variant, sub-connector indent).`}}},argTypes:{dotVariant:{control:`select`,options:[`default`,`outline`,`success`,`warning`,`destructive`,`muted`],description:`TimelineDot variant`,table:{category:`TimelineDot`}},dotSize:{control:`select`,options:[`sm`,`default`,`lg`,`icon`],description:`TimelineDot size`,table:{category:`TimelineDot`}},connectorVariant:{control:`select`,options:[`connected`,`spaced`],description:`TimelineConnector variant`,table:{category:`TimelineConnector`}},subIndent:{control:`select`,options:[`sm`,`default`,`lg`],description:`TimelineSubConnector indent`,table:{category:`TimelineSubConnector`}}},args:{dotVariant:`default`,dotSize:`icon`,connectorVariant:`connected`,subIndent:`default`},render:e=>{let{dotVariant:t,dotSize:r,connectorVariant:a,subIndent:o}=e;return(0,E.jsxs)(T,{className:`max-w-xl`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:t,size:r,children:r===`icon`&&(0,E.jsx)(n,{className:`size-4`})}),(0,E.jsx)(x,{variant:a})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 10 minutes`}),(0,E.jsx)(g,{className:`mt-1.5`,children:(0,E.jsxs)(h,{className:`p-4`,children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Commentaire principal`}),(0,E.jsx)(`p`,{className:`mt-1 text-sm`,children:`Avec du contenu détaillé et des réponses.`})]})}),(0,E.jsxs)(w,{indent:o,children:[(0,E.jsx)(v,{children:(0,E.jsx)(g,{children:(0,E.jsxs)(h,{className:`p-3`,children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Première réponse`}),(0,E.jsx)(`p`,{className:`mt-1 text-sm`,children:`Bonne idée !`})]})})}),(0,E.jsx)(v,{children:(0,E.jsx)(g,{children:(0,E.jsxs)(h,{className:`p-3`,children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Deuxième réponse`}),(0,E.jsx)(`p`,{className:`mt-1 text-sm`,children:`Merci, noté pour la v2.`})]})})})]})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:t,size:r,children:r===`icon`&&(0,E.jsx)(c,{className:`size-4`})}),(0,E.jsx)(x,{variant:a})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 2 heures`}),(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Événement simple`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{variant:t,size:r,children:r===`icon`&&(0,E.jsx)(i,{className:`size-4`})})}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 3 jours`}),(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Dernier événement`})]})]})]})}},A={name:`Dot Variants`,render:()=>(0,E.jsxs)(T,{className:`max-w-md`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`success`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Terminé`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`warning`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`En attente`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`destructive`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Rejeté`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`outline`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Brouillon`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{variant:`muted`})}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Archivé`})})]})]})},j={render:()=>(0,E.jsxs)(T,{className:`max-w-md`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`success`,size:`icon`,children:(0,E.jsx)(c,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Déployé en production`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Il y a 1 heure`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`default`,size:`icon`,children:(0,E.jsx)(n,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Nouveau commentaire`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Il y a 3 heures`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`warning`,size:`icon`,children:(0,E.jsx)(a,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Signalé pour modération`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Hier`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{variant:`outline`,size:`icon`,children:(0,E.jsx)(s,{className:`size-4`})})}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Idée soumise`}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`Il y a 3 jours`})]})]})]})},M={name:`Post Activity (Real-World)`,parameters:{docs:{description:{story:`Exemple réaliste simulant l'historique d'activité d'un post : commentaires avec replies, changements de statut avec badge, votes agrégés, et création du post.`}}},render:()=>(0,E.jsxs)(T,{className:`max-w-xl`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`default`,size:`icon`,children:(0,E.jsx)(n,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 10 minutes`}),(0,E.jsx)(g,{className:`mt-1.5`,children:(0,E.jsxs)(h,{className:`p-4`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(d,{className:`size-8`,children:(0,E.jsx)(l,{children:`LS`})}),(0,E.jsx)(`span`,{className:`text-sm font-medium`,children:`Lilian Saget-Lethias`}),(0,E.jsx)(p,{variant:`destructive`,className:`text-[10px]`,children:`Propriétaire`}),(0,E.jsx)(p,{variant:`secondary`,className:`text-[10px]`,children:`Auteur`})]}),(0,E.jsx)(`p`,{className:`mt-2 text-sm`,children:`Commentaire principal avec du contenu détaillé.`}),(0,E.jsxs)(`div`,{className:`text-muted-foreground mt-2 flex items-center gap-3 text-xs`,children:[(0,E.jsx)(`span`,{children:`04/03/2026 20:33`}),(0,E.jsx)(`span`,{children:`2 réponse(s)`})]})]})}),(0,E.jsxs)(w,{children:[(0,E.jsx)(v,{children:(0,E.jsx)(g,{children:(0,E.jsxs)(h,{className:`p-3`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(d,{className:`size-7`,children:(0,E.jsx)(l,{className:`text-xs`,children:`ML`})}),(0,E.jsx)(`span`,{className:`text-sm font-medium`,children:`Marie Leroy`})]}),(0,E.jsx)(`p`,{className:`mt-1.5 text-sm`,children:`Bonne idée ! +1 pour le filtre par date.`})]})})}),(0,E.jsx)(v,{children:(0,E.jsx)(g,{children:(0,E.jsxs)(h,{className:`p-3`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(d,{className:`size-7`,children:(0,E.jsx)(l,{className:`text-xs`,children:`LS`})}),(0,E.jsx)(`span`,{className:`text-sm font-medium`,children:`Lilian Saget-Lethias`}),(0,E.jsx)(p,{variant:`secondary`,className:`text-[10px]`,children:`Auteur`})]}),(0,E.jsx)(`p`,{className:`mt-1.5 text-sm`,children:`Merci, je note ça pour la v2 !`})]})})})]})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`success`,size:`icon`,children:(0,E.jsx)(c,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 2 heures`}),(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(`p`,{className:`text-sm font-semibold`,children:`Statut changé`}),(0,E.jsx)(p,{variant:`success`,children:`Terminé`})]}),(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`par Admin`})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{variant:`muted`,size:`icon`,children:(0,E.jsx)(r,{className:`size-4`})}),(0,E.jsx)(x,{})]}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 1 jour`}),(0,E.jsxs)(`p`,{className:`text-sm`,children:[(0,E.jsx)(`span`,{className:`font-semibold`,children:`3`}),` personnes ont voté`]})]})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{variant:`outline`,size:`icon`,children:(0,E.jsx)(i,{className:`size-4`})})}),(0,E.jsxs)(C,{children:[(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`il y a 3 jours`}),(0,E.jsx)(`p`,{className:`text-sm font-medium`,children:`Jean a créé le post`})]})]})]})},N={name:`Dot Sizes`,render:()=>(0,E.jsxs)(T,{className:`max-w-md`,children:[(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`sm`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm`,children:`Small (8px)`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`default`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm`,children:`Default (12px)`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`lg`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm`,children:`Large (16px)`})})]}),(0,E.jsxs)(_,{children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{size:`icon`,children:(0,E.jsx)(i,{className:`size-4`})})}),(0,E.jsx)(C,{children:(0,E.jsx)(`p`,{className:`text-sm`,children:`Icon (32px)`})})]})]})},P={name:`Compact (Small Dots)`,parameters:{docs:{description:{story:`Version compacte avec des petits dots, idéale pour les changelog ou les logs simples.`}}},render:()=>(0,E.jsxs)(T,{className:`max-w-sm`,children:[(0,E.jsxs)(_,{className:`pb-4`,children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`sm`,variant:`success`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{className:`pt-0`,children:(0,E.jsx)(`p`,{className:`text-xs font-medium`,children:`v2.4.0 déployé`})})]}),(0,E.jsxs)(_,{className:`pb-4`,children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`sm`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{className:`pt-0`,children:(0,E.jsx)(`p`,{className:`text-xs font-medium`,children:`Fix pagination board`})})]}),(0,E.jsxs)(_,{className:`pb-4`,children:[(0,E.jsxs)(S,{children:[(0,E.jsx)(y,{size:`sm`}),(0,E.jsx)(x,{})]}),(0,E.jsx)(C,{className:`pt-0`,children:(0,E.jsx)(`p`,{className:`text-xs font-medium`,children:`Migration Prisma 7`})})]}),(0,E.jsxs)(_,{className:`pb-4`,children:[(0,E.jsx)(S,{children:(0,E.jsx)(y,{size:`sm`,variant:`muted`})}),(0,E.jsx)(C,{className:`pt-0`,children:(0,E.jsx)(`p`,{className:`text-muted-foreground text-xs`,children:`3 commits précédents...`})})]})]})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Idée soumise</p>
          <p className="text-muted-foreground text-xs">Il y a 3 jours</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">En cours d'étude</p>
          <p className="text-muted-foreground text-xs">Il y a 2 jours</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Planifié</p>
          <p className="text-muted-foreground text-xs">Aujourd'hui</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Story interactive - utilise les controls Storybook pour configurer les props des sous-composants (dot variant/size, connector variant, sub-connector indent)."
      }
    }
  },
  argTypes: {
    // @ts-expect-error -- Custom args, not real Timeline props
    dotVariant: {
      control: "select",
      options: ["default", "outline", "success", "warning", "destructive", "muted"],
      description: "TimelineDot variant",
      table: {
        category: "TimelineDot"
      }
    },
    dotSize: {
      control: "select",
      options: ["sm", "default", "lg", "icon"],
      description: "TimelineDot size",
      table: {
        category: "TimelineDot"
      }
    },
    connectorVariant: {
      control: "select",
      options: ["connected", "spaced"],
      description: "TimelineConnector variant",
      table: {
        category: "TimelineConnector"
      }
    },
    subIndent: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "TimelineSubConnector indent",
      table: {
        category: "TimelineSubConnector"
      }
    }
  },
  args: {
    // @ts-expect-error -- Custom args
    dotVariant: "default",
    dotSize: "icon",
    connectorVariant: "connected",
    subIndent: "default"
  },
  render: args => {
    const {
      dotVariant,
      dotSize,
      connectorVariant,
      subIndent
    } = args as unknown as {
      dotVariant: "default" | "destructive" | "muted" | "outline" | "success" | "warning";
      dotSize: "default" | "icon" | "lg" | "sm";
      connectorVariant: "connected" | "spaced";
      subIndent: "default" | "lg" | "sm";
    };
    return <Timeline className="max-w-xl">
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <MessageSquareIcon className="size-4" />}
            </TimelineDot>
            <TimelineConnector variant={connectorVariant} />
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 10 minutes</p>
            <Card className="mt-1.5">
              <CardContent className="p-4">
                <p className="text-sm font-medium">Commentaire principal</p>
                <p className="mt-1 text-sm">Avec du contenu détaillé et des réponses.</p>
              </CardContent>
            </Card>
            <TimelineSubConnector indent={subIndent}>
              <TimelineSubItem>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">Première réponse</p>
                    <p className="mt-1 text-sm">Bonne idée !</p>
                  </CardContent>
                </Card>
              </TimelineSubItem>
              <TimelineSubItem>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">Deuxième réponse</p>
                    <p className="mt-1 text-sm">Merci, noté pour la v2.</p>
                  </CardContent>
                </Card>
              </TimelineSubItem>
            </TimelineSubConnector>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <CheckIcon className="size-4" />}
            </TimelineDot>
            <TimelineConnector variant={connectorVariant} />
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 2 heures</p>
            <p className="text-sm font-medium">Événement simple</p>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot variant={dotVariant} size={dotSize}>
              {dotSize === "icon" && <StarIcon className="size-4" />}
            </TimelineDot>
          </TimelineSeparator>
          <TimelineContent>
            <p className="text-muted-foreground text-xs">il y a 3 jours</p>
            <p className="text-sm font-medium">Dernier événement</p>
          </TimelineContent>
        </TimelineItem>
      </Timeline>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "Dot Variants",
  render: () => <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Terminé</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="warning" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">En attente</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="destructive" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Rejeté</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Brouillon</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="muted" />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Archivé</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" size="icon">
            <CheckIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Déployé en production</p>
          <p className="text-muted-foreground text-xs">Il y a 1 heure</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="default" size="icon">
            <MessageSquareIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Nouveau commentaire</p>
          <p className="text-muted-foreground text-xs">Il y a 3 heures</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="warning" size="icon">
            <CircleAlertIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Signalé pour modération</p>
          <p className="text-muted-foreground text-xs">Hier</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" size="icon">
            <CircleDotIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm font-medium">Idée soumise</p>
          <p className="text-muted-foreground text-xs">Il y a 3 jours</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "Post Activity (Real-World)",
  parameters: {
    docs: {
      description: {
        story: "Exemple réaliste simulant l'historique d'activité d'un post : commentaires avec replies, changements de statut avec badge, votes agrégés, et création du post."
      }
    }
  },
  render: () => <Timeline className="max-w-xl">
      {/* Comment with reply thread - sub-connector for nesting */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="default" size="icon">
            <MessageSquareIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 10 minutes</p>
          <Card className="mt-1.5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarFallback>LS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Lilian Saget-Lethias</span>
                <Badge variant="destructive" className="text-[10px]">
                  Propriétaire
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Auteur
                </Badge>
              </div>
              <p className="mt-2 text-sm">Commentaire principal avec du contenu détaillé.</p>
              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                <span>04/03/2026 20:33</span>
                <span>2 réponse(s)</span>
              </div>
            </CardContent>
          </Card>
          {/* Replies with sub-connector - L-hook on last item */}
          <TimelineSubConnector>
            <TimelineSubItem>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">ML</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Marie Leroy</span>
                  </div>
                  <p className="mt-1.5 text-sm">Bonne idée ! +1 pour le filtre par date.</p>
                </CardContent>
              </Card>
            </TimelineSubItem>
            <TimelineSubItem>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">LS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">Lilian Saget-Lethias</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Auteur
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm">Merci, je note ça pour la v2 !</p>
                </CardContent>
              </Card>
            </TimelineSubItem>
          </TimelineSubConnector>
        </TimelineContent>
      </TimelineItem>

      {/* Status change */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" size="icon">
            <CheckIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 2 heures</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Statut changé</p>
            <Badge variant="success">Terminé</Badge>
          </div>
          <p className="text-muted-foreground text-xs">par Admin</p>
        </TimelineContent>
      </TimelineItem>

      {/* Aggregate votes */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="muted" size="icon">
            <ThumbsUpIcon className="size-4" />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 1 jour</p>
          <p className="text-sm">
            <span className="font-semibold">3</span> personnes ont voté
          </p>
        </TimelineContent>
      </TimelineItem>

      {/* Post created */}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="outline" size="icon">
            <StarIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-muted-foreground text-xs">il y a 3 jours</p>
          <p className="text-sm font-medium">Jean a créé le post</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "Dot Sizes",
  render: () => <Timeline className="max-w-md">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Small (8px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="default" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Default (12px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Large (16px)</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="icon">
            <StarIcon className="size-4" />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <p className="text-sm">Icon (32px)</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "Compact (Small Dots)",
  parameters: {
    docs: {
      description: {
        story: "Version compacte avec des petits dots, idéale pour les changelog ou les logs simples."
      }
    }
  },
  render: () => <Timeline className="max-w-sm">
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">v2.4.0 déployé</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">Fix pagination board</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-xs font-medium">Migration Prisma 7</p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem className="pb-4">
        <TimelineSeparator>
          <TimelineDot size="sm" variant="muted" />
        </TimelineSeparator>
        <TimelineContent className="pt-0">
          <p className="text-muted-foreground text-xs">3 commits précédents...</p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
}`,...P.parameters?.docs?.source}}},F=[`Default`,`Playground`,`WithVariants`,`WithIcons`,`PostActivity`,`Sizes`,`Compact`]}))();export{P as Compact,O as Default,k as Playground,M as PostActivity,N as Sizes,j as WithIcons,A as WithVariants,F as __namedExportsOrder,D as default};