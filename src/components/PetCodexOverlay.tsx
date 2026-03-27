import { useEffect, useMemo, useState } from 'react';
import type {
  PetCodex,
  PetCodexChapter,
  PetCodexEntry,
  PetCodexJumpTarget,
  PetCodexRarity,
  PetCodexVisualBlock,
  PetCodexVisualItem,
  PetCodexVisualTone
} from '../lib/petCodex';
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

const MAP_FILTER_ALL = '全部地图';
const TYPE_FILTER_ALL = '全部类型';

interface JumpContext {
  sourceTitle: string;
  sourceLabel?: string;
  targetChapterTitle: string;
  clues: string[];
}

const RARITY_FILTERS: Array<{ id: RarityFilter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'mythic', label: '神话' },
  { id: 'legend', label: '传奇' },
  { id: 'artifact', label: '珍品' },
  { id: 'trophy', label: '战果' },
  { id: 'ember', label: '基础' }
];

function toFileUrl(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const prefixed = /^[A-Za-z]:\//.test(normalized) ? `file:///${normalized}` : `file://${normalized}`;
  return encodeURI(prefixed);
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

function getRarityFilterLabel(rarity: RarityFilter): string {
  return RARITY_FILTERS.find((filter) => filter.id === rarity)?.label ?? '全部';
}

function groupEntries(entries: PetCodexEntry[]) {
  const groups = new Map<string, PetCodexEntry[]>();

  entries.forEach((entry) => {
    const current = groups.get(entry.groupLabel) ?? [];
    current.push(entry);
    groups.set(entry.groupLabel, current);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function findJumpEntry(
  chapter: PetCodexChapter,
  target: PetCodexJumpTarget
): PetCodexEntry | null {
  const filtered = chapter.entries.filter((entry) => {
    const matchesMap = target.mapName ? entry.mapName === target.mapName : true;
    const matchesType = target.typeLabel ? entry.categoryLabel === target.typeLabel : true;
    const matchesHighlight = target.highlightOnly
      ? entry.state === 'glory' || entry.state === 'ready'
      : true;
    const matchesRarity =
      target.rarity && target.rarity !== 'all' ? entry.rarity === target.rarity : true;

    return matchesMap && matchesType && matchesHighlight && matchesRarity;
  });

  if (target.entryId) {
    return (
      filtered.find((entry) => entry.id === target.entryId) ??
      chapter.entries.find((entry) => entry.id === target.entryId) ??
      null
    );
  }

  return filtered[0] ?? chapter.entries[0] ?? null;
}

function formatCompletion(readyCount: number, totalCount: number): string {
  if (totalCount === 0) {
    return '0%';
  }

  return `${Math.round((readyCount / totalCount) * 100)}%`;
}

function buildOverviewCards(
  chapter: PetCodexChapter,
  visibleEntries: PetCodexEntry[]
): Array<{ label: string; value: string; detail: string }> {
  const totalCount = chapter.entries.length;
  const rareCount = chapter.entries.filter(
    (entry) => entry.rarity === 'mythic' || entry.rarity === 'legend'
  ).length;
  const gloryCount = chapter.entries.filter((entry) => entry.state === 'glory').length;
  const visibleGroupCount = new Set(visibleEntries.map((entry) => entry.groupLabel)).size;
  const uniqueMapCount = new Set(
    chapter.entries.map((entry) => entry.mapName).filter(Boolean)
  ).size;
  const latestEntry = chapter.entries[0];
  const nextEntry = chapter.entries.find(
    (entry) => entry.state === 'warming' || entry.state === 'locked'
  );

  if (chapter.id === 'atlas') {
    return [
      {
        label: '总览页签',
        value: `${visibleEntries.length} 页`,
        detail: '地图热区、稀有层级和完成度总表都在这里收口'
      },
      {
        label: '点亮状态',
        value: formatCompletion(chapter.readyCount, totalCount),
        detail: '总览层会跟随战报、成长和陈列实时刷新'
      },
      {
        label: '信息分组',
        value: `${visibleGroupCount} 组`,
        detail: '你可以按总览、地图、稀有和完成度来翻'
      },
      {
        label: '当前焦点',
        value: latestEntry?.title ?? '待生成',
        detail: latestEntry ? latestEntry.subtitle : '等第一批数据写入后这里会变得完整'
      }
    ];
  }

  if (chapter.id === 'chronicle') {
    return [
      {
        label: '收录条目',
        value: `${visibleEntries.length}/${totalCount}`,
        detail: '当前筛选下可翻看的战果数量'
      },
      {
        label: '稀有战果',
        value: `${rareCount} 条`,
        detail: rareCount > 0 ? '神话与传奇掉落会长期留档' : '还在等下一条高亮掉落'
      },
      {
        label: '涉及地图',
        value: `${uniqueMapCount} 张`,
        detail: uniqueMapCount > 0 ? '不同场景会被拆成独立证据脉络' : '等第一张地图写入'
      },
      {
        label: '最新波段',
        value: latestEntry?.groupLabel ?? '待记录',
        detail: latestEntry ? latestEntry.title : '第一条战利品会从这里开始编年'
      }
    ];
  }

  if (chapter.id === 'rewards') {
    return [
      {
        label: '解锁进度',
        value: formatCompletion(chapter.readyCount, totalCount),
        detail: `${chapter.readyCount}/${totalCount} 项奖励已经亮起`
      },
      {
        label: '当前高亮',
        value: gloryCount > 0 ? `${gloryCount} 项` : '待点亮',
        detail: gloryCount > 0 ? '本轮成长演出正在聚焦这些奖励' : '等下一个等级节点触发演出'
      },
      {
        label: '分组浏览',
        value: `${visibleGroupCount} 组`,
        detail: '按状态拆看已解锁、下一件与未解锁轨道'
      },
      {
        label: '下一里程碑',
        value: nextEntry?.title ?? '全部解锁',
        detail: nextEntry ? nextEntry.subtitle : '这条成长轨已经全部点亮'
      }
    ];
  }

  return [
    {
      label: '点亮进度',
      value: formatCompletion(chapter.readyCount, totalCount),
      detail: `${chapter.readyCount}/${totalCount} 项已经进入可陈列状态`
    },
    {
      label: '高亮陈列',
      value: gloryCount > 0 ? `${gloryCount} 项` : '待点亮',
      detail: gloryCount > 0 ? '这些条目正位于当前舞台中心' : '继续陪刷后会点亮新的主陈列'
    },
    {
      label: '稀有条目',
      value: `${rareCount} 项`,
      detail: rareCount > 0 ? '神话与传奇条目会被优先展示' : '目前以基础陈列为主'
    },
    {
      label: '分组视图',
      value: `${visibleGroupCount} 组`,
      detail: latestEntry ? `当前焦点：${latestEntry.title}` : '还没有可展示的焦点条目'
    }
  ];
}

function getVisualToneClass(tone: PetCodexVisualTone | undefined): string {
  return tone ? `tone-${tone}` : 'tone-gold';
}

function getVisualToneColor(tone: PetCodexVisualTone | undefined): string {
  switch (tone) {
    case 'mythic':
      return '#b48cff';
    case 'artifact':
      return '#7abedc';
    case 'ember':
      return '#cf9154';
    case 'gold':
    default:
      return '#f3b05b';
  }
}

function getVisualValueText(visual: PetCodexVisualBlock): string {
  if (typeof visual.value === 'number' && typeof visual.total === 'number') {
    return `${visual.value}/${visual.total}`;
  }

  if (typeof visual.value === 'number') {
    return String(visual.value);
  }

  return '--';
}

function getVisualProgress(visual: PetCodexVisualBlock): number {
  if (typeof visual.value === 'number' && typeof visual.total === 'number' && visual.total > 0) {
    return Math.max(0, Math.min(1, visual.value / visual.total));
  }

  return 0;
}

function getVisualMax(items: PetCodexVisualItem[] | undefined, fallback = 0): number {
  return Math.max(
    fallback,
    ...(items?.map((item) => item.value) ?? [0]),
    1
  );
}

export function PetCodexOverlay(props: PetCodexOverlayProps) {
  const [searchText, setSearchText] = useState('');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [highlightOnly, setHighlightOnly] = useState(false);
  const [mapFilter, setMapFilter] = useState(MAP_FILTER_ALL);
  const [imageFailed, setImageFailed] = useState(false);
  const [jumpContext, setJumpContext] = useState<JumpContext | null>(null);

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

  const availableMaps = useMemo(() => {
    if (!selected) {
      return [MAP_FILTER_ALL];
    }

    return [
      MAP_FILTER_ALL,
      ...Array.from(
        new Set(selected.chapter.entries.map((entry) => entry.mapName).filter(Boolean))
      )
    ] as string[];
  }, [selected]);

  useEffect(() => {
    if (!availableMaps.includes(mapFilter)) {
      setMapFilter(MAP_FILTER_ALL);
    }
  }, [availableMaps, mapFilter]);

  const availableTypes = useMemo(() => {
    if (!selected) {
      return [TYPE_FILTER_ALL];
    }

    return [
      TYPE_FILTER_ALL,
      ...Array.from(new Set(selected.chapter.entries.map((entry) => entry.categoryLabel)))
    ];
  }, [selected]);
  const [typeFilter, setTypeFilter] = useState(TYPE_FILTER_ALL);

  useEffect(() => {
    if (!availableTypes.includes(typeFilter)) {
      setTypeFilter(TYPE_FILTER_ALL);
    }
  }, [availableTypes, typeFilter]);

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
      const matchesType = typeFilter === TYPE_FILTER_ALL ? true : entry.categoryLabel === typeFilter;
      const matchesMap = mapFilter === MAP_FILTER_ALL ? true : entry.mapName === mapFilter;

      return matchesSearch && matchesRarity && matchesHighlight && matchesType && matchesMap;
    });
  }, [highlightOnly, mapFilter, rarityFilter, searchText, selected, typeFilter]);

  const visibleSelectedEntry =
    filteredEntries.find((entry) => entry.id === selected?.entry.id) ?? filteredEntries[0] ?? selected?.entry ?? null;

  useEffect(() => {
    if (!visibleSelectedEntry || visibleSelectedEntry.id === props.selectedEntryId) {
      return;
    }

    props.onSelectEntry(visibleSelectedEntry.id);
  }, [props.onSelectEntry, props.selectedEntryId, visibleSelectedEntry]);

  useEffect(() => {
    setImageFailed(false);
  }, [visibleSelectedEntry?.screenshotPath]);

  const groupedEntries = useMemo(() => groupEntries(filteredEntries), [filteredEntries]);
  const overviewCards = useMemo(
    () => (selected ? buildOverviewCards(selected.chapter, filteredEntries) : []),
    [filteredEntries, selected]
  );
  const hasActiveDrilldownFilters =
    Boolean(jumpContext) &&
    (mapFilter !== MAP_FILTER_ALL ||
      typeFilter !== TYPE_FILTER_ALL ||
      rarityFilter !== 'all' ||
      highlightOnly);
  const drilldownEntries = useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === 'atlas') {
      return [] as PetCodexEntry[];
    }

    return filteredEntries.filter((entry) => {
      const matchesMap = mapFilter === MAP_FILTER_ALL ? true : entry.mapName === mapFilter;
      const matchesType =
        typeFilter === TYPE_FILTER_ALL ? true : entry.categoryLabel === typeFilter;
      const matchesRarity = rarityFilter === 'all' ? true : entry.rarity === rarityFilter;
      const matchesHighlight = highlightOnly
        ? entry.state === 'glory' || entry.state === 'ready'
        : true;

      if (hasActiveDrilldownFilters) {
        return matchesMap && matchesType && matchesRarity && matchesHighlight;
      }

      return entry.id === visibleSelectedEntry?.id;
    });
  }, [
    filteredEntries,
    hasActiveDrilldownFilters,
    highlightOnly,
    jumpContext,
    mapFilter,
    rarityFilter,
    selected,
    typeFilter,
    visibleSelectedEntry?.id
  ]);
  const drilldownEntryIds = useMemo(
    () => new Set(drilldownEntries.map((entry) => entry.id)),
    [drilldownEntries]
  );
  const drilldownFocusSummary = useMemo(() => {
    if (!jumpContext || !selected || selected.chapter.id === 'atlas') {
      return null;
    }

    const focusTags = [
      mapFilter !== MAP_FILTER_ALL ? `地图 · ${mapFilter}` : null,
      typeFilter !== TYPE_FILTER_ALL ? `类型 · ${typeFilter}` : null,
      rarityFilter !== 'all' ? `稀有 · ${getRarityFilterLabel(rarityFilter)}` : null,
      highlightOnly ? '只看点亮项' : null
    ].filter(Boolean) as string[];

    return {
      label: focusTags[0] ?? jumpContext.sourceLabel ?? jumpContext.sourceTitle,
      detail:
        focusTags.length > 1
          ? focusTags.slice(1).join(' · ')
          : hasActiveDrilldownFilters
            ? 'Atlas 图板条件正在持续约束当前列表'
            : '当前焦点跟随这次 Atlas 钻取停留在相关条目上'
    };
  }, [
    hasActiveDrilldownFilters,
    highlightOnly,
    jumpContext,
    mapFilter,
    rarityFilter,
    selected,
    typeFilter
  ]);

  function resetFilters(clearContext = true) {
    setSearchText('');
    setRarityFilter('all');
    setHighlightOnly(false);
    setMapFilter(MAP_FILTER_ALL);
    setTypeFilter(TYPE_FILTER_ALL);
    if (clearContext) {
      setJumpContext(null);
    }
  }

  function handleJumpTarget(
    target: PetCodexJumpTarget,
    sourceTitle: string,
    sourceLabel?: string
  ) {
    const chapter = props.codex.chapters.find((candidate) => candidate.id === target.chapterId);
    if (!chapter) {
      return;
    }

    setSearchText('');
    setRarityFilter(target.rarity ?? 'all');
    setHighlightOnly(Boolean(target.highlightOnly));
    setMapFilter(target.mapName ?? MAP_FILTER_ALL);
    setTypeFilter(target.typeLabel ?? TYPE_FILTER_ALL);

    const nextEntry = findJumpEntry(chapter, target);
    if (nextEntry) {
      const clues = [
        target.mapName ? `地图：${target.mapName}` : null,
        target.typeLabel ? `类型：${target.typeLabel}` : null,
        target.rarity && target.rarity !== 'all'
          ? `稀有：${getRarityFilterLabel(target.rarity)}`
          : null,
        target.highlightOnly ? '只看点亮项' : null
      ].filter(Boolean) as string[];

      setJumpContext({
        sourceTitle,
        sourceLabel,
        targetChapterTitle: chapter.title,
        clues
      });
      props.onSelectEntry(nextEntry.id);
    }
  }

  function handleReturnToAtlas() {
    const atlasChapter = props.codex.chapters.find((chapter) => chapter.id === 'atlas');
    if (!atlasChapter) {
      return;
    }

    resetFilters();
    props.onSelectEntry(atlasChapter.entries[0]?.id ?? props.codex.featuredEntryId);
  }

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
                <span className={`pet-codex-orbit orbit-${index + 1}`} key={`${visibleSelectedEntry.id}-${label}`}>
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
                    resetFilters();
                  }}
                  type="button"
                >
                  <span className="pet-codex-chapter-kicker">{chapter.label}</span>
                  <strong>{chapter.title}</strong>
                  <p>{chapter.summary}</p>
                  <div className="pet-codex-progress">
                    <span className="pet-codex-progress-bar" aria-hidden="true">
                      <span
                        className="pet-codex-progress-fill"
                        style={{
                          width: `${
                            chapter.entries.length > 0
                              ? Math.round((chapter.readyCount / chapter.entries.length) * 100)
                              : 0
                          }%`
                        }}
                      />
                    </span>
                    <span className="pet-codex-progress-text">
                      {chapter.readyCount}/{chapter.entries.length} 已点亮
                    </span>
                  </div>
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

            <section className="pet-codex-overview">
              {overviewCards.map((card) => (
                <article className="pet-codex-overview-card" key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </article>
              ))}
            </section>

            {jumpContext && selected.chapter.id !== 'atlas' ? (
              <article className="pet-codex-jump-context">
                <div className="pet-codex-jump-context-copy">
                  <p className="eyebrow">Atlas Drilldown</p>
                  <strong>
                    来自 {jumpContext.sourceTitle}
                    {jumpContext.sourceLabel ? ` · ${jumpContext.sourceLabel}` : ''}
                  </strong>
                  <p>当前正在 {jumpContext.targetChapterTitle} 中查看由这块图板钻取出的条目。</p>
                  {jumpContext.clues.length > 0 ? (
                    <div className="pet-codex-jump-context-pills">
                      {jumpContext.clues.map((clue) => (
                        <span className="pet-codex-context-pill" key={clue}>
                          {clue}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="pet-codex-jump-context-actions">
                  <button className="ghost-button" onClick={handleReturnToAtlas} type="button">
                    返回总览
                  </button>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      resetFilters();
                    }}
                    type="button"
                  >
                    清除上下文
                  </button>
                </div>
              </article>
            ) : null}

            <div className="pet-codex-toolbar">
              <label className="pet-codex-search">
                <span>搜索条目</span>
                <input
                  onChange={(event) => {
                    setJumpContext(null);
                    setSearchText(event.target.value);
                  }}
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
                    onClick={() => {
                      setJumpContext(null);
                      setRarityFilter(filter.id);
                    }}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
                <button
                  className={highlightOnly ? 'pet-codex-filter-chip active' : 'pet-codex-filter-chip'}
                  onClick={() => {
                    setJumpContext(null);
                    setHighlightOnly((current) => !current);
                  }}
                  type="button"
                >
                  只看点亮项
                </button>
              </div>

              <div className="pet-codex-filter-row">
                {availableTypes.map((typeLabel) => (
                  <button
                    className={
                      typeFilter === typeLabel
                        ? 'pet-codex-filter-chip active'
                        : 'pet-codex-filter-chip'
                    }
                    key={typeLabel}
                    onClick={() => {
                      setJumpContext(null);
                      setTypeFilter(typeLabel);
                    }}
                    type="button"
                  >
                    {typeLabel}
                  </button>
                ))}
              </div>

              {availableMaps.length > 1 ? (
                <div className="pet-codex-filter-row">
                  {availableMaps.map((mapLabel) => (
                    <button
                      className={
                        mapFilter === mapLabel
                          ? 'pet-codex-filter-chip active'
                          : 'pet-codex-filter-chip'
                      }
                      key={mapLabel}
                      onClick={() => {
                        setJumpContext(null);
                        setMapFilter(mapLabel);
                      }}
                      type="button"
                    >
                      {mapLabel}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {jumpContext && selected.chapter.id !== 'atlas' && drilldownFocusSummary ? (
              <article className="pet-codex-drilldown-strip">
                <div className="pet-codex-drilldown-copy">
                  <p className="eyebrow">List Focus</p>
                  <strong>当前列表高亮 · {drilldownFocusSummary.label}</strong>
                  <p>
                    {drilldownFocusSummary.detail}
                    {` · 共 ${drilldownEntries.length} 条焦点条目`}
                  </p>
                </div>
                <span className="mini-pill">
                  {drilldownEntries.length}/{filteredEntries.length} 高亮
                </span>
              </article>
            ) : null}

            <div className="pet-codex-entry-grid">
              {groupedEntries.length > 0 ? (
                groupedEntries.map((group) => {
                  const drilldownCount = group.items.filter((entry) =>
                    drilldownEntryIds.has(entry.id)
                  ).length;

                  return (
                    <section
                      className={
                        drilldownCount > 0 ? 'pet-codex-group is-drilldown' : 'pet-codex-group'
                      }
                      key={group.label}
                    >
                    <div className="pet-codex-group-head">
                      <div className="pet-codex-group-title">
                        <strong>{group.label}</strong>
                        {drilldownCount > 0 ? (
                          <span className="pet-codex-group-context">
                            Atlas 焦点 · {drilldownCount} 条
                          </span>
                        ) : null}
                      </div>
                      <span className="mini-pill">{group.items.length} 条</span>
                    </div>

                    <div className="pet-codex-group-grid">
                      {group.items.map((entry) => (
                        <button
                          className={
                            entry.id === visibleSelectedEntry.id
                              ? `pet-codex-entry active state-${entry.state} rarity-${entry.rarity}${
                                  drilldownEntryIds.has(entry.id) ? ' is-drilldown-match' : ''
                                }`
                              : `pet-codex-entry state-${entry.state} rarity-${entry.rarity}${
                                  drilldownEntryIds.has(entry.id) ? ' is-drilldown-match' : ''
                                }`
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
                  );
                })
              ) : (
                <article className="pet-codex-empty">
                  <strong>这一页暂时没有符合条件的藏品</strong>
                  <p>你可以清空搜索词，或者切回“全部”筛选，看看还有哪些条目已经被桌宠收进收藏册。</p>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      resetFilters();
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

            {visibleSelectedEntry.visuals?.length ? (
              <section className="pet-codex-visuals">
                {visibleSelectedEntry.visuals.map((visual) => {
                  const progress = getVisualProgress(visual);
                  const degrees = Math.round(progress * 360);
                  const toneClass = getVisualToneClass(visual.tone);
                  const toneColor = getVisualToneColor(visual.tone);
                  const maxValue = getVisualMax(visual.items, visual.total ?? 0);

                  return (
                    <article
                      className={`pet-codex-visual ${toneClass} kind-${visual.kind}`}
                      key={`${visibleSelectedEntry.id}-${visual.id}`}
                    >
                      <div className="pet-codex-visual-head">
                        <div>
                          <strong>{visual.title}</strong>
                          <p>{visual.subtitle}</p>
                        </div>
                        <div className="pet-codex-visual-head-actions">
                          {visual.kind === 'meter' ? (
                            <span className="mini-pill">{Math.round(progress * 100)}%</span>
                          ) : null}
                          {visual.target ? (
                            <button
                              className="pet-codex-visual-link"
                              onClick={() => handleJumpTarget(visual.target!, visual.title)}
                              type="button"
                            >
                              跳转
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {visual.kind === 'meter' ? (
                        <div className="pet-codex-meter-panel">
                          <div
                            className="pet-codex-meter"
                            style={{
                              background: `conic-gradient(${toneColor} 0deg ${degrees}deg, rgba(255, 232, 183, 0.08) ${degrees}deg 360deg)`
                            }}
                          >
                            <div className="pet-codex-meter-core">
                              <strong>{Math.round(progress * 100)}%</strong>
                              <span>{getVisualValueText(visual)}</span>
                            </div>
                          </div>

                          {visual.footnote ? (
                            <p className="pet-codex-visual-footnote">{visual.footnote}</p>
                          ) : null}
                        </div>
                      ) : null}

                      {visual.kind === 'bars' && visual.items?.length ? (
                        <div className="pet-codex-bar-list">
                          {visual.items.map((item) =>
                            item.target ? (
                              <button
                                className={`pet-codex-bar-row is-clickable ${getVisualToneClass(item.tone ?? visual.tone)}`}
                                key={`${visual.id}-${item.label}`}
                                onClick={() => handleJumpTarget(item.target!, visual.title, item.label)}
                                type="button"
                              >
                                <div className="pet-codex-bar-copy">
                                  <strong>{item.label}</strong>
                                  <span>{item.detail ?? item.displayValue ?? `${item.value}`}</span>
                                </div>
                                <div className="pet-codex-bar-track">
                                  <span
                                    className="pet-codex-bar-fill"
                                    style={{ width: `${Math.round((item.value / maxValue) * 100)}%` }}
                                  />
                                </div>
                                <span className="pet-codex-bar-value">
                                  {item.displayValue ?? item.value}
                                </span>
                              </button>
                            ) : (
                              <article
                                className={`pet-codex-bar-row ${getVisualToneClass(item.tone ?? visual.tone)}`}
                                key={`${visual.id}-${item.label}`}
                              >
                                <div className="pet-codex-bar-copy">
                                  <strong>{item.label}</strong>
                                  <span>{item.detail ?? item.displayValue ?? `${item.value}`}</span>
                                </div>
                                <div className="pet-codex-bar-track">
                                  <span
                                    className="pet-codex-bar-fill"
                                    style={{ width: `${Math.round((item.value / maxValue) * 100)}%` }}
                                  />
                                </div>
                                <span className="pet-codex-bar-value">
                                  {item.displayValue ?? item.value}
                                </span>
                              </article>
                            )
                          )}
                          {visual.footnote ? (
                            <p className="pet-codex-visual-footnote">{visual.footnote}</p>
                          ) : null}
                        </div>
                      ) : null}

                      {visual.kind === 'segments' && visual.items?.length ? (
                        <div className="pet-codex-segment-panel">
                          <div className="pet-codex-segment-track" aria-hidden="true">
                            {visual.items.map((item) => {
                              const total = visual.items?.reduce((sum, current) => sum + current.value, 0) || 1;
                              const width = item.value > 0 ? Math.max((item.value / total) * 100, 8) : 0;
                              return (
                                <span
                                  className={`pet-codex-segment ${getVisualToneClass(item.tone ?? visual.tone)}`}
                                  key={`${visual.id}-${item.label}`}
                                  style={{ width: `${width}%` }}
                                />
                              );
                            })}
                          </div>

                          <div className="pet-codex-segment-grid">
                            {visual.items.map((item) =>
                              item.target ? (
                                <button
                                  className={`pet-codex-segment-card is-clickable ${getVisualToneClass(item.tone ?? visual.tone)}`}
                                  key={`${visual.id}-${item.label}`}
                                  onClick={() => handleJumpTarget(item.target!, visual.title, item.label)}
                                  type="button"
                                >
                                  <span>{item.label}</span>
                                  <strong>{item.displayValue ?? item.value}</strong>
                                  {item.detail ? <p>{item.detail}</p> : null}
                                </button>
                              ) : (
                                <article
                                  className={`pet-codex-segment-card ${getVisualToneClass(item.tone ?? visual.tone)}`}
                                  key={`${visual.id}-${item.label}`}
                                >
                                  <span>{item.label}</span>
                                  <strong>{item.displayValue ?? item.value}</strong>
                                  {item.detail ? <p>{item.detail}</p> : null}
                                </article>
                              )
                            )}
                          </div>

                          {visual.footnote ? (
                            <p className="pet-codex-visual-footnote">{visual.footnote}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </section>
            ) : null}

            <section className="pet-codex-evidence">
              <div className="pet-codex-evidence-head">
                <strong>证据页</strong>
                <span className="mini-pill">{visibleSelectedEntry.categoryLabel}</span>
              </div>

              {visibleSelectedEntry.screenshotPath && !imageFailed ? (
                <button
                  className="pet-codex-screenshot-frame"
                  onClick={() => props.onOpenPath(visibleSelectedEntry.screenshotPath!)}
                  type="button"
                >
                  <img
                    alt={`${visibleSelectedEntry.title} 截图`}
                    onError={() => setImageFailed(true)}
                    src={toFileUrl(visibleSelectedEntry.screenshotPath)}
                  />
                </button>
              ) : (
                <div className="pet-codex-evidence-empty">
                  <strong>暂时没有可展示的截图</strong>
                  <p>这条藏品目前只有文字记录，后续贴图后这里会自动长出证据页。</p>
                </div>
              )}

              <div className="pet-codex-evidence-grid">
                {visibleSelectedEntry.note ? (
                  <article className="pet-codex-evidence-card">
                    <span>备注</span>
                    <p>{visibleSelectedEntry.note}</p>
                  </article>
                ) : null}
                {visibleSelectedEntry.ocrText ? (
                  <article className="pet-codex-evidence-card">
                    <span>{visibleSelectedEntry.ocrEngine ? `${visibleSelectedEntry.ocrEngine} OCR` : 'OCR 原文'}</span>
                    <p>{visibleSelectedEntry.ocrText}</p>
                  </article>
                ) : null}
                {visibleSelectedEntry.mapName ? (
                  <article className="pet-codex-evidence-card">
                    <span>地图</span>
                    <p>{visibleSelectedEntry.mapName}</p>
                  </article>
                ) : null}
                {visibleSelectedEntry.capturedAt ? (
                  <article className="pet-codex-evidence-card">
                    <span>记录时间</span>
                    <p>{visibleSelectedEntry.capturedAt}</p>
                  </article>
                ) : null}
              </div>
            </section>

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
