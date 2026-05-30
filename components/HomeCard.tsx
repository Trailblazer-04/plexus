import React from "react";
import Image from "next/image";

type Variant = "orange" | "blue" | "purple" | "yellow";

interface HomeCardProps {
  img: string;
  title: string;
  description: string;
  handleClick: () => void;
  variant?: Variant;
}

const variants: Record<Variant, {
  card: string;
  icon: string;
  bar: string;
  dot: string;
}> = {
  orange: {
    card: "hover:border-orange-500/40 hover:shadow-orange-500/5",
    icon: "bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/15",
    bar: "bg-orange-500",
    dot: "bg-orange-400",
  },
  blue: {
    card: "hover:border-blue-500/40 hover:shadow-blue-500/5",
    icon: "bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/15",
    bar: "bg-blue-500",
    dot: "bg-blue-400",
  },
  purple: {
    card: "hover:border-purple-500/40 hover:shadow-purple-500/5",
    icon: "bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/15",
    bar: "bg-purple-500",
    dot: "bg-purple-400",
  },
  yellow: {
    card: "hover:border-yellow-500/40 hover:shadow-yellow-500/5",
    icon: "bg-yellow-500/10 border-yellow-500/20 group-hover:bg-yellow-500/15",
    bar: "bg-yellow-500",
    dot: "bg-yellow-400",
  },
};

const HomeCard = ({
  img,
  title,
  description,
  handleClick,
  variant = "blue",
}: HomeCardProps) => {
  const v = variants[variant];

  return (
    <button
      onClick={handleClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-left shadow-xl transition-all duration-200 hover:bg-white/[0.05] hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${v.card}`}
      style={{ minHeight: "160px" }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
        style={{ background: "currentColor" }}
      />

      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${v.icon}`}>
          <Image src={img} alt={title} width={20} height={20} />
        </div>
        <span className={`mt-1 h-2 w-2 rounded-full opacity-60 ${v.dot}`} />
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-[14px] font-semibold leading-tight text-white">
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-white/35">
            {description}
          </p>
        </div>

        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className={`h-full w-0 rounded-full transition-all duration-300 group-hover:w-full ${v.bar}`} />
        </div>
      </div>
    </button>
  );
};

export default HomeCard;