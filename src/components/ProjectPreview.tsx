import Image from 'next/image';

interface Props { slug: string; name: string; compact?: boolean; priority?: boolean }
export default function ProjectPreview({ slug, name, compact = false, priority = false }: Props) {
  const artwork = slug === 'aelan-basket' ? 'commerce' : slug === 'pwd-training-centre' ? 'learning' : 'coastal';
  return (
    <figure className={`pwd-project-preview ${compact ? 'pwd-project-preview-compact' : ''}`}>
      <div className="pwd-device-stage">
        <Image src={`/images/custom/${artwork}.webp`} alt="" fill sizes="(max-width: 767px) 100vw, 65vw" className="pwd-stage-art" />
        <div className="pwd-browser-window">
          <div className="pwd-browser-bar" aria-hidden="true"><span /><span /><span /><div>{name}</div></div>
          <Image src={`/images/projects/${slug}-desktop.webp`} alt={`${name} website homepage on desktop`} width={1440} height={1000} sizes={compact ? '(max-width: 767px) 90vw, 44vw' : '(max-width: 767px) 90vw, 65vw'} priority={priority} className="pwd-desktop-capture" />
        </div>
        <div className="pwd-phone-window">
          <div className="pwd-phone-speaker" aria-hidden="true" />
          <Image src={`/images/projects/${slug}-mobile.webp`} alt={`${name} website homepage on mobile`} width={390} height={844} sizes="(max-width: 767px) 25vw, 180px" className="pwd-mobile-capture" />
        </div>
      </div>
      {!compact ? <figcaption>Desktop and mobile homepage previews · October 2026</figcaption> : null}
    </figure>
  );
}
