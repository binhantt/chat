"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Callout, Flex } from "@radix-ui/themes";
import {
  createConductRule,
  deleteConductRule,
  getConductRules,
  updateConductRule,
  type ConductRule,
} from "@/features/athu";
import {
  ConductCreateForm,
  ConductHeader,
  ConductRulesPanel,
  ConductStatGrid,
  ConductToolbar,
  type ConductStatusFilter,
} from "@/features/admin/components/conduct";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function ConductClientView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pendingRuleIds, setPendingRuleIds] = useState<Set<string>>(() => new Set());
  const [phrase, setPhrase] = useState("");
  const [rules, setRules] = useState<ConductRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConductStatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const page = await getConductRules({ limit: 10 });
      setRules(page.items);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách luật ứng xử");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreRules = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const page = await getConductRules({ cursor: nextCursor, limit: 10 });
      setRules((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thêm luật ứng xử");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchRules();
    });
  }, [fetchRules]);

  const filteredRules = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesSearch =
        !keyword ||
        rule.phrase.toLowerCase().includes(keyword) ||
        (rule.note ?? "").toLowerCase().includes(keyword) ||
        rule.id.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && rule.isActive) ||
        (statusFilter === "inactive" && !rule.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedSearch, rules, statusFilter]);

  const activeCount = useMemo(() => rules.filter((rule) => rule.isActive).length, [rules]);

  const handleCreate = async () => {
    if (!phrase.trim()) {
      setError("Nhập nội dung vi phạm trước khi thêm luật");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createConductRule({ note, phrase });
      setPhrase("");
      setNote("");
      setCreateOpen(false);
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo luật ứng xử");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ConductRule, checked: boolean) => {
    if (pendingRuleIds.has(rule.id)) return;

    const previousRules = rules;

    setError(null);
    setPendingRuleIds((current) => new Set(current).add(rule.id));
    setRules((current) => current.map((item) => (item.id === rule.id ? { ...item, isActive: checked } : item)));

    try {
      const updated = await updateConductRule(rule.id, { isActive: checked });
      setRules((current) => current.map((item) => (item.id === rule.id ? { ...item, ...updated, isActive: checked } : item)));
    } catch (err) {
      setRules(previousRules);
      setError(err instanceof Error ? err.message : "Không thể cập nhật luật ứng xử");
    } finally {
      setPendingRuleIds((current) => {
        const next = new Set(current);
        next.delete(rule.id);
        return next;
      });
    }
  };

  const handleDelete = async (rule: ConductRule) => {
    const confirmed = window.confirm(`Xóa luật "${rule.phrase}"?`);
    if (!confirmed) return;

    setError(null);

    try {
      await deleteConductRule(rule.id);
      setRules((current) => current.filter((item) => item.id !== rule.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa luật ứng xử");
    }
  };

  return (
    <Flex direction="column" gap="5">
      <ConductHeader loading={loading} onAddRule={() => setCreateOpen(true)} onRefresh={fetchRules} />

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <ConductStatGrid active={activeCount} inactive={rules.length - activeCount} total={rules.length} />
      <ConductToolbar
        filteredCount={filteredRules.length}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        search={search}
        status={statusFilter}
        totalCount={rules.length}
      />
      <ConductCreateForm
        note={note}
        onCreate={handleCreate}
        onNoteChange={setNote}
        onOpenChange={setCreateOpen}
        onPhraseChange={setPhrase}
        open={createOpen}
        phrase={phrase}
        saving={saving}
      />
      <ConductRulesPanel
        filteredCount={filteredRules.length}
        loading={loading}
        loadingMore={loadingMore}
        nextCursor={nextCursor}
        onDelete={handleDelete}
        onLoadMore={fetchMoreRules}
        onToggle={handleToggle}
        pendingRuleIds={pendingRuleIds}
        rules={filteredRules}
        totalCount={rules.length}
      />
    </Flex>
  );
}
