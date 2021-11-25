import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import {
	Audio,
	Easing,
	Img,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import audioSource from './assets/audio.mp3';
import coverImg from './assets/cover.jpg';
import subtitlesSource from './assets/subtitles.srt';
import { PaginatedSubtitles } from './Subtitles';

const AudioViz = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const audioData = useAudioData(audioSource);

	if (!audioData) {
		return null;
	}

	const allVisualizationValues = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples: 256, // use more samples to get a nicer visualisation
	});

	// pick the low values because they look nicer than high values
	// feel free to play around :)
	const visualization = allVisualizationValues.slice(8, 30);

	const mirrored = [...visualization.slice(1).reverse(), ...visualization];

	return (
		<div className="flex flex-row h-16 items-center justify-center gap-1">
			{mirrored.map((v) => {
				return (
					<div
						className="w-1 bg-yellow-300 rounded"
						style={{
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

export const AudiogramComposition = () => {
	const { durationInFrames } = useVideoConfig();

	// change this to adjust the part of the audio to use
	const offset = 2000;

	return (
		<Sequence from={-offset}>
			<Audio src={audioSource} />

			<div
				className="flex flex-col w-full h-full text-white p-4 bg-black"
				style={{
					fontFamily: 'IBM Plex Sans',
				}}
			>
				<div className="flex flex-row">
					<Img className="rounded-lg" src={coverImg} />

					<div className="ml-4 leading-tight font-extrabold text-gray-700">
						#234 – Money, Kids, and Choosing Your Market with Justin Jackson of
						Transistor.fm
					</div>
				</div>

				<div className="mt-4">
					<AudioViz />
				</div>

				<div className="mt-2 text-2xl font-semibold">
					<PaginatedSubtitles
						src={subtitlesSource}
						startFrame={offset}
						endFrame={offset + durationInFrames}
						linesPerPage={4}
						renderSubtitleItem={(item, frame) => (
							<>
								<span
									style={{
										backfaceVisibility: 'hidden',
										display: 'inline-block',

										opacity: interpolate(
											frame,
											[item.start, item.start + 15],
											[0, 1],
											{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
										),
										transform: `perspective(1000px) translateY(${interpolate(
											frame,
											[item.start, item.start + 15],
											[0.5, 0],
											{
												easing: Easing.out(Easing.quad),
												extrapolateLeft: 'clamp',
												extrapolateRight: 'clamp',
											}
										)}em)`,
									}}
								>
									{item.text}
								</span>{' '}
							</>
						)}
					/>
				</div>
			</div>
		</Sequence>
	);
};
