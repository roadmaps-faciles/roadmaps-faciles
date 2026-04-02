"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@roadmaps-faciles/ui/components/card";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roadmaps-faciles/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type Webhook } from "@/prisma/client";

import { createWebhook, deleteWebhook } from "./actions";

interface WebhooksListProps {
  webhooks: Webhook[];
}

export const WebhooksList = ({ webhooks: initialWebhooks }: WebhooksListProps) => {
  const t = useTranslations("domainAdmin.webhooks");
  const tc = useTranslations("common");
  const locale = useLocale();
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);

  const events = [
    { label: t("eventPostCreated"), value: "post.created" },
    { label: t("eventPostStatusChanged"), value: "post.status_changed" },
    { label: t("eventCommentCreated"), value: "comment.created" },
    { label: t("eventLikeAdded"), value: "like.added" },
    { label: t("eventInvitationAccepted"), value: "invitation.accepted" },
  ];

  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [newUrl, setNewUrl] = useState("");
  const [newEvent, setNewEvent] = useState(events[0].value);

  const handleCreate = async () => {
    const result = await createWebhook({ url: newUrl, event: newEvent });
    if (result.ok && result.data) {
      setWebhooks([...webhooks, result.data]);
      setNewUrl("");
      setNewEvent(events[0].value);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(tc("areYouSure"))) return;
    const result = await deleteWebhook({ id });
    if (result.ok) {
      setWebhooks(webhooks.filter(w => w.id !== id));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        {webhooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("url")}</TableHead>
                <TableHead>{t("event")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map(webhook => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <code className="text-sm">{webhook.url}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{webhook.event}</Badge>
                  </TableCell>
                  <TableCell>{dateFormatter.format(new Date(webhook.createdAt))}</TableCell>
                  <TableCell>
                    <Button variant="secondary" size="sm" onClick={() => void handleDelete(webhook.id)}>
                      {tc("delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Alert>
            <AlertTitle>{t("noWebhooks")}</AlertTitle>
            <AlertDescription>{t("noWebhooksDescription")}</AlertDescription>
          </Alert>
        )}
      </div>

      <Card className="sticky top-8 h-fit">
        <CardHeader>
          <CardTitle>{t("addWebhook")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">{t("url")}</Label>
            <Input
              id="webhook-url"
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              autoComplete="off"
              name="url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-event">{t("event")}</Label>
            <Select value={newEvent} onValueChange={setNewEvent}>
              <SelectTrigger id="webhook-event">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => void handleCreate()} disabled={!newUrl} className="w-full">
            {tc("create")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
