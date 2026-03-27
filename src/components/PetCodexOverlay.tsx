import { useEffect, useMemo } from 'react';
import { playPetChime } from '../lib/petSound';
import type {
  PetCodex,
  PetCodexChapter,
  PetCodexEntry,
  PetCodexRarity
} from '../lib/petCodex';

interface PetCodexOverlayProps {
  codex: PetCodex;
  selectedEntryId: string | null;
  soundEnabled: boolean;
  onSelectEntry: (entryId: string) => void;
  onClose: () => void;
  onOpenDrops: () => void;
  onOpenWorkshop: () => void;
  onOpenPath: (targetPath: string) => void;
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

function getRarityLabel(rarity: PetCodexRarity): string {
  switch (rarity) {
    case 'mythic':
      return 'Mythic';
    case 'legend':
      return 'Legend';
    case 'artifact':
      return 'Artifact';
    case 'trophy':
      return 'Trophy';
    case 'ember':
      return 'Ember';
  }
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

  useEffect(() => {
    if (!props.soundEnabled || !selected) {
      return;
    }

    if (selected.entry.rarity === 'mythic' || selected.entry.rarity === 'legend') {
      playPetChime('rare');
      return;
    }

    if (selected.entry.state === 'glory') {
      playPetChime('unlock');
    }
  }, [props.soundEnabled, selected?.entry.id]);

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
        <div className={`pet-codex-sigil-burst rarity-${selected.entry.rarity}`} aria-hidden="true" />

        <header className="pet-codex-head">
          <div className="pet-codex-copy">
            <p className="eyebrow">Codex</p>
            <strong>{props.codex.title}</strong>
            <p>{props.codex.subtitle}</p>
          </div>

          <div className="pet-codex-head-actions">
            <span className={`pet-codex-badge rarity-${selected.entry.rarity}`}>{props.codex.badge}</span>
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

        <article className={`pet-codex-story rarity-${selected.entry.rarity} state-${selected.entry.state}`}>
          <div className="pet-codex-story-sigil">
            <span className="pet-codex-story-rarity">{getRarityLabel(selected.entry.rarity)}</span>
            <strong>{selected.entry.sigil}</strong>
          </div>

          <div className="pet-codex-story-copy">
            <div className="pet-codex-story-head">
              <span className="pet-codex-detail-badge">{selected.entry.accent}</span>
              <span className="mini-pill">{selected.chapter.label}</span>
            </div>

            <strong>{selected.entry.storyTitle}</strong>
            <p>{selected.entry.storyLead}</p>

            <div className="pet-codex-chip-row">
              {selected.entry.chips.map((chip) => (
                <span className="pet-codex-chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>

            <div className="pet-codex-facts">
              {selected.entry.facts.map((fact) => (
                <article className="pet-codex-fact" key={`${selected.entry.id}-${fact.label}`}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </article>

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
                      ? `pet-codex-entry active state-${entry.state} rarity-${entry.rarity}`
                      : `pet-codex-entry state-${entry.state} rarity-${entry.rarity}`
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

          <article className={`pet-codex-detail state-${selected.entry.state} rarity-${selected.entry.rarity}`}>
            <div className="pet-codex-detail-head">
              <div>
                <p className="eyebrow">Detail</p>
                <strong>{selected.entry.title}</strong>
                <p>{selected.entry.subtitle}</p>
              </div>
              <span className={`pet-codex-detail-badge rarity-${selected.entry.rarity}`}>
                {selected.entry.accent}
              </span>
            </div>

            <div className="pet-codex-detail-copy">
              <p>{selected.entry.detail}</p>
              <p>{selected.entry.meta}</p>
            </div>

            <div className="pet-codex-detail-actions">
              {selected.entry.screenshotPath ? (
                <button
                  className="ghost-button"
                  onClick={() => props.onOpenPath(selected.entry.screenshotPath!)}
                  type="button"
                >
                  打开战利品截图
                </button>
              ) : null}
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
