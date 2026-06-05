import React from 'react';

interface CFHandleProps {
  handle: string;
  rating?: number;
  rank?: string;
}

export function CFHandle({ handle, rating, rank }: CFHandleProps) {
  // If no rating/rank data, return basic gray
  if (!rating || !rank) {
    return <span className="text-[#888888] font-semibold font-mono">{handle}</span>;
  }

  let color = '#888888'; // unrated
  if (rating < 1200) color = '#808080'; // newbie
  else if (rating < 1400) color = '#008000'; // pupil
  else if (rating < 1600) color = '#03a89e'; // specialist
  else if (rating < 1900) color = '#0000ff'; // expert
  else if (rating < 2100) color = '#aa00aa'; // candidate master
  else if (rating < 2300) color = '#ff8c00'; // master
  else if (rating < 2400) color = '#ff8c00'; // international master
  else color = '#ff0000'; // grandmaster+

  const isLegendary = rating >= 3000;

  return (
    <span className="font-semibold font-mono" style={{ color }}>
      {isLegendary ? (
        <>
          <span className="text-black">{handle.charAt(0)}</span>
          {handle.slice(1)}
        </>
      ) : (
        handle
      )}
    </span>
  );
}
