import { staticFile } from 'remotion';
import { Composition } from 'remotion';
import { AudiogramComposition } from './Composition';
import { PromoComposition } from './PromoComposition';
import './style.css';

const fps = 30;
const durationInFrames = 29.5 * fps;

export const RemotionRoot: React.FC = () => {
	const AUDIO_START = 6.9; // Seconds
	return (
		<>
			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1080}
				defaultProps={{
					audioOffsetInFrames: Math.round(AUDIO_START * fps),
					source: staticFile('subtitles.srt'),
				}}
			/>
			<Composition
				id="Promo"
				component={PromoComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1280}
				height={720}
			/>
		</>
	);
};
