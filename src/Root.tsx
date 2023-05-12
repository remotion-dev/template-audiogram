import { staticFile } from 'remotion';
import { Composition } from 'remotion';
import { myCompSchema2, AudiogramComposition } from './Composition';
import { myCompSchema, PromoComposition } from './PromoComposition';
import './style.css';

const fps = 30;
const durationInFrames = 29.5 * fps;

export const RemotionRoot: React.FC = () => {
	const AUDIO_START = 6.9; // Seconds
	return (
		<>
			<Composition
				id="Promo"
				component={PromoComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1280}
				height={720}
				schema={myCompSchema}
				defaultProps={{
					taglineText: 'Make your podcast clip with ' as const,
					brandName: 'Remotion' as const,
					color1: 'rgba(251, 176, 14, 0.93)' as const,
					color2: 'rgba(11, 132, 243, 0.93)' as const,
				}}
			/>

			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1080}
				schema={myCompSchema2}
				defaultProps={{
					titleText:
						'#234 – Money, Kids, and Choosing Your Market with Justin Jackson of Transistor.fm' as const,
					color1: 'rgba(251, 176, 14, 0.93)' as const,
					audioOffsetInFrames: Math.round(AUDIO_START * fps),
					source: staticFile('subtitles.srt'),
				}}
			/>
		</>
	);
};
