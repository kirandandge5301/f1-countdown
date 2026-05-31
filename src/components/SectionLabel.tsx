interface SectionLabelProps {
  text: string;
}

export default function SectionLabel({ text }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
      <span className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
        {text}
      </span>
    </div>
  );
}
