import { useEffect, useMemo } from 'react';
import type {
  PetCodex,
  PetCodexChapter,
  PetCodexEntry
} from '../lib/petCodex';

interface PetCodexOverlayProps {
  codex: PetCodex;
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  onClose: () => void;
  onOpenDrops: () => void;
  onOpenWorkshop: () => void;
}

function findEntry(
  codex: PetCodex,
  entryId: string | null
): { chapter: PetCodexChapter; entry: PetCodexEntry } | null {
  for (const chapter of codex.chapters) {
    const entry = chapter.entries.find((candidate) => candidate.id === entryId);
    if (entry) {
      return { chapter, entry };
    }
  }

  return null;
}

function getEntryAction(
  entry: PetCodexEntry,
  onOpenDrops: () => void,
  onOpenWorkshop: () => void,
  onClose: () => void
): { label: string; action: () => void } {
  if (entry.chapterId === 'chronicle') {
    return { label: '去战报翻记录', action: onOpenDrops };
  }

  if (entry.chapterId === 'rewards') {
    return { label: '去工坊补联调', action: onOpenWorkshop };
  }

  return { label: '回到桌宠主页', action: onClose };
}

export function PetCodexOverlay(props: PetCodexOverlayProps) {
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        props.onClose();
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [props.onClose]);

  const selected =
    findEntry(props.codex, props.selectedEntryId) ??
    findEntry(props.codex, props.codex.featuredEntryId);

  const action = useMemo(
    () =>
      selected
        ? getEntryAction(selected.entry, props.onOpenDrops, props.onOpenWorkshop, props.onClose)
        : null,
    [props.onClose, props.onOpenDrops, props.onOpenWorkshop, selected]
  );

  if (!selected) {
    return null;
  }

  return (
    <div
      aria-label="赫拉迪姆收藏册"
      className="pet-codex-overlay"
      role="dialog"
      onClick={props.onClose}
    >
      <div className="pet-codex-shell" onClick={(event) => event.stopPropagation()}>
        <div className="pet-codex-glow codex-glow-a" aria-hidden="true" />
        <div className="pet-codex-glow codex-glow-b" aria-hidden="true" />

        <header className="pet-codex-head">
          <div className="pet-codex-copy">
            <p className="eyebrow">Codex</p>
            <strong>{props.codex.title}</strong>
            <p>{props.codex.subtitle}</p>
          </div>

          <div className="pet-codex-head-actions">
            <span className="pet-codex-badge">{props.codex.badge}</span>
            <button className="icon-button" onClick={props.onClose} type="button">
              收起
            </button>
          </div>
        </header>

        <section className="pet-codex-metrics">
          {props.codex.metrics.map((metric) => (
            <article className="pet-codex-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </section>

        <div className="pet-codex-layout">
          <aside className="pet-codex-sidebar">
            {props.codex.chapters.map((chapter) => {
              const active = chapter.id === selected.chapter.id;
              return (
                <button
                  className={active ? 'pet-codex-chapter active' : 'pet-codex-chapter'}
                  key={chapter.id}
                  onClick={() => props.onSelectEntry(chapter.entries[0]?.id ?? props.codex.featuredEntryId)}
                  type="button"
                >
                  <span className="pet-codex-chapter-kicker">{chapter.label}</span>
                  <strong>{chapter.title}</strong>
                  <p>{chapter.summary}</p>
                  <span className="mini-pill">
                    {chapter.readyCount}/{chapter.entries.length} 已亮
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="pet-codex-entry-list">
            <div className="pet-codex-entry-list-head">
              <div>
                <p className="eyebrow">Entries</p>
                <strong>{selected.chapter.title}</strong>
              </div>
              <span className="mini-pill">{selected.chapter.entries.length} 条</span>
            </div>

            <div className="pet-codex-entry-grid">
              {selected.chapter.entries.map((entry) => (
                <button
                  className={
                    entry.id === selected.entry.id
                      ? `pet-codex-entry active state-${entry.state}`
                      : `pet-codex-entry state-${entry.state}`
                  }
                  key={entry.id}
                  onClick={() => props.onSelectEntry(entry.id)}
                  type="button"
                >
                  <span className="pet-room-kicker">{entry.accent}</span>
                  <strong>{entry.title}</strong>
                  <p>{entry.subtitle}</p>
                </button>
              ))}
            </div>
          </section>

          <article className={`pet-codex-detail state-${selected.entry.state}`}>
            <div className="pet-codex-detail-head">
              <div>
                <p className="eyebrow">Detail</p>
                <strong>{selected.entry.title}</strong>
                <p>{selected.entry.subtitle}</p>
              </div>
              <span className="pet-codex-detail-badge">{selected.entry.accent}</span>
            </div>

            <div className="pet-codex-detail-copy">
              <p>{selected.entry.detail}</p>
              <p>{selected.entry.meta}</p>
            </div>

            <div className="pet-codex-detail-actions">
              {action ? (
                <button className="primary-button" onClick={action.action} type="button">
                  {action.label}
                </button>
              ) : null}
              <button className="ghost-button" onClick={props.onClose} type="button">
                继续翻看别的
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
