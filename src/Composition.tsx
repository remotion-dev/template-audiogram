import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import React, { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	Img,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import audioSource from './assets/audio.mp3';
import coverImg from './assets/cover.jpg';
import { LINE_HEIGHT, PaginatedSubtitles } from './Subtitles';

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
		numberOfSamples: 256, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const visualization = allVisualizationValues.slice(8, 30);

	const mirrored = [...visualization.slice(1).reverse(), ...visualization];

	return (
		<div className="audio-viz">
			{mirrored.map((v, i) => {
				return (
					<div
						key={i}
						className="bar"
						style={{
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

export const AudiogramComposition: React.FC<{
	source: string;
	audioOffsetInFrames: number;
}> = ({ source, audioOffsetInFrames }) => {
	const { durationInFrames } = useVideoConfig();

	const [handle] = useState(() => delayRender());
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch(source)
			.then((res) => res.text())
			.then((text) => {
				setSubtitles(text);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Error fetching subtitles', err);
			});
	}, [handle, source]);

	if (!subtitles) {
		return null;
	}

	return (
		<div ref={ref}>
			<AbsoluteFill>
				<Sequence from={-audioOffsetInFrames}>
					<Audio src={audioSource} />

					<div
						className="container"
						style={{
							fontFamily: 'IBM Plex Sans',
						}}
					>
						<div className="row">
							<Img className="cover" src={coverImg} />

							<div className="title">
								#234 – Money, Kids, and Choosing Your Market with Justin Jackson
								of Transistor.fm
							</div>
						</div>

						<div>
							<AudioViz />
						</div>

						<div
							style={{ lineHeight: `${LINE_HEIGHT}px` }}
							className="captions"
						>
							<PaginatedSubtitles
								subtitles={subtitles}
								startFrame={audioOffsetInFrames}
								endFrame={audioOffsetInFrames + durationInFrames}
								linesPerPage={4}
							/>
						</div>
					</div>
				</Sequence>
			</AbsoluteFill>
		</div>
	);
};
