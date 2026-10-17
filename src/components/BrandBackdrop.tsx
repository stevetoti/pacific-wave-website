import Image from 'next/image';
interface Props { tone?: 'brand' | 'commerce' | 'coastal' | 'learning' }
export default function BrandBackdrop({ tone = 'brand' }: Props) {
  return <div className="pwd-brand-backdrop" aria-hidden="true"><Image src={`/images/custom/${tone}.webp`} alt="" fill sizes="100vw" priority className="object-cover" /><div /></div>;
}
