import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AudiogramComposition } from './Composition';

export const PromoComposition = () => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<div className="w-full h-full bg-gray-700">
			<div
				className="absolute left-36 -top-20 shadow-lg overflow-hidden rounded-xl"
				style={{
					width: 1080,
					height: 1080,
					transform: `scale(0.5) rotate(${
						-3 + 2 * Math.sin(3 * (frame / fps))
					}deg)`,
				}}
			>
				<div className="rounded-full">
					<AudiogramComposition />;
				</div>
			</div>
			<div className="transform-gpu font-extrabold text-gray-500 text-2xl filter drop-shadow-xl w-64 absolute top-1 left-3">
				Free Template
			</div>
			<div className="transform-gpu leading-none font-normal text-gray-500 text-md filter drop-shadow-xl w-52 absolute top-10 left-3">
				Add your own audio, subtitles and cover. Or make your own design with
				TailwindCSS.
			</div>
			<div className="transform-gpu font-extrabold text-yellow-400 text-4xl filter drop-shadow-xl w-64 absolute top-28 left-3">
				Make your podcast clip with{' '}
				<span className="text-blue-400">Remotion</span>
			</div>
		</div>
	);
};
