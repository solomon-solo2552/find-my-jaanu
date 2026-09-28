"use client";

import clsx from "clsx";
import { Interest } from "@/lib/profiles";

interface Props {
  interests: Interest[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  max?: number;
  min?: number;
}

export function InterestPicker({
  interests,
  selectedIds,
  onChange,
  max = 10,
  min = 3,
}: Props) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  };

  const count = selectedIds.length;
  const hint =
    count < min
      ? `Pick at least ${min} (${count}/${min})`
      : count >= max
      ? `Max reached (${max})`
      : `${count} selected`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">What are you into?</p>
        <span
          className={clsx(
            "text-xs font-medium",
            count < min ? "text-orange-600" : "text-green-600"
          )}
        >
          {hint}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const selected = selectedIds.includes(interest.id);
          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggle(interest.id)}
              className={clsx(
                "px-3 py-1.5 rounded-full border text-sm font-medium transition",
                selected
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-pink-400"
              )}
            >
              <span className="mr-1">{interest.emoji}</span>
              {interest.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}