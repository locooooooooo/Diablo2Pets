import { useEffect, useMemo, useState } from 'react';
import type { PetCodex, PetCodexChapter, PetCodexEntry, PetCodexRarity } from '../lib/petCodex';
import { playPetChime } from '../lib/petSound';

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

type RarityFilter = 'all' | PetCodexRarity;

const RARITY_FILTERS: Array<{ id: RarityFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'mythic', label: '神话' },
  { id: 'legend', label: '传奇' },
  { id: 'artifact', label: '珍品' },
  { id: 'trophy', label: '战果' },
  { id: 'ember', label: '基础' }
];

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
  const [searchText, setSearchText] = useState('');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [highlightOnly, setHighlightOnly] = useState(false);

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

  const filteredEntries = useMemo(() => {
    if (!selected) {
      return [];
    }

    const normalizedSearch = searchText.trim().toLowerCase();

    return selected.chapter.entries.filter((entry) => {
      const matchesSearch = normalizedSearch
        ? entry.searchableText.includes(normalizedSearch)
        : true;
      const matchesRarity = rarityFilter === 'all' ? true : entry.rarity === rarityFilter;
      const matchesHighlight = highlightOnly ? entry.state === 'glory' || entry.state === 'ready' : true;

      return matchesSearch && matchesRarity && matchesHighlight;
    });
  }, [highlightOnly, rarityFilter, searchText, selected]);

  const visibleSelectedEntry =
    filteredEntries.find((entry) => entry.id === selected?.entry.id) ?? filteredEntries[0] ?? selected?.entry ?? null;

  useEffect(() => {
    if (!visibleSelectedEntry || visibleSelectedEntry.id === props.selectedEntryId) {
      return;
    }

    props.onSelectEntry(visibleSelectedEntry.id);
  }, [props, visibleSelectedEntry]);

  const action = useMemo(
    () =>
      visibleSelectedEntry
        ? getEntryAction(
            visibleSelectedEntry,
            props.onOpenDrops,
            props.onOpenWorkshop,
            props.onClose
          )
        : null,
    [props.onClose, props.onOpenDrops, props.onOpenWorkshop, visibleSelectedEntry]
  );

  useEffect(() => {
    if (!props.soundEnabled || !visibleSelectedEntry) {
      return;
    }

    if (visibleSelectedEntry.rarity === 'mythic' || visibleSelectedEntry.rarity === 'legend') {
      playPetChime('rare');
      return;
    }

    if (visibleSelectedEntry.state === 'glory') {
      playPetChime('unlock');
    }
  }, [props.soundEnabled, visibleSelectedEntry?.id]);

  if (!selected || !visibleSelectedEntry) {
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
        <div className={`pet-codex-sigil-burst rarity-${visibleSelectedEntry.rarity}`} aria-hidden="true" />

        <header className="pet-codex-head">
          <div className="pet-codex-copy">
            <p className="eyebrow">Codex</p>
            <strong>{props.codex.title}</strong>
            <p>{props.codex.subtitle}</p>
          </div>

          <div className="pet-codex-head-actions">
            <span className={`pet-codex-badge rarity-${visibleSelectedEntry.rarity}`}>{props.codex.badge}</span>
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

        <article
          className={`pet-codex-story rarity-${visibleSelectedEntry.rarity} state-${visibleSelectedEntry.state}`}
        >
          <div className="pet-codex-story-sigil">
            <span className="pet-codex-story-rarity">{getRarityLabel(visibleSelectedEntry.rarity)}</span>

            <div className={`pet-codex-portrait rarity-${visibleSelectedEntry.rarity}`}>
              <span className="pet-codex-portrait-ring ring-a" />
              <span className="pet-codex-portrait-ring ring-b" />
              <span className="pet-codex-portrait-core">{visibleSelectedEntry.illustration.monogram}</span>
              {visibleSelectedEntry.illustration.orbitLabels.map((label, index) => (
                <span
                  className={`pet-codex-orbit orbit-${index + 1}`}
                  key={`${visibleSelectedEntry.id}-${label}`}
                >
                  {label}
                </span>
              ))}
            </div>

            <strong>{visibleSelectedEntry.sigil}</strong>
            <p>{visibleSelectedEntry.illustration.title}</p>
          </div>

          <div className="pet-codex-story-copy">
            <div className="pet-codex-story-head">
              <span className={`pet-codex-detail-badge rarity-${visibleSelectedEntry.rarity}`}>
                {visibleSelectedEntry.accent}
              </span>
              <span className="mini-pill">{selected.chapter.label}</span>
            </div>

            <strong>{visibleSelectedEntry.storyTitle}</strong>
            <p>{visibleSelectedEntry.storyLead}</p>

            <div className="pet-codex-badge-row">
              {visibleSelectedEntry.badges.map((badge) => (
                <span className="pet-codex-medal" key={`${visibleSelectedEntry.id}-${badge}`}>
                  {badge}
                </span>
              ))}
            </div>

            <div className="pet-codex-chip-row">
              {visibleSelectedEntry.chips.map((chip) => (
                <span className="pet-codex-chip" key={`${visibleSelectedEntry.id}-${chip}`}>
                  {chip}
                </span>
              ))}
            </div>

            <div className="pet-codex-facts">
              {visibleSelectedEntry.facts.map((fact) => (
                <article className="pet-codex-fact" key={`${visibleSelectedEntry.id}-${fact.label}`}>
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
                  onClick={() => {
                    props.onSelectEntry(chapter.entries[0]?.id ?? props.codex.featuredEntryId);
                    setSearchText('');
                    setRarityFilter('all');
                    setHighlightOnly(false);
                  }}
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
              <span className="mini-pill">{filteredEntries.length} 条可见</span>
            </div>

            <div className="pet-codex-toolbar">
              <label className="pet-codex-search">
                <span>搜索条目</span>
                <input
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="搜索掉落、地图、徽章或奖励名"
                  type="text"
                  value={searchText}
                />
              </label>

              <div className="pet-codex-filter-row">
                {RARITY_FILTERS.map((filter) => (
                  <button
                    className={
                      rarityFilter === filter.id
                        ? 'pet-codex-filter-chip active'
                        : 'pet-codex-filter-chip'
                    }
                    key={filter.id}
                    onClick={() => setRarityFilter(filter.id)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
                <button
                  className={highlightOnly ? 'pet-codex-filter-chip active' : 'pet-codex-filter-chip'}
                  onClick={() => setHighlightOnly((current) => !current)}
                  type="button"
                >
                  只看点亮项
                </button>
              </div>
            </div>

            <div className="pet-codex-entry-grid">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <button
                    className={
                      entry.id === visibleSelectedEntry.id
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
                ))
              ) : (
                <article className="pet-codex-empty">
                  <strong>这一页暂时没有符合条件的藏品</strong>
                  <p>你可以清空搜索词或切回“全部”筛选，看看还有哪些条目已经被桌宠收进收藏册。</p>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      setSearchText('');
                      setRarityFilter('all');
                      setHighlightOnly(false);
                    }}
                    type="button"
                  >
                    清空筛选
                  </button>
                </article>
              )}
            </div>
          </section>

          <article
            className={`pet-codex-detail state-${visibleSelectedEntry.state} rarity-${visibleSelectedEntry.rarity}`}
          >
            <div className="pet-codex-detail-head">
              <div>
                <p className="eyebrow">Detail</p>
                <strong>{visibleSelectedEntry.title}</strong>
                <p>{visibleSelectedEntry.subtitle}</p>
              </div>
              <span className={`pet-codex-detail-badge rarity-${visibleSelectedEntry.rarity}`}>
                {visibleSelectedEntry.accent}
              </span>
            </div>

            <div className="pet-codex-detail-copy">
              <p>{visibleSelectedEntry.detail}</p>
              <p>{visibleSelectedEntry.meta}</p>
            </div>

            <div className="pet-codex-detail-actions">
              {visibleSelectedEntry.screenshotPath ? (
                <button
                  className="ghost-button"
                  onClick={() => props.onOpenPath(visibleSelectedEntry.screenshotPath!)}
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
