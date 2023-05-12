import React from 'react';
import { staticFile } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AudiogramComposition } from './Composition';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

export const myCompSchema = z.object({
	taglineText: z.string(),
	brandName: z.string(),
	color1: zColor(),
	color2: zColor(),
});

export const PromoComposition: React.FC<z.infer<typeof myCompSchema>> = ({
	taglineText: titleText,
	color1,
	color2,
}) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<div className="promo-container">
			<div
				className="promo-composition"
				style={{
					width: 1080,
					height: 1080,
					transform: `scale(0.5) rotate(${
						-3 + 2 * Math.sin(3 * (frame / fps))
					}deg)`,
				}}
			>
				<div>
					<AudiogramComposition
						audioOffsetInFrames={2000}
						source={staticFile('subtitles.srt')}
						titleText={titleText}
						color1={color1}
					/>
				</div>
			</div>
			<div className="free-template">Free Template</div>
			<div className="description">
				Add your own audio, subtitles and cover. Or make your own design with
				CSS.
			</div>
			<div className="tagline" style={{ color: color1 }}>
				{titleText}
				<span style={{ color: color2 }}>Remotion</span>
			</div>
		</div>
	);
};
