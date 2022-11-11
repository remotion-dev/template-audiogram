import { Composition } from 'remotion';
import { AudiogramComposition } from './Composition';
import { PromoComposition } from './PromoComposition';
import './style.css';

const fps = 30;
const durationInFrames = 30 * fps;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1080}
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
