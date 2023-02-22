import { staticFile } from 'remotion';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AudiogramComposition } from './Composition';

export const PromoComposition = () => {
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
					/>
				</div>
			</div>
			<div className="free-template">Free Template</div>
			<div className="description">
				Add your own audio, subtitles and cover. Or make your own design with
				CSS.
			</div>
			<div className="tagline">
				Make your podcast clip with{' '}
				<span className="remotion-blue">Remotion</span>
			</div>
		</div>
	);
};
