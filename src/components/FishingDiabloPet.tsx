import type { PetFishingCatch } from '../lib/petFishing';

interface FishingDiabloPetProps {
  propLabel: string;
  highlightDropName: string;
  fishingCatch: PetFishingCatch | null;
  floating?: boolean;
}

export function FishingDiabloPet(props: FishingDiabloPetProps) {
  const tierClass = props.fishingCatch ? `tier-${props.fishingCatch.tier}` : '';

  return (
    <>
      <div className="pet-ring pet-ring-outer" />
      <div className="pet-ring pet-ring-inner" />

      <div aria-hidden="true" className="pet-diablo-wings">
        <span className="pet-diablo-wing wing-left" />
        <span className="pet-diablo-wing wing-right" />
      </div>

      <div className="pet-core pet-diablo-core">
        <span className="pet-diablo-horn horn-left" />
        <span className="pet-diablo-horn horn-right" />
        <span className="pet-diablo-brow brow-left" />
        <span className="pet-diablo-brow brow-right" />
        <span className="pet-diablo-body" />
        <span className="pet-diablo-cheek cheek-left" />
        <span className="pet-diablo-cheek cheek-right" />
        <span className="pet-diablo-mouth" />
        <div className="pet-eyes">
          <span />
          <span />
        </div>
      </div>

      <span aria-hidden="true" className="pet-diablo-tail" />

      <div aria-hidden="true" className="pet-fishing-scene">
        <span className="pet-fishing-rod" />
        <span className={`pet-fishing-line ${props.fishingCatch ? 'is-catching' : ''}`} />
        <span className={`pet-fishing-bobber ${props.fishingCatch ? 'is-catching' : ''}`} />
        <span className="pet-fishing-pond" />
        <span className="pet-fishing-ripple ripple-a" />
        <span className="pet-fishing-ripple ripple-b" />
      </div>

      <span className={`pet-prop-badge ${props.floating ? 'floating-prop-badge' : ''}`}>
        {props.propLabel}
      </span>

      {props.highlightDropName ? <div className="pet-spark" /> : null}

      {props.fishingCatch ? (
        <>
          <div className={`pet-rune-catch ${tierClass}`}>
            <span className="pet-rune-sigil">{props.fishingCatch.runeShort}</span>
            <span className="pet-rune-label">{props.fishingCatch.runeLabel}</span>
          </div>
          <div className={`pet-blessing-chip ${tierClass}`}>
            {props.fishingCatch.miniBlessing}
          </div>
        </>
      ) : null}
    </>
  );
}
